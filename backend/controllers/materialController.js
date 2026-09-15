const StudyMaterial = require('../models/StudyMaterial');
const Flashcard = require('../models/Flashcard');
const Quiz = require('../models/Quiz');

const {
  extractTextFromPDF,
  extractTextFromTXT,
  cleanText,
  chunkText
} = require('../services/pdfService');

const {
  generateSummary,
  generateFlashcards,
  generateQuiz
} = require('../services/aiService');

const fs = require('fs');
const path = require('path');


// ======================================================
// CREATE MATERIAL
// ======================================================

const createMaterial = async (req, res) => {
  try {
    const { title, subject, notes } = req.body;
    const file = req.file;

    if (!title || !subject) {
      return res.status(400).json({
        message: 'Title and subject are required'
      });
    }

    let originalText = '';
    let type = 'notes';
    let fileName = null;

    if (file) {
      fileName = file.filename;

      const filePath = path.join(
        __dirname,
        '../uploads',
        file.filename
      );

      if (file.mimetype === 'application/pdf') {
        originalText = await extractTextFromPDF(filePath);
        type = 'pdf';

      } else if (file.mimetype === 'text/plain') {
        originalText = await extractTextFromTXT(filePath);
        type = 'txt';
      }

    } else if (notes) {
      originalText = notes;
      type = 'notes';

    } else {
      return res.status(400).json({
        message: 'Either file or notes are required'
      });
    }

    if (!originalText || originalText.trim().length === 0) {
      return res.status(400).json({
        message:
          'No content could be extracted from the provided source'
      });
    }

    originalText = cleanText(originalText);

    const material = await StudyMaterial.create({
      user: req.user._id,
      title,
      subject,
      type,
      originalText,
      fileName
    });

    res.status(201).json(material);

  } catch (error) {
    console.error('Error creating material:', error);

    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};


// ======================================================
// GET ALL MATERIALS
// ======================================================

const getMaterials = async (req, res) => {
  try {
    const { search, subject } = req.query;

    const query = {
      user: req.user._id
    };

    if (search) {
      query.title = {
        $regex: search,
        $options: 'i'
      };
    }

    if (subject) {
      query.subject = subject;
    }

    // IMPORTANT:
    // Do NOT populate flashcardCount / quizCount.
    // They are calculated below using countDocuments().
    const materials = await StudyMaterial.find(query)
      .sort({ createdAt: -1 });

    const materialsWithCounts = await Promise.all(
      materials.map(async (material) => {

        const flashcardCount =
          await Flashcard.countDocuments({
            material: material._id
          });

        const quizCount =
          await Quiz.countDocuments({
            material: material._id
          });

        return {
          ...material.toObject(),
          flashcardCount,
          quizCount
        };
      })
    );

    res.json(materialsWithCounts);

  } catch (error) {
    console.error('Error getting materials:', error);

    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};


// ======================================================
// GET SINGLE MATERIAL
// ======================================================

const getMaterial = async (req, res) => {
  try {
    const material =
      await StudyMaterial.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        message: 'Material not found'
      });
    }

    if (
      material.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: 'Not authorized to access this material'
      });
    }

    const flashcardCount =
      await Flashcard.countDocuments({
        material: material._id
      });

    const quizCount =
      await Quiz.countDocuments({
        material: material._id
      });

    res.json({
      ...material.toObject(),
      flashcardCount,
      quizCount
    });

  } catch (error) {
    console.error('Error getting material:', error);

    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};


// ======================================================
// DELETE MATERIAL
// ======================================================

const deleteMaterial = async (req, res) => {
  try {
    const material =
      await StudyMaterial.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        message: 'Material not found'
      });
    }

    if (
      material.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message:
          'Not authorized to delete this material'
      });
    }

    // Delete uploaded file
    if (material.fileName) {
      const filePath = path.join(
        __dirname,
        '../uploads',
        material.fileName
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete related flashcards and quizzes
    await Flashcard.deleteMany({
      material: material._id
    });

    await Quiz.deleteMany({
      material: material._id
    });

    await material.deleteOne();

    res.json({
      message: 'Material deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting material:', error);

    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};


// ======================================================
// GENERATE SUMMARY
// ======================================================

const generateMaterialSummary = async (req, res) => {
  try {
    const material =
      await StudyMaterial.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        message: 'Material not found'
      });
    }

    if (
      material.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message:
          'Not authorized to access this material'
      });
    }

    const chunks =
      chunkText(material.originalText);

    let summary = '';

    for (const chunk of chunks) {
      const chunkSummary =
        await generateSummary(chunk);

      summary += chunkSummary + '\n\n';
    }

    material.summary = summary.trim();

    await material.save();

    res.json({
      summary: material.summary
    });

  } catch (error) {
    console.error(
      'Error generating summary:',
      error
    );

    res.status(500).json({
      message: 'Failed to generate summary',
      error: error.message
    });
  }
};


// ======================================================
// GENERATE FLASHCARDS
// ======================================================

const generateMaterialFlashcards = async (req, res) => {
  try {
    const {
      count = 10,
      difficulty = 'Medium'
    } = req.body;

    const material =
      await StudyMaterial.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        message: 'Material not found'
      });
    }

    if (
      material.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message:
          'Not authorized to access this material'
      });
    }

    const chunks =
      chunkText(material.originalText);

    let allFlashcards = [];

    for (const chunk of chunks) {

      const chunkCount =
        Math.ceil(count / chunks.length);

      const chunkFlashcards =
        await generateFlashcards(
          chunk,
          chunkCount,
          difficulty
        );

      allFlashcards = [
        ...allFlashcards,
        ...chunkFlashcards
      ];
    }

    allFlashcards =
      allFlashcards.slice(0, count);

    const flashcards =
      await Flashcard.insertMany(
        allFlashcards.map(card => ({
          user: req.user._id,
          material: material._id,
          question: card.question,
          answer: card.answer,
          topic: card.topic,
          difficulty: card.difficulty
        }))
      );

    res.json(flashcards);

  } catch (error) {
    console.error(
      'Error generating flashcards:',
      error
    );

    res.status(500).json({
      message: 'Failed to generate flashcards',
      error: error.message
    });
  }
};


// ======================================================
// GENERATE QUIZ
// ======================================================

const generateMaterialQuiz = async (req, res) => {
  try {
    const {
      count = 10,
      difficulty = 'Medium'
    } = req.body;

    const material =
      await StudyMaterial.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        message: 'Material not found'
      });
    }

    if (
      material.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message:
          'Not authorized to access this material'
      });
    }

    const chunks =
      chunkText(material.originalText);

    let allQuestions = [];

    for (const chunk of chunks) {

      const chunkCount =
        Math.ceil(count / chunks.length);

      const chunkQuestions =
        await generateQuiz(
          chunk,
          chunkCount,
          difficulty
        );

      allQuestions = [
        ...allQuestions,
        ...chunkQuestions
      ];
    }

    allQuestions =
      allQuestions.slice(0, count);

    const quiz = await Quiz.create({
      user: req.user._id,
      material: material._id,
      title: `${material.title} Quiz`,
      difficulty,
      questions: allQuestions
    });

    res.json(quiz);

  } catch (error) {
    console.error(
      'Error generating quiz:',
      error
    );

    res.status(500).json({
      message: 'Failed to generate quiz',
      error: error.message
    });
  }
};


// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  createMaterial,
  getMaterials,
  getMaterial,
  deleteMaterial,
  generateMaterialSummary,
  generateMaterialFlashcards,
  generateMaterialQuiz
};