const QuizModel = require('../models/quiz.model');
const QuizGeneratorService = require('../services/quizGeneratorService');
const QuizValidatorService = require('../services/quizValidatorService');
const logger = require('../utils/logger');

const QuizController = {
  /**
   * AI Quiz Generation
   * POST /api/quizzes/generate
   */
  async generate(req, res, next) {
    try {
      const {
        topic,
        learningObjectives,
        educationalLevel,
        questionCount,
        difficulty,
        questionTypes,
        timeLimit,
        additionalInstructions,
      } = req.body;

      if (!topic || topic.trim() === '') {
        return res.status(400).json({ error: 'Topic is required to generate a quiz' });
      }

      const result = await QuizGeneratorService.generateQuiz({
        topic: topic.trim(),
        learningObjectives,
        educationalLevel,
        questionCount,
        difficulty,
        questionTypes,
        timeLimit,
        additionalInstructions,
      });

      res.json({
        success: true,
        quiz: result.quiz,
        validationReport: result.validationReport,
      });
    } catch (err) {
      logger.error('Quiz generation error:', err.message);
      next(err);
    }
  },

  /**
   * AI Single Question Regeneration
   * POST /api/quizzes/regenerate-question
   */
  async regenerateQuestion(req, res, next) {
    try {
      const { topic, questionIndex, preferredType, difficultyLevel, learningObjective } = req.body;

      if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
      }

      const question = await QuizGeneratorService.regenerateSingleQuestion({
        topic,
        questionIndex: parseInt(questionIndex, 10) || 0,
        preferredType: preferredType || 'MCQ',
        difficultyLevel: parseInt(difficultyLevel, 10) || 2,
        learningObjective,
      });

      if (!question) {
        return res.status(500).json({ error: 'Failed to regenerate question' });
      }

      res.json({ success: true, question });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Create & Publish Quiz
   * POST /api/quizzes
   */
  async create(req, res, next) {
    try {
      const teacherId = req.user.id;
      const { title, description, topic, difficulty, status, settings, questions } = req.body;

      const validation = QuizValidatorService.validateQuiz({
        title,
        description,
        topic,
        difficulty,
        questions,
      });

      if (!validation.isValid) {
        return res.status(400).json({
          error: 'Quiz validation failed',
          details: validation.errors,
          questionErrors: validation.questionErrors,
        });
      }

      const created = await QuizModel.create({
        teacherId,
        title: validation.sanitizedQuiz.title,
        description: validation.sanitizedQuiz.description,
        topic: validation.sanitizedQuiz.topic,
        difficulty: validation.sanitizedQuiz.difficulty,
        status: status || 'published',
        settings: settings || {},
        questions: validation.sanitizedQuiz.questions,
      });

      res.status(201).json({ success: true, quiz: created });
    } catch (err) {
      next(err);
    }
  },

  /**
   * List all quizzes for the authenticated teacher
   * GET /api/quizzes
   */
  async list(req, res, next) {
    try {
      const teacherId = req.user.id;
      const quizzes = await QuizModel.findByTeacher(teacherId);
      res.json({ success: true, quizzes });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get single quiz
   * GET /api/quizzes/:id
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const quiz = await QuizModel.findById(id);

      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      // Check if user is host or student
      const isHost = req.user && req.user.id === quiz.teacher_id;

      if (!isHost) {
        // Strip correct answers if viewed by unauthenticated/student request
        const sanitized = {
          ...quiz,
          questions: (quiz.questions || []).map((q) => {
            const { correct_answer, explanation, ...rest } = q;
            return rest;
          }),
        };
        return res.json({ success: true, quiz: sanitized });
      }

      res.json({ success: true, quiz });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update quiz
   * PUT /api/quizzes/:id
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const quiz = await QuizModel.findById(id);

      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      if (quiz.teacher_id !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized to modify this quiz' });
      }

      const { title, description, topic, difficulty, status, settings, questions } = req.body;

      const updated = await QuizModel.update(id, {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(topic && { topic }),
        ...(difficulty && { difficulty }),
        ...(status && { status }),
        ...(settings && { settings }),
      });

      if (questions && Array.isArray(questions)) {
        await QuizModel.saveQuestions(id, questions);
      }

      const fullUpdated = await QuizModel.findById(id);
      res.json({ success: true, quiz: fullUpdated });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Delete quiz
   * DELETE /api/quizzes/:id
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const quiz = await QuizModel.findById(id);

      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      if (quiz.teacher_id !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized to delete this quiz' });
      }

      await QuizModel.delete(id);
      res.json({ success: true, message: 'Quiz deleted successfully' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = QuizController;
