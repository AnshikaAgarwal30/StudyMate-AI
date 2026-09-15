const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getFlashcards,
  getFlashcard,
  deleteFlashcard,
  getFlashcardsByMaterial
} = require('../controllers/flashcardController');

router.get('/', auth, getFlashcards);
router.get('/:id', auth, getFlashcard);
router.delete('/:id', auth, deleteFlashcard);
router.get('/material/:materialId', auth, getFlashcardsByMaterial);

module.exports = router;
