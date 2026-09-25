const { Router } = require('express');
const authRoutes = require('./auth.routes');
const examRoutes = require('./exam.routes');
const evaluateRoutes = require('./evaluate.routes');
const resultsRoutes = require('./results.routes');
const quotaRoutes = require('./quota.routes');
const analyticsRoutes = require('./analytics.routes');
const quizRoutes = require('./quiz.routes');
const sessionRoutes = require('./session.routes');
const GeminiService = require('../services/geminiService');
const ExamModel = require('../models/exam.model');
const logger = require('../utils/logger');

const router = Router();

router.use('/auth', authRoutes);
router.use('/exams', examRoutes);
router.use('/evaluate', evaluateRoutes);
router.use('/results', resultsRoutes);
router.use('/quota', quotaRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/quizzes', quizRoutes);
router.use('/sessions', sessionRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Gemini API health check
router.get('/health/gemini', async (req, res, next) => {
  try {
    const testPrompt = 'Hello, respond with "OK" if you can read this.';
    const response = await GeminiService.evaluate(testPrompt, []);
    logger.info('Gemini API health check passed');
    res.json({ 
      status: 'ok', 
      gemini: true,
      response: response.substring(0, 100)
    });
  } catch (err) {
    logger.error('Gemini API health check failed', { error: err.message });
    res.status(500).json({ 
      status: 'error', 
      gemini: false,
      error: err.message 
    });
  }
});

// Diagnostic endpoint for failed exams
router.get('/diagnostics/exam/:examId', async (req, res, next) => {
  try {
    const exam = await ExamModel.findById(req.params.examId);
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    res.json({
      examId: exam.id,
      title: exam.title,
      subject: exam.subject,
      totalMarks: exam.total_marks,
      status: exam.status,
      hasRubric: !!exam.rubric && exam.rubric.length > 0,
      rubricLength: exam.rubric?.length || 0,
      questionsCount: (exam.questions || []).length,
      hasQuestionPaper: (exam.questions || []).some(q => q.type === 'extracted_text'),
      questionPaperLength: (exam.questions || []).find(q => q.type === 'extracted_text')?.text?.length || 0,
      createdAt: exam.created_at,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
