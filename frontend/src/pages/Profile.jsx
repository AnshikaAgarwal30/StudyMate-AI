import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Spinner
} from 'react-bootstrap';

const Profile = () => {
  const { user: authUser } = useAuth();

  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    name: ''
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/me');

      setUser(response.data.user);

      setFormData({
        name: response.data.user.name || ''
      });
    } catch (err) {
      // If API call fails, use the user from AuthContext
      if (authUser) {
        setUser(authUser);

        setFormData({
          name: authUser.name || ''
        });
      } else {
        setError('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');
    setUpdating(true);

    try {
      const response = await api.put('/profile', {
        name: formData.name
      });

      setUser(response.data);

      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to update profile'
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '60vh' }}
      >
        <Spinner
          animation="border"
          style={{ color: '#6366f1' }}
        />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          User not found
        </Alert>
      </Container>
    );
  }

  // Safely format the member date
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : 'Not available';

  return (
    <Container
      className="mt-4"
      style={{ maxWidth: '700px' }}
    >

      {/* ================= HEADER ================= */}
      <div className="mb-4">
        <h2
          className="fw-bold mb-1"
          style={{ color: '#1e293b' }}
        >
          👤 Profile
        </h2>

        <p className="text-muted mb-0">
          Manage your account settings
        </p>
      </div>


      {/* ================= ALERTS ================= */}
      {error && (
        <Alert variant="danger">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success">
          {success}
        </Alert>
      )}


      {/* ================= ACCOUNT INFORMATION ================= */}
      <Card
        className="mb-4 border-0 shadow-sm"
        style={{
          borderTop: '4px solid #6366f1'
        }}
      >

        <Card.Body>

          <h5
            className="fw-bold mb-4"
            style={{ color: '#1e293b' }}
          >
            Account Information
          </h5>


          {/* User Header */}
          <div className="d-flex align-items-center mb-4">

            <div
              className="rounded-circle d-flex align-items-center justify-content-center me-3"
              style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#6366f1',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}
            >
              {user.name
                ? user.name.charAt(0).toUpperCase()
                : 'S'}
            </div>


            <div>

              <h6
                className="fw-bold mb-1"
                style={{ color: '#1e293b' }}
              >
                {user.name}
              </h6>

              <small className="text-muted">
                {user.email}
              </small>

            </div>

          </div>


          {/* User Details */}
          <div className="bg-light rounded p-3">

            <div className="mb-3">

              <small className="text-muted">
                Name
              </small>

              <div className="fw-bold">
                {user.name}
              </div>

            </div>


            <div className="mb-3">

              <small className="text-muted">
                Email
              </small>

              <div className="fw-bold">
                {user.email}
              </div>

            </div>


            <div>

              <small className="text-muted">
                Member Since
              </small>

              <div className="fw-bold">
                {memberSince}
              </div>

            </div>

          </div>

        </Card.Body>

      </Card>


      {/* ================= EDIT PROFILE ================= */}
      <Card className="border-0 shadow-sm">

        <Card.Body>

          <h5
            className="fw-bold mb-4"
            style={{ color: '#1e293b' }}
          >
            Edit Profile
          </h5>


          <Form onSubmit={handleSubmit}>

            <Form.Group className="mb-4">

              <Form.Label className="fw-bold">
                Name
              </Form.Label>

              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your name"
                style={{
                  borderRadius: '20px'
                }}
              />

            </Form.Group>


            <Button
              type="submit"
              disabled={updating}
              className="rounded-pill px-4"
              style={{
                backgroundColor: '#6366f1',
                border: 'none'
              }}
            >

              {updating ? (
                <>
                  <Spinner
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  Updating...
                </>
              ) : (
                'Update Profile'
              )}

            </Button>

          </Form>

        </Card.Body>

      </Card>


      
    </Container>
  );
};

export default Profile;