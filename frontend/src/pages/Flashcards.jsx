import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge, Form, ProgressBar } from 'react-bootstrap';

const Flashcards = () => {
  const { materialId } = useParams();
  const [flashcards, setFlashcards] = useState([]);
  const [filteredFlashcards, setFilteredFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    topic: '',
    difficulty: ''
  });

  useEffect(() => {
    fetchFlashcards();
  }, [materialId]);

  useEffect(() => {
    applyFilters();
  }, [flashcards, filters]);

  const fetchFlashcards = async () => {
    try {
      const url = materialId 
        ? `/flashcards/material/${materialId}`
        : '/flashcards';
      const response = await api.get(url);
      setFlashcards(response.data);
      setFilteredFlashcards(response.data);
    } catch (err) {
      setError('Failed to load flashcards');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...flashcards];

    if (filters.topic) {
      filtered = filtered.filter(card => card.topic === filters.topic);
    }

    if (filters.difficulty) {
      filtered = filtered.filter(card => card.difficulty === filters.difficulty);
    }

    setFilteredFlashcards(filtered);
    setCurrentIndex(0);
    setShowAnswer(false);
  };

  const getTopics = () => {
    const topics = [...new Set(flashcards.map(card => card.topic))];
    return topics;
  };

  const shuffleCards = () => {
    const shuffled = [...filteredFlashcards].sort(() => Math.random() - 0.5);
    setFilteredFlashcards(shuffled);
    setCurrentIndex(0);
    setShowAnswer(false);
    setIsShuffled(true);
  };

  const resetOrder = () => {
    applyFilters();
    setIsShuffled(false);
  };

  const nextCard = () => {
    if (currentIndex < filteredFlashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value
    });
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

  if (filteredFlashcards.length === 0) {
    return (
      <Container className="mt-4">
        <Card className="border-0 shadow-sm text-center py-5">
          <Card.Body>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🧠</div>
            <h4 className="fw-bold mb-3" style={{ color: '#1e293b' }}>
              {flashcards.length === 0 ? 'No flashcards available' : 'No flashcards found'}
            </h4>
            <p className="text-muted mb-4">
              {flashcards.length === 0 
                ? 'Generate flashcards from your study materials first.'
                : 'Try adjusting your filter criteria.'}
            </p>
            {flashcards.length === 0 && (
              <Button
                as={Link}
                to="/materials"
                className="rounded-pill px-4"
                style={{ backgroundColor: '#6366f1', border: 'none' }}
              >
                Go to Materials
              </Button>
            )}
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const currentCard = filteredFlashcards[currentIndex];
  const progress = ((currentIndex + 1) / filteredFlashcards.length) * 100;

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: '#1e293b' }}>🧠 Flashcard Study Mode</h2>
          <p className="text-muted mb-0">Active recall learning for better retention</p>
        </div>
        <Button as={Link} to="/materials" variant="outline-secondary" className="rounded-pill">
          ← Back to Materials
        </Button>
      </div>

      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <h6 className="fw-bold mb-3" style={{ color: '#1e293b' }}>Filter Flashcards</h6>
          <Row>
            <Col md={4} className="mb-3 mb-md-0">
              <Form.Label className="small text-muted">Topic</Form.Label>
              <Form.Select
                value={filters.topic}
                onChange={(e) => handleFilterChange('topic', e.target.value)}
                style={{ borderRadius: '20px' }}
              >
                <option value="">All Topics</option>
                {getTopics().map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={4} className="mb-3 mb-md-0">
              <Form.Label className="small text-muted">Difficulty</Form.Label>
              <Form.Select
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                style={{ borderRadius: '20px' }}
              >
                <option value="">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </Form.Select>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <div className="d-flex gap-2 w-100">
                <Button
                  variant="outline-primary"
                  onClick={shuffleCards}
                  disabled={isShuffled}
                  className="rounded-pill flex-grow-1"
                >
                  🔀 Shuffle
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={resetOrder}
                  disabled={!isShuffled}
                  className="rounded-pill flex-grow-1"
                >
                  🔄 Reset
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <div className="mb-4">
        <ProgressBar 
          now={progress} 
          style={{ height: '8px', borderRadius: '4px', backgroundColor: '#e2e8f0' }}
        >
          <ProgressBar style={{ backgroundColor: '#6366f1' }} now={progress} />
        </ProgressBar>
        <div className="text-center mt-2 text-muted small">
          {currentIndex + 1} of {filteredFlashcards.length} cards
        </div>
      </div>

      <Card 
        className="mb-4 border-0 shadow-lg"
        style={{ 
          minHeight: '350px',
          background: showAnswer 
            ? 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' 
            : 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)'
        }}
      >
        <Card.Body className="d-flex flex-column justify-content-center text-center">
          <div className="mb-3">
            <Badge 
              bg="light" 
              text="dark" 
              className="rounded-pill px-3"
              style={{ fontSize: '0.9rem' }}
            >
              {currentCard.topic}
            </Badge>
            <Badge 
              bg={currentCard.difficulty === 'Easy' ? 'success' : currentCard.difficulty === 'Medium' ? 'warning' : 'danger'}
              className="rounded-pill px-3 ms-2"
              style={{ fontSize: '0.9rem' }}
            >
              {currentCard.difficulty}
            </Badge>
          </div>
          
          <h3 className="fw-bold mb-4" style={{ color: '#1e293b', fontSize: '1.5rem' }}>
            {currentCard.question}
          </h3>
          
          {showAnswer ? (
            <div className="mt-4">
              <div className="bg-white rounded p-4 shadow-sm">
                <h5 className="fw-bold mb-3" style={{ color: '#6366f1' }}>Answer</h5>
                <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#334155' }}>
                  {currentCard.answer}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <Button
                size="lg"
                onClick={() => setShowAnswer(true)}
                className="rounded-pill px-5 py-3 fw-bold"
                style={{ 
                  backgroundColor: '#6366f1', 
                  border: 'none',
                  fontSize: '1.1rem'
                }}
              >
                Show Answer
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-between align-items-center">
        <Button
          variant="outline-secondary"
          onClick={prevCard}
          disabled={currentIndex === 0}
          className="rounded-pill px-4"
        >
          ← Previous
        </Button>
        
        <div className="text-muted">
          <span className="fw-bold" style={{ color: '#6366f1' }}>{currentIndex + 1}</span> / {filteredFlashcards.length}
        </div>
        
        <Button
          variant="outline-secondary"
          onClick={nextCard}
          disabled={currentIndex === filteredFlashcards.length - 1}
          className="rounded-pill px-4"
        >
          Next →
        </Button>
      </div>

      {currentIndex === filteredFlashcards.length - 1 && (
        <Card className="mt-4 border-0 shadow-sm" style={{ backgroundColor: '#ecfdf5', borderLeft: '4px solid #10b981' }}>
          <Card.Body className="text-center">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <h4 className="fw-bold mb-3" style={{ color: '#065f46' }}>
              Great job! You've completed all the flashcards!
            </h4>
            <p className="text-muted mb-4">
              Ready to test your knowledge with a quiz?
            </p>
            <Button 
              as={Link} 
              to="/progress" 
              variant="success"
              className="rounded-pill px-4"
            >
              View Your Progress
            </Button>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default Flashcards;
