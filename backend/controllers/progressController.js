const StudyMaterial = require('../models/StudyMaterial');
const Flashcard = require('../models/Flashcard');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const { generateRevisionExplanation } = require('../services/aiService');

const getProgress = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalMaterials = await StudyMaterial.countDocuments({ user: userId });
    const totalFlashcards = await Flashcard.countDocuments({ user: userId });
    const totalQuizzes = await Quiz.countDocuments({ user: userId });
    const totalAttempts = await QuizAttempt.countDocuments({ user: userId });

    const attempts = await QuizAttempt.find({ user: userId })
      .sort({ percentage: -1 });

    let averageScore = 0;
    let bestScore = 0;

    if (attempts.length > 0) {
      const totalScore = attempts.reduce((sum, attempt) => sum + attempt.percentage, 0);
      averageScore = totalScore / attempts.length;
      bestScore = attempts[0].percentage;
    }

    const recentMaterials = await StudyMaterial.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    const recentAttempts = await QuizAttempt.find({ user: userId })
      .populate('quiz', 'title')
      .sort({ attemptedAt: -1 })
      .limit(5);

    const weakTopics = await getWeakTopics(userId);

    res.json({
      totalMaterials,
      totalFlashcards,
      totalQuizzes,
      totalAttempts,
      averageScore: Math.round(averageScore),
      bestScore: Math.round(bestScore),
      recentMaterials,
      recentAttempts,
      weakTopics
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getWeakTopics = async (userId) => {
  try {
    const attempts = await QuizAttempt.find({ user: userId })
      .populate('quiz');

    const topicPerformance = {};

    attempts.forEach(attempt => {
      attempt.quiz.questions.forEach((question, index) => {
        const answerData = attempt.answers.find(a => a.questionIndex === index);
        const topic = question.topic;

        if (!topicPerformance[topic]) {
          topicPerformance[topic] = {
            total: 0,
            correct: 0
          };
        }

        topicPerformance[topic].total++;
        if (answerData && answerData.isCorrect) {
          topicPerformance[topic].correct++;
        }
      });
    });

    const weakTopics = [];
    const threshold = 60;

    for (const [topic, performance] of Object.entries(topicPerformance)) {
      if (performance.total >= 2) {
        const percentage = (performance.correct / performance.total) * 100;
        if (percentage < threshold) {
          weakTopics.push({
            topic,
            percentage: Math.round(percentage),
            totalQuestions: performance.total,
            correctAnswers: performance.correct
          });
        }
      }
    }

    return weakTopics.sort((a, b) => a.percentage - b.percentage);
  } catch (error) {
    console.error('Error calculating weak topics:', error);
    return [];
  }
};

const getSubjectPerformance = async (req, res) => {
  try {
    const userId = req.user._id;

    const materials = await StudyMaterial.find({ user: userId });
    const subjects = [...new Set(materials.map(m => m.subject))];

    const subjectPerformance = [];

    for (const subject of subjects) {
      const subjectMaterials = materials.filter(m => m.subject === subject);
      const materialIds = subjectMaterials.map(m => m._id);

      const subjectQuizzes = await Quiz.find({ material: { $in: materialIds } });
      const quizIds = subjectQuizzes.map(q => q._id);

      const attempts = await QuizAttempt.find({ 
        user: userId,
        quiz: { $in: quizIds }
      });

      let averageScore = 0;
      if (attempts.length > 0) {
        const totalScore = attempts.reduce((sum, attempt) => sum + attempt.percentage, 0);
        averageScore = totalScore / attempts.length;
      }

      subjectPerformance.push({
        subject,
        averageScore: Math.round(averageScore),
        attemptsCount: attempts.length
      });
    }

    res.json(subjectPerformance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getRevisionRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    const weakTopics = await getWeakTopics(userId);

    const recommendations = [];

    for (const weakTopic of weakTopics.slice(0, 5)) {
      const relatedFlashcards = await Flashcard.find({
        user: userId,
        topic: weakTopic.topic
      }).limit(5);

      const relatedQuizzes = await Quiz.find({
        user: userId
      }).populate('material');

      const quizzesWithTopic = relatedQuizzes.filter(q => 
        q.questions.some(question => question.topic === weakTopic.topic)
      ).slice(0, 3);

      let explanation = '';
      try {
        const contextMaterial = await StudyMaterial.findOne({ user: userId })
          .sort({ createdAt: -1 });
        
        if (contextMaterial) {
          explanation = await generateRevisionExplanation(weakTopic.topic, contextMaterial.originalText.substring(0, 1000));
        }
      } catch (error) {
        explanation = 'Focus on understanding the core concepts of ' + weakTopic.topic + '. Review your study materials and practice more questions in this area.';
      }

      recommendations.push({
        topic: weakTopic.topic,
        currentPerformance: weakTopic.percentage,
        explanation,
        relatedFlashcards: relatedFlashcards.map(f => f._id),
        relatedQuizzes: quizzesWithTopic.map(q => q._id)
      });
    }

    res.json(recommendations);
  } catch (error) {
    console.error('Error getting revision recommendations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getProgress,
  getSubjectPerformance,
  getRevisionRecommendations
};
