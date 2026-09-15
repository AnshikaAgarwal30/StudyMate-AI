import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Container, Card, Button, Alert, Spinner, Badge, ProgressBar, Form } from 'react-bootstrap';

const QuizInterface = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  useEffect(() => {
    fetchQuiz();
    setStartTime(Date.now());
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const response = await api.get(`/quizzes/${id}`);
      setQuiz(response.data);
      setAnswers(new Array(response.data.questions.length).fill(''));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load quiz');
      if (err.response?.status === 404) {
        navigate('/materials');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (option) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = option;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const goToQuestion = (index) => {
    setCurrentQuestion(index);
  };

  const handleSubmit = async () => {
    if (!showSubmitConfirm) {
      setShowSubmitConfirm(true);
      return;
    }

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    try {
      const response = await api.post(`/quizzes/${id}/attempt`, {
        answers,
        timeTaken
      });
      navigate(`/quiz/result/${response.data.attemptId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit quiz');
      setShowSubmitConfirm(false);
    }
  };

  const isQuestionAnswered = (index) => {
    return answers[index] !== '';
  };

  const getAnsweredCount = () => {
    return answers.filter(answer => answer !== '').length;
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" style={{ color: '#6366f1' }} />
      </Container>
    );
  }

  if (error && !quiz) {
    return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>;
  }

  if (!quiz) {
    return <Container className="mt-4"><Alert variant="info">Quiz not found</Alert></Container>;
  }

  const currentQ = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <Container className="mt-4" style={{ maxWidth: '900px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: '#1e293b' }}>📝 {quiz.title}</h2>
          <p className="text-muted mb-0">Test your knowledge with AI-generated questions</p>
        </div>
        <Button variant="outline-secondary" onClick={() => navigate(-1)} className="rounded-pill">
          ← Back
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4 border-0 shadow-sm" style={{ borderTop: '4px solid #06b6d4' }}>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h6 className="fw-bold mb-1" style={{ color: '#1e293b' }}>
                Question {currentQuestion + 1} of {quiz.questions.length}
              </h6>
              <small className="text-muted">
                Topic: {currentQ.topic}
              </small>
            </div>
            <Badge 
              bg={currentQ.difficulty === 'Easy' ? 'success' : currentQ.difficulty === 'Medium' ? 'warning' : 'danger'}
              className="rounded-pill px-3"
            >
              {currentQ.difficulty}
            </Badge>
          </div>

          <ProgressBar 
            now={progress} 
            className="mb-4"
            style={{ height: '8px', borderRadius: '4px', backgroundColor: '#e2e8f0' }}
          >
            <ProgressBar style={{ backgroundColor: '#06b6d4' }} now={progress} />
          </ProgressBar>

          <h4 className="fw-bold mb-4" style={{ color: '#1e293b', fontSize: '1.3rem' }}>
            {currentQ.question}
          </h4>

          <div className="mb-4">
            {currentQ.options.map((option, index) => (
              <div
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`p-3 mb-2 rounded border cursor-pointer ${
                  answers[currentQuestion] === option 
                    ? 'border-primary bg-primary bg-opacity-10' 
                    : 'border-secondary'
                }`}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: answers[currentQuestion] === option ? '2px solid #06b6d4' : '1px solid #e2e8f0',
                  backgroundColor: answers[currentQuestion] === option ? '#f0f9ff' : 'white'
                }}
              >
                <div className="d-flex align-items-center">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: '24px',
                      height: '24px',
                      border: answers[currentQuestion] === option ? '2px solid #06b6d4' : '2px solid #cbd5e1',
                      backgroundColor: answers[currentQuestion] === option ? '#06b6d4' : 'white'
                    }}
                  >
                    {answers[currentQuestion] === option && (
                      <span style={{ color: 'white', fontSize: '0.8rem' }}>✓</span>
                    )}
                  </div>
                  <span className={answers[currentQuestion] === option ? 'fw-bold' : ''}>
                    {option}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <Button
              variant="outline-secondary"
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              className="rounded-pill px-4"
            >
              ← Previous
            </Button>

            <div className="text-muted">
              <span className="fw-bold" style={{ color: '#06b6d4' }}>{getAnsweredCount()}</span> / {quiz.questions.length} answered
            </div>

            {currentQuestion === quiz.questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={getAnsweredCount() === 0}
                className="rounded-pill px-4"
                style={{ backgroundColor: '#06b6d4', border: 'none' }}
              >
                Submit Quiz
              </Button>
            ) : (
              <Button
                variant="outline-secondary"
                onClick={nextQuestion}
                className="rounded-pill px-4"
              >
                Next →
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>

      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <h6 className="fw-bold mb-3" style={{ color: '#1e293b' }}>Question Navigation</h6>
          <div className="d-flex flex-wrap gap-2">
            {quiz.questions.map((_, index) => (
              <Button
                key={index}
                variant={currentQuestion === index ? 'primary' : isQuestionAnswered(index) ? 'success' : 'outline-secondary'}
                size="sm"
                onClick={() => goToQuestion(index)}
                className="rounded-circle"
                style={{ 
                  width: '40px',
                  height: '40px',
                  minWidth: '40px',
                  backgroundColor: currentQuestion === index ? '#06b6d4' : isQuestionAnswered(index) ? '#10b981' : 'white',
                  borderColor: currentQuestion === index ? '#06b6d4' : isQuestionAnswered(index) ? '#10b981' : '#e2e8f0',
                  color: currentQuestion === index || isQuestionAnswered(index) ? 'white' : '#64748b'
                }}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </Card.Body>
      </Card>

      {showSubmitConfirm && (
        <Card className="border-0 shadow-sm" style={{ backgroundColor: '#fef3c7', borderLeft: '4px solid #f59e0b' }}>
          <Card.Body>
            <h5 className="fw-bold mb-3" style={{ color: '#92400e' }}>
              ⚠️ Are you sure you want to submit?
            </h5>
            <p className="mb-4" style={{ color: '#78350f' }}>
              You have answered <strong>{getAnsweredCount()}</strong> out of <strong>{quiz.questions.length}</strong> questions.
            </p>
            <div className="d-flex gap-2">
              <Button 
                variant="danger" 
                onClick={handleSubmit}
                className="rounded-pill px-4"
              >
                Yes, Submit Quiz
              </Button>
              <Button 
                variant="outline-secondary" 
                onClick={() => setShowSubmitConfirm(false)}
                className="rounded-pill px-4"
              >
                No, Continue Quiz
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default QuizInterface;
