const { Router } = require('express');
const QuizController = require('../controllers/quiz.controller');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = Router();

// AI generation
router.post('/generate', authenticate, QuizController.generate);
router.post('/regenerate-question', authenticate, QuizController.regenerateQuestion);

// Quizzes CRUD
router.post('/', authenticate, QuizController.create);
router.get('/', authenticate, QuizController.list);
router.get('/:id', optionalAuth, QuizController.getById);
router.put('/:id', authenticate, QuizController.update);
router.delete('/:id', authenticate, QuizController.delete);

module.exports = router;
