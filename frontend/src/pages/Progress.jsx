import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Container, Row, Col, Card, Alert, Spinner, Badge, Button } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const Progress = () => {
  const [progress, setProgress] = useState(null);
  const [subjectPerformance, setSubjectPerformance] = useState([]);
  const [revisionRecommendations, setRevisionRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const [progressRes, subjectRes, revisionRes] = await Promise.all([
        api.get('/progress'),
        api.get('/progress/subject-performance'),
        api.get('/progress/revision')
      ]);
      setProgress(progressRes.data);
      setSubjectPerformance(subjectRes.data);
      setRevisionRecommendations(revisionRes.data);
    } catch (err) {
      setError('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" style={{ color: '#6366f1' }} />
      </Container>
    );
  }

  if (error) {
    return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>;
  }

  if (!progress) {
    return <Container className="mt-4"><Alert variant="info">No progress data available</Alert></Container>;
  }

  return (
    <Container className="mt-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1" style={{ color: '#1e293b' }}>📊 Your Progress</h2>
        <p className="text-muted mb-0">Track your learning journey and identify areas for improvement</p>
      </div>

      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm text-center" style={{ borderTop: '4px solid #6366f1' }}>
            <Card.Body>
              <div className="display-6 fw-bold mb-2" style={{ color: '#6366f1' }}>
                {progress.totalMaterials}
              </div>
              <Card.Text className="text-muted mb-0">Study Materials</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm text-center" style={{ borderTop: '4px solid #8b5cf6' }}>
            <Card.Body>
              <div className="display-6 fw-bold mb-2" style={{ color: '#8b5cf6' }}>
                {progress.totalFlashcards}
              </div>
              <Card.Text className="text-muted mb-0">Flashcards Created</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm text-center" style={{ borderTop: '4px solid #06b6d4' }}>
            <Card.Body>
              <div className="display-6 fw-bold mb-2" style={{ color: '#06b6d4' }}>
                {progress.totalAttempts}
              </div>
              <Card.Text className="text-muted mb-0">Quizzes Attempted</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm text-center" style={{ borderTop: '4px solid #10b981' }}>
            <Card.Body>
              <div className="display-6 fw-bold mb-2" style={{ color: '#10b981' }}>
                {progress.averageScore}%
              </div>
              <Card.Text className="text-muted mb-0">Average Score</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {subjectPerformance.length > 0 && (
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h5 className="fw-bold mb-4" style={{ color: '#1e293b' }}>Subject-wise Performance</h5>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={subjectPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="subject" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="averageScore" fill="#6366f1" name="Average Score %" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {progress.weakTopics && progress.weakTopics.length > 0 && (
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm" style={{ borderLeft: '4px solid #f59e0b' }}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>🎯 Topics Needing Practice</h5>
                  <Badge bg="warning" className="rounded-pill">{progress.weakTopics.length} topics</Badge>
                </div>
                <Alert variant="warning" className="mb-3" style={{ backgroundColor: '#fef3c7', border: 'none' }}>
                  These topics need more attention based on your quiz performance.
                </Alert>
                {progress.weakTopics.map((topic, index) => (
                  <Card key={index} className="mb-3 border-0" style={{ backgroundColor: '#fffbeb', borderLeft: '3px solid #f59e0b' }}>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="fw-bold mb-0" style={{ color: '#1e293b' }}>{topic.topic}</h6>
                        <Badge bg="danger" className="rounded-pill">{topic.percentage}%</Badge>
                      </div>
                      <small className="text-muted">
                        {topic.correctAnswers} correct out of {topic.totalQuestions} questions
                      </small>
                    </Card.Body>
                  </Card>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {revisionRecommendations.length > 0 && (
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm" style={{ borderTop: '4px solid #10b981' }}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>💡 AI Revision Recommendations</h5>
                  <Badge bg="success" className="rounded-pill">{revisionRecommendations.length} suggestions</Badge>
                </div>
                <Alert variant="info" className="mb-3" style={{ backgroundColor: '#ecfdf5', border: 'none' }}>
                  Personalized revision suggestions based on your weak topics.
                </Alert>
                {revisionRecommendations.map((rec, index) => (
                  <Card key={index} className="mb-3 border-0" style={{ backgroundColor: '#f0fdf4', borderLeft: '3px solid #10b981' }}>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="fw-bold mb-0" style={{ color: '#1e293b' }}>{rec.topic}</h6>
                        <Badge bg="warning" className="rounded-pill">Current: {rec.currentPerformance}%</Badge>
                      </div>
                      <p className="mb-3" style={{ lineHeight: '1.6', color: '#334155' }}>
                        <strong>Quick Revision:</strong> {rec.explanation}
                      </p>
                      <div className="d-flex gap-2">
                        {rec.relatedFlashcards.length > 0 && (
                          <Button
                            as={Link}
                            to="/flashcards"
                            variant="outline-primary"
                            size="sm"
                            className="rounded-pill"
                          >
                            🧠 Study Flashcards
                          </Button>
                        )}
                        {rec.relatedQuizzes.length > 0 && (
                          <Button
                            as={Link}
                            to="/materials"
                            variant="outline-success"
                            size="sm"
                            className="rounded-pill"
                          >
                            📝 Practice Quiz
                          </Button>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Row className="mb-4">
        <Col md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100" style={{ borderTop: '4px solid #8b5cf6' }}>
            <Card.Body>
              <h5 className="fw-bold mb-4" style={{ color: '#1e293b' }}>📈 Recent Quiz Performance</h5>
              {progress.recentAttempts && progress.recentAttempts.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={progress.recentAttempts.map((attempt, index) => ({
                    name: `Quiz ${index + 1}`,
                    score: attempt.percentage
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="score" stroke="#8b5cf6" name="Score %" strokeWidth={3} dot={{ fill: '#8b5cf6' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Card className="border-0 text-center py-4" style={{ backgroundColor: '#f8fafc' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                  <h6 className="fw-bold" style={{ color: '#64748b' }}>No quiz attempts yet</h6>
                  <p className="text-muted small">Start practicing to see your progress!</p>
                </Card>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100" style={{ borderTop: '4px solid #06b6d4' }}>
            <Card.Body>
              <h5 className="fw-bold mb-4" style={{ color: '#1e293b' }}>🎯 Study Activity</h5>
              <div className="text-center py-4">
                <div className="mb-4">
                  <div className="display-4 fw-bold" style={{ color: '#06b6d4' }}>{progress.totalAttempts}</div>
                  <small className="text-muted">Total Quiz Attempts</small>
                </div>
                <hr style={{ borderColor: '#e2e8f0' }} />
                <div>
                  <div className="display-4 fw-bold" style={{ color: '#10b981' }}>{progress.bestScore}%</div>
                  <small className="text-muted">Best Score Achieved</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <h5 className="fw-bold mb-3" style={{ color: '#1e293b' }}>🚀 Next Steps</h5>
          <div className="d-flex gap-2 flex-wrap">
            <Button 
              as={Link} 
              to="/upload" 
              className="rounded-pill px-4"
              style={{ backgroundColor: '#6366f1', border: 'none' }}
            >
              Upload New Material
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
              to="/materials" 
              variant="info"
              className="rounded-pill px-4"
            >
              View Materials
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

export default Progress;
