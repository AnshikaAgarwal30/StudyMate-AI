import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Container, Card, Button, Alert, Spinner, Badge, Row, Col } from 'react-bootstrap';

const QuizResult = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResult();
  }, [attemptId]);

  const fetchResult = async () => {
    try {
      const response = await api.get(`/quizzes/attempts/${attemptId}`);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load quiz result');
      if (err.response?.status === 404) {
        navigate('/materials');
      }
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return '#10b981';
    if (percentage >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreMessage = (percentage) => {
    if (percentage >= 80) return 'Excellent! 🎉';
    if (percentage >= 60) return 'Good job! 👍';
    return 'Keep practicing! 💪';
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" style={{ color: '#6366f1' }} />
      </Container>
    );
  }

  if (error && !result) {
    return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>;
  }

  if (!result) {
    return <Container className="mt-4"><Alert variant="info">Result not found</Alert></Container>;
  }

  const scoreColor = getScoreColor(result.percentage);
  const scoreMessage = getScoreMessage(result.percentage);

  return (
    <Container className="mt-4" style={{ maxWidth: '900px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: '#1e293b' }}>📊 Quiz Results</h2>
          <p className="text-muted mb-0">Detailed performance analysis</p>
        </div>
        <Button variant="outline-secondary" onClick={() => navigate(-1)} className="rounded-pill">
          ← Back
        </Button>
      </div>

      <Card 
        className="mb-4 border-0 shadow-lg text-center"
        style={{ 
          background: `linear-gradient(135deg, ${scoreColor}22 0%, ${scoreColor}44 100%)`,
          borderTop: `4px solid ${scoreColor}`
        }}
      >
        <Card.Body className="py-5">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
            {result.percentage >= 80 ? '🏆' : result.percentage >= 60 ? '👍' : '💪'}
          </div>
          <h1 className="display-1 fw-bold mb-3" style={{ color: scoreColor }}>
            {result.percentage}%
          </h1>
          <h3 className="fw-bold mb-4" style={{ color: '#1e293b' }}>{scoreMessage}</h3>
          <div className="d-flex justify-content-center gap-4 mb-3">
            <div className="text-center">
              <div className="display-6 fw-bold" style={{ color: scoreColor }}>{result.score}</div>
              <small className="text-muted">Score</small>
            </div>
            <div className="text-center">
              <div className="display-6 fw-bold" style={{ color: '#10b981' }}>{result.correctCount}</div>
              <small className="text-muted">Correct</small>
            </div>
            <div className="text-center">
              <div className="display-6 fw-bold" style={{ color: '#ef4444' }}>{result.incorrectCount}</div>
              <small className="text-muted">Incorrect</small>
            </div>
          </div>
          <small className="text-muted">
            Attempted on: {new Date(result.attemptedAt).toLocaleString()}
          </small>
        </Card.Body>
      </Card>

      <h4 className="fw-bold mb-3" style={{ color: '#1e293b' }}>📝 Detailed Answers</h4>
      
      {result.detailedAnswers && result.detailedAnswers.map((answer, index) => (
        <Card 
          key={index} 
          className="mb-3 border-0 shadow-sm"
          style={{ 
            borderLeft: `4px solid ${answer.isCorrect ? '#10b981' : '#ef4444'}`,
            backgroundColor: answer.isCorrect ? '#f0fdf4' : '#fef2f2'
          }}
        >
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h6 className="fw-bold mb-1" style={{ color: '#1e293b' }}>
                  Question {index + 1}
                </h6>
                <Badge 
                  bg={answer.isCorrect ? 'success' : 'danger'}
                  className="rounded-pill"
                >
                  {answer.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                </Badge>
              </div>
              <Badge bg="light" text="dark" className="rounded-pill">
                {answer.topic}
              </Badge>
            </div>
            
            <p className="mb-3 fw-bold" style={{ color: '#334155' }}>{answer.question}</p>
            
            <Row className="mb-3">
              <Col md={6}>
                <small className="text-muted mb-1">Your Answer:</small>
                <div 
                  className="p-3 rounded"
                  style={{ 
                    backgroundColor: answer.isCorrect ? '#dcfce7' : '#fee2e2',
                    border: `1px solid ${answer.isCorrect ? '#16a34a' : '#dc2626'}`
                  }}
                >
                  {answer.userAnswer || 'Not answered'}
                </div>
              </Col>
              <Col md={6}>
                <small className="text-muted mb-1">Correct Answer:</small>
                <div 
                  className="p-3 rounded"
                  style={{ 
                    backgroundColor: '#dcfce7',
                    border: '1px solid #16a34a'
                  }}
                >
                  {answer.correctAnswer}
                </div>
              </Col>
            </Row>

            {!answer.isCorrect && (
              <div 
                className="p-3 rounded mt-2"
                style={{ backgroundColor: '#eff6ff', border: '1px solid #3b82f6' }}
              >
                <strong style={{ color: '#1e40af' }}>💡 Explanation:</strong> {answer.explanation}
              </div>
            )}
          </Card.Body>
        </Card>
      ))}

      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <h5 className="fw-bold mb-3" style={{ color: '#1e293b' }}>🚀 Next Steps</h5>
          <div className="d-flex gap-2 flex-wrap">
            <Button 
              as={Link} 
              to="/materials" 
              className="rounded-pill px-4"
              style={{ backgroundColor: '#6366f1', border: 'none' }}
            >
              Study More Materials
            </Button>
            <Button 
              as={Link} 
              to="/flashcards" 
              variant="success"
              className="rounded-pill px-4"
            >
              Practice Flashcards
            </Button>
            <Button 
              as={Link} 
              to="/progress" 
              variant="info"
              className="rounded-pill px-4"
            >
              View Progress
            </Button>
            <Button 
              as={Link} 
              to="/dashboard" 
              variant="outline-secondary"
              className="rounded-pill px-4"
            >
              Back to Dashboard
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default QuizResult;
