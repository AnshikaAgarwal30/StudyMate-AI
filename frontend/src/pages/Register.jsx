import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register(formData.name, formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div 
        className="w-100"
        style={{ maxWidth: '450px' }}
      >
        <div className="text-center mb-4">
          <h1 
            className="fw-bold mb-2"
            style={{ 
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '2.5rem'
            }}
          >
            StudyMate AI
          </h1>
          <p className="text-muted">Create your account and start learning smarter.</p>
        </div>
        
        <Card className="border-0 shadow-lg" style={{ borderRadius: '20px', borderTop: '4px solid #8b5cf6' }}>
          <Card.Body className="p-4">
            <h3 className="fw-bold mb-4 text-center" style={{ color: '#1e293b' }}>Register</h3>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold" style={{ color: '#1e293b' }}>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your name"
                  style={{ borderRadius: '20px' }}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold" style={{ color: '#1e293b' }}>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                  style={{ borderRadius: '20px' }}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold" style={{ color: '#1e293b' }}>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  style={{ borderRadius: '20px' }}
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold" style={{ color: '#1e293b' }}>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm your password"
                  style={{ borderRadius: '20px' }}
                />
              </Form.Group>
              <Button
                type="submit"
                className="w-100 rounded-pill py-3 fw-bold"
                disabled={loading}
                style={{ 
                  backgroundColor: '#8b5cf6', 
                  border: 'none',
                  fontSize: '1.1rem'
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Registering...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </Form>
            <div className="text-center mt-4">
              <p className="text-muted mb-0">
                Already have an account? <Link to="/login" className="fw-bold" style={{ color: '#6366f1' }}>Login</Link>
              </p>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default Register;
