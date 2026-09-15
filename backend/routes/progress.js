const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getProgress,
  getSubjectPerformance,
  getRevisionRecommendations
} = require('../controllers/progressController');

router.get('/', auth, getProgress);
router.get('/subject-performance', auth, getSubjectPerformance);
router.get('/revision', auth, getRevisionRecommendations);

module.exports = router;
