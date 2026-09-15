import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

import {
  Container,
  Row,
  Col,
  Card,
  Alert,
  Spinner,
  Badge
} from 'react-bootstrap';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [progress, setProgress] = useState(null);
  const [subjectPerformance, setSubjectPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [progressRes, subjectRes] = await Promise.all([
        api.get('/progress'),
        api.get('/progress/subject-performance')
      ]);

      setProgress(progressRes.data);
      setSubjectPerformance(subjectRes.data);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '60vh' }}
      >
        <Spinner animation="border" style={{ color: '#6366f1' }} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!progress) {
    return (
      <Container className="mt-4">
        <Alert variant="info">No data available</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">

      {/* ================= HEADER ================= */}
      <div className="mb-5 d-flex justify-content-between align-items-center flex-wrap gap-3">

        <div>
          <h1 className="fw-bold mb-2" style={{ color: '#1e293b' }}>
            Welcome back,{' '}
            <span style={{ color: '#6366f1' }}>
              {user?.name || 'Student'}
            </span>
            ! 👋
          </h1>

          <p className="text-muted mb-0">
            Continue your learning journey with AI-powered study tools
          </p>
        </div>

        {/* Profile + Logout */}
        <div className="d-flex align-items-center gap-2">

          <Link
            to="/profile"
            className="btn rounded-pill px-3"
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#6366f1'
            }}
          >
            👤 Profile
          </Link>

          <button
            onClick={handleLogout}
            className="btn rounded-pill px-3"
            style={{
              backgroundColor: '#6366f1',
              color: 'white',
              border: 'none'
            }}
          >
            Logout
          </button>

        </div>
      </div>


      {/* ================= QUICK STATS ================= */}
      <Row className="mb-4">

        <Col md={3} className="mb-3">
          <Card
            className="border-0 shadow-sm"
            style={{ borderTop: '4px solid #6366f1' }}
          >
            <Card.Body className="text-center">

              <div
                className="display-6 fw-bold mb-2"
                style={{ color: '#6366f1' }}
              >
                {progress.totalMaterials}
              </div>

              <Card.Text className="text-muted mb-0">
                Study Materials
              </Card.Text>

            </Card.Body>
          </Card>
        </Col>


        <Col md={3} className="mb-3">
          <Card
            className="border-0 shadow-sm"
            style={{ borderTop: '4px solid #8b5cf6' }}
          >
            <Card.Body className="text-center">

              <div
                className="display-6 fw-bold mb-2"
                style={{ color: '#8b5cf6' }}
              >
                {progress.totalFlashcards}
              </div>

              <Card.Text className="text-muted mb-0">
                Flashcards Created
              </Card.Text>

            </Card.Body>
          </Card>
        </Col>


        <Col md={3} className="mb-3">
          <Card
            className="border-0 shadow-sm"
            style={{ borderTop: '4px solid #06b6d4' }}
          >
            <Card.Body className="text-center">

              <div
                className="display-6 fw-bold mb-2"
                style={{ color: '#06b6d4' }}
              >
                {progress.totalQuizzes}
              </div>

              <Card.Text className="text-muted mb-0">
                Quizzes Generated
              </Card.Text>

            </Card.Body>
          </Card>
        </Col>


        <Col md={3} className="mb-3">
          <Card
            className="border-0 shadow-sm"
            style={{ borderTop: '4px solid #10b981' }}
          >
            <Card.Body className="text-center">

              <div
                className="display-6 fw-bold mb-2"
                style={{ color: '#10b981' }}
              >
                {progress.totalAttempts}
              </div>

              <Card.Text className="text-muted mb-0">
                Quizzes Attempted
              </Card.Text>

            </Card.Body>
          </Card>
        </Col>

      </Row>


      {/* ================= WORKFLOW ================= */}
      <Card className="mb-4 border-0 shadow-sm">

        <Card.Body>

          <h4
            className="fw-bold mb-4"
            style={{ color: '#1e293b' }}
          >
            Your Study Workflow
          </h4>

          <div className="d-flex flex-wrap justify-content-between align-items-center position-relative">

            <div
              className="text-center"
              style={{ flex: 1, minWidth: '120px' }}
            >
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2"
                style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#6366f1',
                  color: 'white'
                }}
              >
                <span className="fw-bold">1</span>
              </div>

              <h6 className="mb-1">Upload</h6>
              <small className="text-muted">PDF/TXT/Notes</small>
            </div>


            <div
              className="text-center"
              style={{ flex: 1, minWidth: '120px' }}
            >
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2"
                style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#8b5cf6',
                  color: 'white'
                }}
              >
                <span className="fw-bold">2</span>
              </div>

              <h6 className="mb-1">AI Summary</h6>
              <small className="text-muted">Smart Content</small>
            </div>


            <div
              className="text-center"
              style={{ flex: 1, minWidth: '120px' }}
            >
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2"
                style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#a855f7',
                  color: 'white'
                }}
              >
                <span className="fw-bold">3</span>
              </div>

              <h6 className="mb-1">Flashcards</h6>
              <small className="text-muted">Active Recall</small>
            </div>


            <div
              className="text-center"
              style={{ flex: 1, minWidth: '120px' }}
            >
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2"
                style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#06b6d4',
                  color: 'white'
                }}
              >
                <span className="fw-bold">4</span>
              </div>

              <h6 className="mb-1">Quiz</h6>
              <small className="text-muted">Practice Tests</small>
            </div>


            <div
              className="text-center"
              style={{ flex: 1, minWidth: '120px' }}
            >
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2"
                style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#10b981',
                  color: 'white'
                }}
              >
                <span className="fw-bold">5</span>
              </div>

              <h6 className="mb-1">Progress</h6>
              <small className="text-muted">Track Growth</small>
            </div>

          </div>


          <div className="text-center mt-3">

            <Link
              to="/upload"
              className="btn btn-primary rounded-pill px-4"
              style={{
                backgroundColor: '#6366f1',
                border: 'none'
              }}
            >
              Start Learning →
            </Link>

          </div>

        </Card.Body>
      </Card>


      {/* ================= PERFORMANCE STATS ================= */}
      <Row className="mb-4">

        <Col md={4} className="mb-3">
          <Card className="border-0 shadow-sm h-100">

            <Card.Body className="text-center">

              <div className="mb-2">
                <span
                  style={{
                    fontSize: '3rem',
                    color: '#6366f1'
                  }}
                >
                  📊
                </span>
              </div>

              <h6 className="text-muted mb-2">
                Average Score
              </h6>

              <div
                className="display-4 fw-bold"
                style={{ color: '#6366f1' }}
              >
                {progress.averageScore}%
              </div>

            </Card.Body>
          </Card>
        </Col>


        <Col md={4} className="mb-3">
          <Card className="border-0 shadow-sm h-100">

            <Card.Body className="text-center">

              <div className="mb-2">
                <span
                  style={{
                    fontSize: '3rem',
                    color: '#10b981'
                  }}
                >
                  🏆
                </span>
              </div>

              <h6 className="text-muted mb-2">
                Best Score
              </h6>

              <div
                className="display-4 fw-bold"
                style={{ color: '#10b981' }}
              >
                {progress.bestScore}%
              </div>

            </Card.Body>
          </Card>
        </Col>


        <Col md={4} className="mb-3">
          <Card className="border-0 shadow-sm h-100">

            <Card.Body className="text-center">

              <div className="mb-2">
                <span
                  style={{
                    fontSize: '3rem',
                    color: '#f59e0b'
                  }}
                >
                  ⏱️
                </span>
              </div>

              <h6 className="text-muted mb-2">
                Study Activity
              </h6>

              <div
                className="display-4 fw-bold"
                style={{ color: '#f59e0b' }}
              >
                {progress.totalAttempts}
              </div>

              <small className="text-muted">
                attempts
              </small>

            </Card.Body>
          </Card>
        </Col>

      </Row>


      {/* ================= SUBJECT PERFORMANCE ================= */}
      {subjectPerformance.length > 0 && (

        <Row className="mb-4">

          <Col>

            <Card className="border-0 shadow-sm">

              <Card.Body>

                <h5
                  className="fw-bold mb-4"
                  style={{ color: '#1e293b' }}
                >
                  Subject-wise Performance
                </h5>

                <ResponsiveContainer
                  width="100%"
                  height={300}
                >

                  <BarChart data={subjectPerformance}>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                    />

                    <XAxis
                      dataKey="subject"
                      stroke="#64748b"
                    />

                    <YAxis
                      stroke="#64748b"
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: 'none',
                        borderRadius: '8px'
                      }}
                      itemStyle={{
                        color: '#fff'
                      }}
                    />

                    <Legend />

                    <Bar
                      dataKey="averageScore"
                      fill="#6366f1"
                      name="Average Score %"
                      radius={[8, 8, 0, 0]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </Card.Body>

            </Card>

          </Col>

        </Row>

      )}


      {/* ================= WEAK TOPICS ================= */}
      {progress.weakTopics &&
        progress.weakTopics.length > 0 && (

          <Row className="mb-4">

            <Col>

              <Card
                className="border-0 shadow-sm"
                style={{
                  borderLeft: '4px solid #f59e0b'
                }}
              >

                <Card.Body>

                  <div className="d-flex justify-content-between align-items-center mb-3">

                    <h5
                      className="fw-bold mb-0"
                      style={{ color: '#1e293b' }}
                    >
                      🎯 Topics Needing Practice
                    </h5>

                    <Badge
                      bg="warning"
                      className="rounded-pill"
                    >
                      {progress.weakTopics.length} topics
                    </Badge>

                  </div>


                  {progress.weakTopics.map((topic, index) => (

                    <Alert
                      key={index}
                      variant="warning"
                      className="d-flex justify-content-between align-items-center mb-2"
                    >

                      <div>

                        <strong>
                          {topic.topic}
                        </strong>

                        <div className="small text-muted">
                          {topic.correctAnswers}/
                          {topic.totalQuestions} correct
                        </div>

                      </div>

                      <Badge
                        bg="danger"
                        className="rounded-pill"
                      >
                        {topic.percentage}%
                      </Badge>

                    </Alert>

                  ))}

                </Card.Body>

              </Card>

            </Col>

          </Row>

        )}


      {/* ================= RECENT ACTIVITY ================= */}
      <Row className="mb-4">

        {/* Recent Materials */}
        <Col md={6} className="mb-3">

          <Card className="border-0 shadow-sm h-100">

            <Card.Body>

              <div className="d-flex justify-content-between align-items-center mb-3">

                <h5
                  className="fw-bold mb-0"
                  style={{ color: '#1e293b' }}
                >
                  📚 Recent Materials
                </h5>

                <Link
                  to="/materials"
                  className="text-decoration-none"
                  style={{ color: '#6366f1' }}
                >
                  View All →
                </Link>

              </div>


              {progress.recentMaterials &&
              progress.recentMaterials.length > 0 ? (

                progress.recentMaterials.map((material) => (

                  <Link
                    key={material._id}
                    to={`/materials/${material._id}`}
                    className="text-decoration-none"
                  >

                    <Card
                      className="mb-2 border-0"
                      style={{
                        backgroundColor: '#f8fafc'
                      }}
                    >

                      <Card.Body className="py-2">

                        <div className="d-flex justify-content-between align-items-center">

                          <div>

                            <strong className="text-dark">
                              {material.title}
                            </strong>

                            <div className="small text-muted">
                              {material.subject}
                            </div>

                          </div>

                          <Badge
                            bg="light"
                            text="dark"
                            className="rounded-pill"
                          >
                            {material.type?.toUpperCase() || 'PDF'}
                          </Badge>

                        </div>

                      </Card.Body>

                    </Card>

                  </Link>

                ))

              ) : (

                <Alert
                  variant="info"
                  className="text-center"
                >
                  No materials yet.{' '}

                  <Link
                    to="/upload"
                    className="fw-bold"
                  >
                    Upload your first material
                  </Link>

                </Alert>

              )}

            </Card.Body>

          </Card>

        </Col>


        {/* Recent Quiz Attempts */}
        <Col md={6} className="mb-3">

          <Card className="border-0 shadow-sm h-100">

            <Card.Body>

              <div className="d-flex justify-content-between align-items-center mb-3">

                <h5
                  className="fw-bold mb-0"
                  style={{ color: '#1e293b' }}
                >
                  📝 Recent Quiz Attempts
                </h5>

                <Link
                  to="/progress"
                  className="text-decoration-none"
                  style={{ color: '#6366f1' }}
                >
                  View All →
                </Link>

              </div>


              {progress.recentAttempts &&
              progress.recentAttempts.length > 0 ? (

                progress.recentAttempts.map((attempt) => (

                  <Link
                    key={attempt._id}
                    to={`/quiz/result/${attempt._id}`}
                    className="text-decoration-none"
                  >

                    <Card
                      className="mb-2 border-0"
                      style={{
                        backgroundColor: '#f8fafc'
                      }}
                    >

                      <Card.Body className="py-2">

                        <div className="d-flex justify-content-between align-items-center">

                          <div>

                            <strong className="text-dark">
                              {attempt.quiz?.title || 'Quiz'}
                            </strong>

                            <div className="small text-muted">
                              {new Date(
                                attempt.attemptedAt
                              ).toLocaleDateString()}
                            </div>

                          </div>

                          <Badge
                            bg={
                              attempt.percentage >= 80
                                ? 'success'
                                : attempt.percentage >= 60
                                ? 'warning'
                                : 'danger'
                            }
                            className="rounded-pill"
                          >
                            {attempt.percentage}%
                          </Badge>

                        </div>

                      </Card.Body>

                    </Card>

                  </Link>

                ))

              ) : (

                <Alert
                  variant="info"
                  className="text-center"
                >
                  No quiz attempts yet.{' '}

                  <Link
                    to="/materials"
                    className="fw-bold"
                  >
                    Start practicing!
                  </Link>

                </Alert>

              )}

            </Card.Body>

          </Card>

        </Col>

      </Row>

    </Container>
  );
};

export default Dashboard;