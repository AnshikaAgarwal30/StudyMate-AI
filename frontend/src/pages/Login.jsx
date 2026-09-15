import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
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
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
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
          <p className="text-muted">Welcome back! Log in to continue learning.</p>
        </div>
        
        <Card className="border-0 shadow-lg" style={{ borderRadius: '20px', borderTop: '4px solid #6366f1' }}>
          <Card.Body className="p-4">
            <h3 className="fw-bold mb-4 text-center" style={{ color: '#1e293b' }}>Login</h3>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
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
              <Form.Group className="mb-4">
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
              <Button
                type="submit"
                className="w-100 rounded-pill py-3 fw-bold"
                disabled={loading}
                style={{ 
                  backgroundColor: '#6366f1', 
                  border: 'none',
                  fontSize: '1.1rem'
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
            </Form>
            <div className="text-center mt-4">
              <p className="text-muted mb-0">
                Don't have an account? <Link to="/register" className="fw-bold" style={{ color: '#6366f1' }}>Register</Link>
              </p>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default Login;
