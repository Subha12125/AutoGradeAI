const { Router } = require('express');
const { startEvaluation, getEvaluationStatus, streamEvaluationProgress } = require('../controllers/evaluate.controller');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = Router();

router.use(authenticate);

router.post('/', upload.array('answerSheets', 50), startEvaluation);
router.get('/status/:examId', getEvaluationStatus);
router.get('/stream/:examId', streamEvaluationProgress);

module.exports = router;

