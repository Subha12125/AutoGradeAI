const GeminiService = require('./geminiService');
const PdfService = require('./pdfService');
const EvaluationModel = require('../models/evaluation.model');
const StudentModel = require('../models/student.model');
const ResultModel = require('../models/result.model');
const ExamModel = require('../models/exam.model');
const { buildEvaluationPrompt } = require('../utils/promptBuilder');
const { parseEvaluationResponse, extractStudentInfo } = require('../utils/parser');
const logger = require('../utils/logger');
const { EventEmitter } = require('events');

// Global event emitter for SSE progress updates
const evaluationEvents = new EventEmitter();
evaluationEvents.setMaxListeners(50); // Support many concurrent SSE connections

/**
 * Simple concurrency limiter — runs async tasks with a max parallelism.
 * No external dependency needed.
 */
function pLimit(concurrency) {
  const queue = [];
  let activeCount = 0;

  const next = () => {
    activeCount--;
    if (queue.length > 0) {
      queue.shift()();
    }
  };

  return (fn) => new Promise((resolve, reject) => {
    const run = async () => {
      activeCount++;
      try {
        const result = await fn();
        resolve(result);
      } catch (err) {
        reject(err);
      } finally {
        next();
      }
    };

    if (activeCount < concurrency) {
      run();
    } else {
      queue.push(run);
    }
  });
}

const CONCURRENCY_LIMIT = 2; // Process 2 answer sheets in parallel to stay safely within free/tier-1 RPM limits

