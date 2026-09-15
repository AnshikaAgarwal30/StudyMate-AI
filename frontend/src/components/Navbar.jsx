import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar as BootstrapNavbar, Nav, Container, Button } from 'react-bootstrap';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <BootstrapNavbar 
      bg="white" 
      expand="lg" 
      className="shadow-sm mb-4"
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
          <Nav className="me-auto">
            {!user ? (
              <>
                <Nav.Link as={Link} to="/" className="nav-link-custom">Home</Nav.Link>
                <Nav.Link as={Link} to="/login" className="nav-link-custom">Login</Nav.Link>
                <Nav.Link as={Link} to="/register" className="nav-link-custom">Register</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/dashboard" className="nav-link-custom">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/materials" className="nav-link-custom">My Materials</Nav.Link>
                <Nav.Link as={Link} to="/upload" className="nav-link-custom">Upload Material</Nav.Link>
                <Nav.Link as={Link} to="/flashcards" className="nav-link-custom">Flashcards</Nav.Link>
                <Nav.Link as={Link} to="/progress" className="nav-link-custom">Progress</Nav.Link>
                <Nav.Link as={Link} to="/profile" className="nav-link-custom">Profile</Nav.Link>
              </>
            )}
          </Nav>
          {user && (
            <Button 
              variant="outline-danger" 
              onClick={handleLogout}
              className="rounded-pill px-4"
            >
              Logout
            </Button>
          )}
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
        .nav-link-custom.active {
          color: #6366f1 !important;
          font-weight: 600;
        }
      `}</style>
    </BootstrapNavbar>
  );
};

export default Navbar;
