const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const StudyMaterial = require('../models/StudyMaterial');

// ======================================================
// GET ALL QUIZZES
// ======================================================

const getQuizzes = async (req, res) => {
  try {
    const { material, difficulty } = req.query;

    const query = {
      user: req.user._id
    };

    if (material) {
      query.material = material;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    const quizzes = await Quiz.find(query)
      .populate('material', 'title subject')
      .sort({ createdAt: -1 });

    res.json(quizzes);

  } catch (error) {
    console.error('Get quizzes error:', error);

    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};


// ======================================================
// GET SINGLE QUIZ
// ======================================================

const getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('material', 'title subject');

    if (!quiz) {
      return res.status(404).json({
        message: 'Quiz not found'
      });
    }

    // Check ownership
    if (
      quiz.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: 'Not authorized to access this quiz'
      });
    }

    // Do not send correct answers to frontend
    const quizForUser = {
      ...quiz.toObject(),

      questions: quiz.questions.map(q => ({
        question: q.question,
        options: q.options,
        topic: q.topic,
        difficulty: q.difficulty
      }))
    };

    res.json(quizForUser);

  } catch (error) {
    console.error('Get quiz error:', error);

    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};


// ======================================================
// SUBMIT QUIZ ATTEMPT
// ======================================================

const submitQuizAttempt = async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;

    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        message: 'Quiz not found'
      });
    }

    // Check quiz ownership
    if (
      quiz.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: 'Not authorized to access this quiz'
      });
    }

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        message: 'Invalid answers format'
      });
    }

    let correctCount = 0;

    const processedAnswers = answers.map(
      (userAnswer, index) => {

        const question = quiz.questions[index];

        if (!question) {
          return {
            questionIndex: index,
            userAnswer: userAnswer,
            isCorrect: false
          };
        }

        const isCorrect =
          userAnswer === question.correctAnswer;

        if (isCorrect) {
          correctCount++;
        }

        return {
          questionIndex: index,
          userAnswer: userAnswer,
          isCorrect: isCorrect
        };
      }
    );

    const score = correctCount;

    const percentage =
      quiz.questions.length > 0
        ? (correctCount / quiz.questions.length) * 100
        : 0;

    // Create attempt
    const attempt = await QuizAttempt.create({
      user: req.user._id,
      quiz: quiz._id,
      score,
      percentage,
      answers: processedAnswers,
      timeTaken
    });

    // Prepare immediate result
    const result = {
      attemptId: attempt._id,
      score,
      percentage,
      totalQuestions: quiz.questions.length,
      correctCount,
      incorrectCount:
        quiz.questions.length - correctCount,

      answers: quiz.questions.map((q, index) => {

        const userAnswer = answers[index];

        const processedAnswer =
          processedAnswers[index];

        return {
          question: q.question,
          userAnswer: userAnswer,
          correctAnswer: q.correctAnswer,
          isCorrect: processedAnswer
            ? processedAnswer.isCorrect
            : false,
          explanation: q.explanation,
          topic: q.topic
        };
      })
    };

    res.json(result);

  } catch (error) {
    console.error('Error submitting quiz:', error);

    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};


// ======================================================
// GET QUIZ ATTEMPTS
// ======================================================

const getQuizAttempts = async (req, res) => {
  try {
    const { material, difficulty } = req.query;

    const query = {
      user: req.user._id
    };

    if (material) {

      const quizzes = await Quiz.find({
        material
      }).select('_id');

      query.quiz = {
        $in: quizzes.map(q => q._id)
      };
    }

    const attempts = await QuizAttempt.find(query)
      .populate('quiz', 'title difficulty')
      .sort({ attemptedAt: -1 });

    res.json(attempts);

  } catch (error) {
    console.error('Get quiz attempts error:', error);

    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};


// ======================================================
// GET SINGLE QUIZ ATTEMPT / RESULT
// ======================================================

const getQuizAttempt = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findById(req.params.id)
      .populate('quiz')
      .populate('user', 'name email');

    if (!attempt) {
      return res.status(404).json({
        message: 'Quiz attempt not found'
      });
    }

    // Check ownership
    const attemptUserId = attempt.user?._id?.toString();
    const loggedInUserId = req.user._id.toString();

    if (attemptUserId !== loggedInUserId) {
      return res.status(403).json({
        message: 'Not authorized to access this attempt'
      });
    }

    // Get quiz
    const quiz = attempt.quiz;

    if (!quiz) {
      return res.status(404).json({
        message: 'Quiz not found'
      });
    }

    // Calculate result statistics
    const totalQuestions = quiz.questions.length;

    const correctCount = attempt.answers.filter(
      answer => answer.isCorrect
    ).length;

    const incorrectCount =
      totalQuestions - correctCount;

    // Detailed answers
    const detailedAnswers = quiz.questions.map(
      (q, index) => {

        const answerData = attempt.answers.find(
          answer => answer.questionIndex === index
        );

        return {
          question: q.question,
          options: q.options,
          userAnswer: answerData?.userAnswer || '',
          correctAnswer: q.correctAnswer,
          isCorrect: answerData?.isCorrect || false,
          explanation: q.explanation,
          topic: q.topic,
          difficulty: q.difficulty
        };
      }
    );

    // Final result
    const detailedResult = {
      _id: attempt._id,
      user: attempt.user,
      quiz: attempt.quiz,

      score: attempt.score,
      percentage: attempt.percentage,

      totalQuestions,
      correctCount,
      incorrectCount,

      timeTaken: attempt.timeTaken,
      attemptedAt: attempt.attemptedAt,

      detailedAnswers
    };

    res.json(detailedResult);

  } catch (error) {
    console.error(
      'Get quiz attempt error:',
      error
    );

    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};


// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  getQuizzes,
  getQuiz,
  submitQuizAttempt,
  getQuizAttempts,
  getQuizAttempt
};