import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';

const MyMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMaterials();
  }, []);

  useEffect(() => {
    filterMaterials();
  }, [materials, search, subjectFilter]);

  const fetchMaterials = async () => {
    try {
      const response = await api.get('/materials');
      setMaterials(response.data);
      setFilteredMaterials(response.data);
    } catch (err) {
      setError('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const filterMaterials = () => {
    let filtered = [...materials];

    if (search) {
      filtered = filtered.filter(material =>
        material.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (subjectFilter) {
      filtered = filtered.filter(material =>
        material.subject.toLowerCase() === subjectFilter.toLowerCase()
      );
    }

    setFilteredMaterials(filtered);
  };

  const getSubjects = () => {
    const subjects = [...new Set(materials.map(m => m.subject))];
    return subjects;
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      try {
        await api.delete(`/materials/${id}`);
        fetchMaterials();
      } catch (err) {
        setError('Failed to delete material');
      }
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" style={{ color: '#6366f1' }} />
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: '#1e293b' }}>📚 My Materials</h2>
          <p className="text-muted mb-0">Manage your study materials and generate AI content</p>
        </div>
        <Button 
          as={Link} 
          to="/upload" 
          className="rounded-pill px-4"
          style={{ backgroundColor: '#6366f1', border: 'none' }}
        >
          + Upload Material
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <Row>
            <Col md={6} className="mb-3 mb-md-0">
              <Form.Control
                type="text"
                placeholder="🔍 Search materials..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ borderRadius: '20px' }}
              />
            </Col>
            <Col md={4} className="mb-3 mb-md-0">
              <Form.Select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                style={{ borderRadius: '20px' }}
              >
                <option value="">All Subjects</option>
                {getSubjects().map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button 
                variant="outline-secondary" 
                onClick={() => { setSearch(''); setSubjectFilter(''); }}
                className="rounded-pill w-100"
              >
                Clear
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {filteredMaterials.length === 0 ? (
        <Card className="border-0 shadow-sm text-center py-5">
          <Card.Body>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📁</div>
            <h4 className="fw-bold mb-3" style={{ color: '#1e293b' }}>
              {materials.length === 0 ? 'No materials yet' : 'No materials found'}
            </h4>
            <p className="text-muted mb-4">
              {materials.length === 0 
                ? 'Upload your first study material to get started with AI-powered learning.'
                : 'Try adjusting your search or filter criteria.'}
            </p>
            {materials.length === 0 && (
              <Button
                as={Link}
                to="/upload"
                className="rounded-pill px-4"
                style={{ backgroundColor: '#6366f1', border: 'none' }}
              >
                Upload Your First Material
              </Button>
            )}
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {filteredMaterials.map((material) => (
            <Col key={material._id} md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm" style={{ borderTop: '4px solid #6366f1' }}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="flex-grow-1">
                      <h5 className="fw-bold mb-1" style={{ color: '#1e293b' }}>{material.title}</h5>
                      <p className="text-muted small mb-2">{material.subject}</p>
                    </div>
                    <Badge 
                      bg={material.type === 'pdf' ? 'danger' : material.type === 'txt' ? 'success' : 'primary'}
                      className="rounded-pill"
                    >
                      {material.type?.toUpperCase() || 'PDF'}
                    </Badge>
                  </div>
                  
                  <div className="mb-3">
                    <small className="text-muted">
                      📅 {new Date(material.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                  
                  <div className="d-flex gap-3 mb-3">
                    <div className="text-center">
                      <div className="fw-bold" style={{ color: '#8b5cf6' }}>{material.flashcardCount || 0}</div>
                      <small className="text-muted">Flashcards</small>
                    </div>
                    <div className="text-center">
                      <div className="fw-bold" style={{ color: '#06b6d4' }}>{material.quizCount || 0}</div>
                      <small className="text-muted">Quizzes</small>
                    </div>
                  </div>
                  
                  <div className="d-flex gap-2 flex-wrap">
                    <Button
                      as={Link}
                      to={`/materials/${material._id}`}
                      variant="outline-primary"
                      size="sm"
                      className="rounded-pill flex-grow-1"
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(material._id)}
                      className="rounded-pill"
                    >
                      🗑️
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default MyMaterials;
