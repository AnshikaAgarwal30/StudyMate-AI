const Flashcard = require('../models/Flashcard');
const StudyMaterial = require('../models/StudyMaterial');

const getFlashcards = async (req, res) => {
  try {
    const { material, topic, difficulty, search } = req.query;
    const query = { user: req.user._id };

    if (material) {
      query.material = material;
    }

    if (topic) {
      query.topic = topic;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (search) {
      query.question = { $regex: search, $options: 'i' };
    }

    const flashcards = await Flashcard.find(query)
      .populate('material', 'title subject')
      .sort({ createdAt: -1 });

    res.json(flashcards);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getFlashcard = async (req, res) => {
  try {
    const flashcard = await Flashcard.findById(req.params.id).populate('material');

    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard not found' });
    }

    if (flashcard.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this flashcard' });
    }

    res.json(flashcard);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteFlashcard = async (req, res) => {
  try {
    const flashcard = await Flashcard.findById(req.params.id);

    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard not found' });
    }

    if (flashcard.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this flashcard' });
    }

    await flashcard.deleteOne();

    res.json({ message: 'Flashcard deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getFlashcardsByMaterial = async (req, res) => {
  try {
    const { topic, difficulty } = req.query;
    const query = { 
      user: req.user._id,
      material: req.params.materialId 
    };

    if (topic) {
      query.topic = topic;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    const flashcards = await Flashcard.find(query).sort({ createdAt: -1 });

    res.json(flashcards);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getFlashcards,
  getFlashcard,
  deleteFlashcard,
  getFlashcardsByMaterial
};
