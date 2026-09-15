import React from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Navbar as BootstrapNavbar,
  Nav
} from 'react-bootstrap';

const LandingPage = () => {
  return (
    <div>
      {/* Navbar */}
      <BootstrapNavbar 
        bg="white" 
        expand="lg" 
        className="mb-4 shadow-sm"
        style={{ borderBottom: '3px solid #6366f1' }}
      >
        <Container>
          <BootstrapNavbar.Brand 
            as={Link} 
            to="/" 
            className="fw-bold"
            style={{ color: '#6366f1', fontSize: '1.5rem' }}
          >
            <span style={{ color: '#8b5cf6' }}>Study</span>
            <span style={{ color: '#6366f1' }}>Mate</span>
            <span style={{ color: '#06b6d4' }}>AI</span>
          </BootstrapNavbar.Brand>

          <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />

          <BootstrapNavbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/login" className="nav-link-custom">
                Login
              </Nav.Link>

              <Nav.Link as={Link} to="/register" className="nav-link-custom">
                Register
              </Nav.Link>
            </Nav>
          </BootstrapNavbar.Collapse>
        </Container>
        <style>{`
          .nav-link-custom {
            color: #4b5563 !important;
            font-weight: 500;
            transition: color 0.2s ease;
          }
          .nav-link-custom:hover {
            color: #6366f1 !important;
          }
        `}</style>
      </BootstrapNavbar>

      {/* Hero Section */}
      <div 
        className="py-5 mb-5 text-white"
        style={{ 
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)'
        }}
      >
        <Container className="text-center py-4">
          <h1 className="display-4 fw-bold mb-3">
            Study Smarter. Revise Faster.
          </h1>

          <p className="lead mb-4" style={{ opacity: 0.9 }}>
            Turn your PDFs and notes into AI-powered summaries,
            flashcards and quizzes in seconds.
          </p>

          <div className="d-flex gap-3 justify-content-center">
            <Button
              as={Link}
              to="/register"
              variant="light"
              size="lg"
              className="fw-bold rounded-pill px-4"
              style={{ backgroundColor: 'white', color: '#6366f1', border: 'none' }}
            >
              Get Started
            </Button>

            <Button
              as={Link}
              to="/login"
              variant="outline-light"
              size="lg"
              className="fw-bold rounded-pill px-4"
            >
              Login
            </Button>
          </div>
        </Container>
      </div>

      {/* Problem Section */}
      <Container className="mb-5">
        <Row className="mb-5">
          <Col>
            <h2 className="text-center mb-4 fw-bold" style={{ color: '#1e293b' }}>
              The Problem
            </h2>

            <p className="text-center lead" style={{ color: '#64748b' }}>
              Students waste hours manually creating flashcards,
              condensing massive textbooks, and organizing messy
              lecture notes before exams. This repetitive work takes
              time away from actual learning and understanding.
            </p>
          </Col>
        </Row>

        {/* Solution Section */}
        <Row className="mb-5">
          <Col>
            <h2 className="text-center mb-4 fw-bold" style={{ color: '#1e293b' }}>
              The Solution
            </h2>

            <p className="text-center lead" style={{ color: '#64748b' }}>
              StudyMate AI uses artificial intelligence to
              automatically transform your study materials into
              powerful learning tools. Upload your PDFs, TXT files,
              or paste your notes, and get instant summaries,
              active-recall flashcards, and practice quizzes.
            </p>
          </Col>
        </Row>

        {/* How It Works */}
        <Row className="mb-5">
          <Col>
            <h2 className="text-center mb-5 fw-bold" style={{ color: '#1e293b' }}>
              How It Works
            </h2>

            <Row className="justify-content-center">
              {/* Step 1 */}
              <Col md={2} sm={6} className="text-center mb-4">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow-sm"
                  style={{
                    width: '70px',
                    height: '70px',
                    backgroundColor: '#6366f1',
                    color: 'white'
                  }}
                >
                  <span className="fw-bold" style={{ fontSize: '1.5rem' }}>1</span>
                </div>

                <h5 className="fw-bold">Upload</h5>
                <p className="small text-muted">
                  Upload your PDF, TXT, or paste your notes.
                </p>
              </Col>

              {/* Step 2 */}
              <Col md={2} sm={6} className="text-center mb-4">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow-sm"
                  style={{
                    width: '70px',
                    height: '70px',
                    backgroundColor: '#8b5cf6',
                    color: 'white'
                  }}
                >
                  <span className="fw-bold" style={{ fontSize: '1.5rem' }}>2</span>
                </div>

                <h5 className="fw-bold">Generate</h5>
                <p className="small text-muted">
                  AI creates summaries, flashcards and quizzes.
                </p>
              </Col>

              {/* Step 3 */}
              <Col md={2} sm={6} className="text-center mb-4">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow-sm"
                  style={{
                    width: '70px',
                    height: '70px',
                    backgroundColor: '#a855f7',
                    color: 'white'
                  }}
                >
                  <span className="fw-bold" style={{ fontSize: '1.5rem' }}>3</span>
                </div>

                <h5 className="fw-bold">Study</h5>
                <p className="small text-muted">
                  Review your AI-generated study content.
                </p>
              </Col>

              {/* Step 4 */}
              <Col md={2} sm={6} className="text-center mb-4">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow-sm"
                  style={{
                    width: '70px',
                    height: '70px',
                    backgroundColor: '#06b6d4',
                    color: 'white'
                  }}
                >
                  <span className="fw-bold" style={{ fontSize: '1.5rem' }}>4</span>
                </div>

                <h5 className="fw-bold">Practice</h5>
                <p className="small text-muted">
                  Take quizzes to test your knowledge.
                </p>
              </Col>

              {/* Step 5 */}
              <Col md={2} sm={6} className="text-center mb-4">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow-sm"
                  style={{
                    width: '70px',
                    height: '70px',
                    backgroundColor: '#10b981',
                    color: 'white'
                  }}
                >
                  <span className="fw-bold" style={{ fontSize: '1.5rem' }}>5</span>
                </div>

                <h5 className="fw-bold">Improve</h5>
                <p className="small text-muted">
                  Track progress and focus on weak areas.
                </p>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* Features */}
        <Row className="mb-5">
          <Col>
            <h2 className="text-center mb-4 fw-bold" style={{ color: '#1e293b' }}>
              Everything You Need to Study Better
            </h2>
          </Col>
        </Row>

        <Row className="g-4 mb-5">
          {/* Summary */}
          <Col md={4}>
            <Card className="h-100 shadow-sm border-0" style={{ borderTop: '4px solid #6366f1' }}>
              <Card.Body className="text-center p-4">
                <div className="display-5 mb-3">📚</div>

                <Card.Title className="fw-bold">
                  AI Summaries
                </Card.Title>

                <Card.Text className="text-muted">
                  Convert long study materials into concise,
                  easy-to-understand summaries.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          {/* Flashcards */}
          <Col md={4}>
            <Card className="h-100 shadow-sm border-0" style={{ borderTop: '4px solid #8b5cf6' }}>
              <Card.Body className="text-center p-4">
                <div className="display-5 mb-3">🧠</div>

                <Card.Title className="fw-bold">
                  Smart Flashcards
                </Card.Title>

                <Card.Text className="text-muted">
                  Generate active-recall flashcards from your
                  study material and revise important concepts.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          {/* Quizzes */}
          <Col md={4}>
            <Card className="h-100 shadow-sm border-0" style={{ borderTop: '4px solid #a855f7' }}>
              <Card.Body className="text-center p-4">
                <div className="display-5 mb-3">📝</div>

                <Card.Title className="fw-bold">
                  Practice Quizzes
                </Card.Title>

                <Card.Text className="text-muted">
                  Test your knowledge with AI-generated
                  multiple-choice questions and explanations.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          {/* Progress */}
          <Col md={4}>
            <Card className="h-100 shadow-sm border-0" style={{ borderTop: '4px solid #06b6d4' }}>
              <Card.Body className="text-center p-4">
                <div className="display-5 mb-3">📊</div>

                <Card.Title className="fw-bold">
                  Track Progress
                </Card.Title>

                <Card.Text className="text-muted">
                  Monitor your quiz performance and learning
                  progress over time.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          {/* Weak Topics */}
          <Col md={4}>
            <Card className="h-100 shadow-sm border-0" style={{ borderTop: '4px solid #f59e0b' }}>
              <Card.Body className="text-center p-4">
                <div className="display-5 mb-3">🎯</div>

                <Card.Title className="fw-bold">
                  Weak Topic Detection
                </Card.Title>

                <Card.Text className="text-muted">
                  Identify the topics where you need more
                  practice and revision.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          {/* Recommendations */}
          <Col md={4}>
            <Card className="h-100 shadow-sm border-0" style={{ borderTop: '4px solid #10b981' }}>
              <Card.Body className="text-center p-4">
                <div className="display-5 mb-3">💡</div>

                <Card.Title className="fw-bold">
                  AI Recommendations
                </Card.Title>

                <Card.Text className="text-muted">
                  Get personalized revision suggestions based
                  on your performance.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* CTA */}
        <Row className="mb-5">
          <Col>
            <div 
              className="rounded p-5 text-center"
              style={{ backgroundColor: '#f8fafc' }}
            >
              <h2 className="fw-bold mb-3" style={{ color: '#1e293b' }}>
                Ready to Study Smarter?
              </h2>

              <p className="lead mb-4" style={{ color: '#64748b' }}>
                Upload your study material and let AI do the
                repetitive work for you.
              </p>

              <Button
                as={Link}
                to="/register"
                size="lg"
                className="fw-bold rounded-pill px-4"
                style={{ backgroundColor: '#6366f1', border: 'none' }}
              >
                Start Learning with StudyMate AI
              </Button>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Footer */}
      <footer className="text-white py-4" style={{ backgroundColor: '#1e293b' }}>
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h5 className="mb-1 fw-bold">
                <span style={{ color: '#8b5cf6' }}>Study</span>
                <span style={{ color: '#6366f1' }}>Mate</span>
                <span style={{ color: '#06b6d4' }}>AI</span>
              </h5>

              <p className="mb-0" style={{ color: '#94a3b8' }}>
                AI-powered learning made simple.
              </p>
            </Col>

            <Col md={6} className="text-md-end mt-3 mt-md-0">
              <p className="mb-0" style={{ color: '#94a3b8' }}>
                © {new Date().getFullYear()} StudyMate AI
              </p>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default LandingPage;
