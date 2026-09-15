const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getQuizzes,
  getQuiz,
  submitQuizAttempt,
  getQuizAttempts,
  getQuizAttempt
} = require('../controllers/quizController');

router.get('/', auth, getQuizzes);
router.get('/attempts', auth, getQuizAttempts);
router.get('/attempts/:id', auth, getQuizAttempt);
router.get('/:id', auth, getQuiz);
router.post('/:id/attempt', auth, submitQuizAttempt);

module.exports = router;
