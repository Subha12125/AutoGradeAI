const { Router } = require('express');
const SessionController = require('../controllers/session.controller');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = Router();

// Host endpoints
router.post('/', authenticate, SessionController.create);
router.post('/:id/start', authenticate, SessionController.start);
router.post('/:id/pause', authenticate, SessionController.pause);
router.post('/:id/next', authenticate, SessionController.next);
router.post('/:id/end', authenticate, SessionController.end);

// Lookup & participant endpoints
router.get('/by-code/:code', optionalAuth, SessionController.getByCode);
router.get('/:id', optionalAuth, SessionController.getById);
router.post('/:id/join', optionalAuth, SessionController.join);
router.post('/:id/answer', optionalAuth, SessionController.submitAnswer);
router.get('/:id/leaderboard', optionalAuth, SessionController.getLeaderboard);
router.get('/:id/results', optionalAuth, SessionController.getResults);

module.exports = router;