const EvaluationService = {
  /** Expose event emitter for SSE consumers */
  events: evaluationEvents,

  /**
   * Process a batch of answer sheets for an exam.
   * Uses parallel processing with concurrency limit for speed.
   * @param {string} examId - Exam ID
   * @param {Array} answerFiles - Array of multer file objects
   */
  async processBatch(examId, answerFiles) {
    const exam = await ExamModel.findById(examId);
    if (!exam) throw new Error('Exam not found');

    // Validate exam has required data
    if (!exam.rubric || exam.rubric.trim() === '') {
      logger.warn(`Exam ${examId} has no rubric. Evaluation may fail.`);
    }

    if (!exam.questions || exam.questions.length === 0) {
      logger.warn(`Exam ${examId} has no questions. Evaluation may fail.`);
    }

    const previousStatus = exam.status;
    await ExamModel.updateStatus(examId, 'evaluating');

    const results = [];
    const errors = [];
    const total = answerFiles.length;
    let completedCount = 0;

    // Emit initial progress
    evaluationEvents.emit(`progress:${examId}`, {
      type: 'batch_start',
      examId,
      total,
      completed: 0,
      progress: 0,
    });

    // Create concurrency-limited executor
    const limit = pLimit(CONCURRENCY_LIMIT);
    const batchStart = Date.now();

    // Launch evaluations with controlled concurrency and staggering to respect RPM quotas
    const promises = answerFiles.map((file, index) =>
      limit(async () => {
        const studentInfo = extractStudentInfo(file.originalname);
        try {
          if (index > 0) {
            // Stagger parallel uploads so all requests don't hit the API at the exact same second
            await new Promise(r => setTimeout(r, Math.min(index * 2000, 6000)));
          }
          logger.info(`[${index + 1}/${total}] Starting evaluation: ${file.originalname}`);
          const result = await this.evaluateSingle(exam, file);
          results.push(result);

          completedCount++;
          evaluationEvents.emit(`progress:${examId}`, {
            type: 'student_complete',
            examId,
            total,
            completed: completedCount,
            failed: errors.length,
            progress: Math.round(((completedCount + errors.length) / total) * 100),
            student: {
              name: studentInfo.name,
              rollNumber: studentInfo.rollNumber,
              status: 'completed',
              marksAwarded: result.marksAwarded,
            },
          });

          logger.info(`[${completedCount + errors.length}/${total}] Completed: ${file.originalname}`);
          return { status: 'fulfilled', value: result };
        } catch (err) {
          logger.error(`Failed to evaluate ${file.originalname}`, { error: err.message, stack: err.stack });
          errors.push({ file: file.originalname, error: err.message });

          evaluationEvents.emit(`progress:${examId}`, {
            type: 'student_failed',
            examId,
            total,
            completed: completedCount,
            failed: errors.length,
            progress: Math.round(((completedCount + errors.length) / total) * 100),
            student: {
              name: studentInfo.name,
              rollNumber: studentInfo.rollNumber,
              status: 'failed',
              error: err.message,
            },
          });

          return { status: 'rejected', reason: err.message };
        }
      })
    );

    // Wait for all to complete (they won't throw because we catch inside)
    await Promise.all(promises);

    // Clean up uploaded files
    PdfService.cleanup(answerFiles.map((f) => f.path));

    // Determine final status considering existing evaluations
    let finalStatus;
    if (results.length > 0) {
      // At least one new file succeeded
      finalStatus = 'completed';
    } else if (previousStatus === 'completed') {
      // All new files failed but exam had previous results
      finalStatus = 'completed';
    } else {
      finalStatus = 'failed';
    }
    await ExamModel.updateStatus(examId, finalStatus);

    // Emit completion event
    evaluationEvents.emit(`progress:${examId}`, {
      type: 'batch_complete',
      examId,
      total,
      completed: results.length,
      failed: errors.length,
      progress: 100,
      finalStatus,
    });

    const batchDuration = ((Date.now() - batchStart) / 1000).toFixed(1);
    logger.info(`Batch complete in ${batchDuration}s: ${results.length} succeeded, ${errors.length} failed. Final status: ${finalStatus}`, {
      examId,
      totalFiles: answerFiles.length,
      successCount: results.length,
      failureCount: errors.length,
      durationSeconds: batchDuration,
    });

    return {
      examId,
      total: answerFiles.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors,
    };
  },

  /**
   * Evaluate a single answer sheet.
   */
  async evaluateSingle(exam, file) {
    const studentInfo = extractStudentInfo(file.originalname);

    // Create or get student record
    const student = await StudentModel.upsert({
      rollNumber: studentInfo.rollNumber,
      name: studentInfo.name,
      examId: exam.id,
    });

    // Create evaluation record
    const evaluation = await EvaluationModel.create({
      examId: exam.id,
      studentId: student.id,
      status: 'processing',
    });

    try {
      // Convert answer sheet to base64
      const images = await PdfService.filesToBase64([file.path]);

      // Build prompt
      const prompt = buildEvaluationPrompt({
        subject: exam.subject,
        totalMarks: exam.total_marks,
        questions: exam.questions || [],
        rubric: exam.rubric,
      });

      logger.info(`Evaluating ${file.originalname}: subject=${exam.subject}, totalMarks=${exam.total_marks}`);

      // Call Gemini
      const rawResponse = await GeminiService.evaluate(prompt, images);
      logger.info(`Received response for ${file.originalname} (${rawResponse.length} chars)`);

      const parsed = parseEvaluationResponse(rawResponse);

      if (!parsed.success) {
        logger.error(`Failed to parse response for ${file.originalname}: ${parsed.error}`);
        throw new Error(`Response parsing failed: ${parsed.error}`);
      }

      // Store result
      const result = await ResultModel.create({
        examId: exam.id,
        studentId: student.id,
        evaluationId: evaluation.id,
        questionResults: parsed.data.studentAnswers,
        totalMarksAwarded: parsed.data.totalMarksAwarded,
        totalMaxMarks: parsed.data.totalMaxMarks,
        overallFeedback: parsed.data.overallFeedback,
      });

      // Mark evaluation complete
      await EvaluationModel.updateWithResults(evaluation.id, {
        results: parsed.data,
        totalMarks: parsed.data.totalMarksAwarded,
        feedback: parsed.data.overallFeedback,
        status: 'completed',
      });

      logger.info(`Evaluated ${file.originalname}: ${parsed.data.totalMarksAwarded}/${parsed.data.totalMaxMarks}`);

      return {
        student: studentInfo,
        marksAwarded: parsed.data.totalMarksAwarded,
        maxMarks: parsed.data.totalMaxMarks,
        resultId: result.id,
      };
    } catch (err) {
      logger.error(`Evaluation error for ${file.originalname}`, {
        error: err.message,
        studentName: studentInfo.name,
        rollNumber: studentInfo.rollNumber,
        examId: exam.id,
        stack: err.stack,
      });

      await EvaluationModel.updateWithResults(evaluation.id, {
        results: null,
        totalMarks: 0,
        feedback: `Error: ${err.message}`,
        status: 'failed',
      });
      throw err;
    }
  },
};

module.exports = EvaluationService;
