import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';

const UploadMaterial = () => {
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    file: null,
    notes: ''
  });
  const [uploadType, setUploadType] = useState('file');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name === 'file') {
      setFormData({
        ...formData,
        file: e.target.files[0]
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.subject) {
      setError('Title and subject are required');
      return;
    }

    if (uploadType === 'file' && !formData.file) {
      setError('Please select a file to upload');
      return;
    }

    if (uploadType === 'notes' && !formData.notes.trim()) {
      setError('Please enter some notes');
      return;
    }

    if (formData.file) {
      const allowedTypes = ['application/pdf', 'text/plain'];
      if (!allowedTypes.includes(formData.file.type)) {
        setError('Only PDF and TXT files are allowed');
        return;
      }

      if (formData.file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('subject', formData.subject);
      
      if (uploadType === 'file' && formData.file) {
        data.append('file', formData.file);
      } else {
        data.append('notes', formData.notes);
      }

      const response = await api.post('/materials', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate(`/materials/${response.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload material');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4" style={{ maxWidth: '800px' }}>
      <div className="mb-4">
        <h2 className="fw-bold mb-1" style={{ color: '#1e293b' }}>📤 Upload Study Material</h2>
        <p className="text-muted mb-0">Add your PDFs, TXT files, or paste notes to generate AI-powered study content</p>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card className="border-0 shadow-sm" style={{ borderTop: '4px solid #6366f1' }}>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold mb-3" style={{ color: '#1e293b' }}>Upload Type</Form.Label>
              <div className="d-flex gap-4">
                <div className="flex-grow-1">
                  <Form.Check
                    type="radio"
                    label="📁 Upload File (PDF/TXT)"
                    name="uploadType"
                    id="fileUpload"
                    checked={uploadType === 'file'}
                    onChange={() => setUploadType('file')}
                    className="p-3 rounded border cursor-pointer"
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: uploadType === 'file' ? '#f0f9ff' : 'white',
                      borderColor: uploadType === 'file' ? '#06b6d4' : '#e2e8f0'
                    }}
                  />
                </div>
                <div className="flex-grow-1">
                  <Form.Check
                    type="radio"
                    label="📝 Paste Notes"
                    name="uploadType"
                    id="notesUpload"
                    checked={uploadType === 'notes'}
                    onChange={() => setUploadType('notes')}
                    className="p-3 rounded border cursor-pointer"
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: uploadType === 'notes' ? '#f0f9ff' : 'white',
                      borderColor: uploadType === 'notes' ? '#06b6d4' : '#e2e8f0'
                    }}
                  />
                </div>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Title *</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., Java OOP Concepts"
                style={{ borderRadius: '20px' }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Subject *</Form.Label>
              <Form.Control
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="e.g., Java Programming"
                style={{ borderRadius: '20px' }}
              />
            </Form.Group>

            {uploadType === 'file' ? (
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">File (PDF/TXT, max 10MB) *</Form.Label>
                <div 
                  className="p-4 rounded border-2 border-dashed text-center"
                  style={{ 
                    borderColor: '#6366f1',
                    backgroundColor: '#faf5ff'
                  }}
                >
                  <Form.Control
                    type="file"
                    name="file"
                    onChange={handleChange}
                    accept=".pdf,.txt"
                    required
                    className="border-0 bg-transparent"
                  />
                  <Form.Text className="text-muted mt-2">
                    📄 Supported formats: PDF, TXT
                  </Form.Text>
                </div>
              </Form.Group>
            ) : (
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">Notes *</Form.Label>
                <Form.Control
                  as="textarea"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  required
                  rows={10}
                  placeholder="Paste your lecture notes or study material here..."
                  style={{ borderRadius: '20px' }}
                />
              </Form.Group>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-100 rounded-pill py-3 fw-bold"
              style={{ 
                backgroundColor: '#6366f1', 
                border: 'none',
                fontSize: '1.1rem'
              }}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Uploading...
                </>
              ) : (
                '🚀 Upload Material'
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UploadMaterial;
