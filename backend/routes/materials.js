const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');
const {
  createMaterial,
  getMaterials,
  getMaterial,
  deleteMaterial,
  generateMaterialSummary,
  generateMaterialFlashcards,
  generateMaterialQuiz
} = require('../controllers/materialController');

router.post('/', auth, upload.single('file'), createMaterial);
router.get('/', auth, getMaterials);
router.get('/:id', auth, getMaterial);
router.delete('/:id', auth, deleteMaterial);
router.post('/:id/summary', auth, generateMaterialSummary);
router.post('/:id/flashcards', auth, generateMaterialFlashcards);
router.post('/:id/quiz', auth, generateMaterialQuiz);

module.exports = router;
