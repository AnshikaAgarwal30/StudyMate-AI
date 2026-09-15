import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Container,
  Card,
  Button,
  Alert,
  Spinner,
  Badge,
  Row,
  Col,
  Form
} from 'react-bootstrap';

const MaterialDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [material, setMaterial] = useState(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [generating, setGenerating] = useState({
    summary: false,
    flashcards: false,
    quiz: false
  });

  const [flashcardCount, setFlashcardCount] = useState(10);
  const [quizCount, setQuizCount] = useState(10);
  const [difficulty, setDifficulty] = useState('Medium');

  useEffect(() => {
    fetchMaterial();
  }, [id]);

  const fetchMaterial = async () => {
    try {
      const response = await api.get(`/materials/${id}`);

      setMaterial(response.data);

      if (response.data.summary) {
        setSummary(response.data.summary);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load material'
      );

      if (err.response?.status === 404) {
        navigate('/materials');
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // GENERATE / REGENERATE SUMMARY
  // =========================
  const generateSummary = async () => {
    try {
      setGenerating(prev => ({
        ...prev,
        summary: true
      }));

      setError('');

      const response = await api.post(`/materials/${id}/summary`);

      setSummary(response.data.summary);

      setMaterial(prev => ({
        ...prev,
        summary: response.data.summary
      }));
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to generate summary'
      );
    } finally {
      setGenerating(prev => ({
        ...prev,
        summary: false
      }));
    }
  };

  // =========================
  // GENERATE FLASHCARDS
  // =========================
  const generateFlashcards = async () => {
    try {
      setGenerating(prev => ({
        ...prev,
        flashcards: true
      }));

      setError('');

      await api.post(`/materials/${id}/flashcards`, {
        count: flashcardCount,
        difficulty
      });

      navigate(`/flashcards/${id}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to generate flashcards'
      );

      setGenerating(prev => ({
        ...prev,
        flashcards: false
      }));
    }
  };

  // =========================
  // GENERATE QUIZ
  // =========================
  const generateQuiz = async () => {
    try {
      setGenerating(prev => ({
        ...prev,
        quiz: true
      }));

      setError('');

      const response = await api.post(`/materials/${id}/quiz`, {
        count: quizCount,
        difficulty
      });

      navigate(`/quiz/${response.data._id}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to generate quiz'
      );

      setGenerating(prev => ({
        ...prev,
        quiz: false
      }));
    }
  };

  // =========================
  // SIMPLE MARKDOWN RENDERER
  // =========================
  const renderInlineText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index}>
            {part.slice(2, -2)}
          </strong>
        );
      }

      if (
        part.startsWith('*') &&
        part.endsWith('*') &&
        !part.startsWith('**')
      ) {
        return (
          <em key={index}>
            {part.slice(1, -1)}
          </em>
        );
      }

      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={index}
            className="bg-light px-2 py-1 rounded"
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
  };

  const renderSummary = (text) => {
    if (!text) return null;

    const lines = text.split('\n');

    const elements = [];
    let currentList = [];
    let listType = null;

    const flushList = () => {
      if (currentList.length === 0) return;

      if (listType === 'ordered') {
        elements.push(
          <ol key={`list-${elements.length}`} className="mb-3">
            {currentList.map((item, index) => (
              <li key={index} className="mb-2">
                {renderInlineText(item)}
              </li>
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`list-${elements.length}`} className="mb-3">
            {currentList.map((item, index) => (
              <li key={index} className="mb-2">
                {renderInlineText(item)}
              </li>
            ))}
          </ul>
        );
      }

      currentList = [];
      listType = null;
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Empty line
      if (!trimmed) {
        flushList();
        return;
      }

      // H1
      if (trimmed.startsWith('# ')) {
        flushList();

        elements.push(
          <h2
            key={index}
            className="mt-3 mb-3 fw-bold text-primary"
          >
            {renderInlineText(trimmed.substring(2))}
          </h2>
        );

        return;
      }

      // H2
      if (trimmed.startsWith('## ')) {
        flushList();

        elements.push(
          <div
            key={index}
            className="mt-4 mb-3 p-2 border-start border-primary border-4 bg-light"
          >
            <h4 className="mb-0 fw-bold">
              {renderInlineText(trimmed.substring(3))}
            </h4>
          </div>
        );

        return;
      }

      // H3
      if (trimmed.startsWith('### ')) {
        flushList();

        elements.push(
          <h5
            key={index}
            className="mt-3 mb-2 fw-bold"
          >
            {renderInlineText(trimmed.substring(4))}
          </h5>
        );

        return;
      }

      // Bullet list
      if (
        trimmed.startsWith('- ') ||
        trimmed.startsWith('* ') ||
        trimmed.startsWith('• ')
      ) {
        if (listType && listType !== 'unordered') {
          flushList();
        }

        listType = 'unordered';

        currentList.push(
          trimmed.substring(2)
        );

        return;
      }

      // Numbered list
      const numberedMatch = trimmed.match(/^\d+\.\s+(.*)$/);

      if (numberedMatch) {
        if (listType && listType !== 'ordered') {
          flushList();
        }

        listType = 'ordered';

        currentList.push(
          numberedMatch[1]
        );

        return;
      }

      // Horizontal line
      if (
        trimmed === '---' ||
        trimmed === '***'
      ) {
        flushList();

        elements.push(
          <hr key={index} className="my-4" />
        );

        return;
      }

      // Normal paragraph
      flushList();

      elements.push(
        <p
          key={index}
          className="mb-3"
          style={{ lineHeight: '1.8' }}
        >
          {renderInlineText(trimmed)}
        </p>
      );
    });

    flushList();

    return elements;
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '60vh' }}
      >
        <Spinner animation="border" />
      </Container>
    );
  }

  // =========================
  // ERROR
  // =========================
  if (error && !material) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4 mb-5">

      {/* =========================
          PAGE HEADER
      ========================== */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Material Details</h2>

        <Button
          as={Link}
          to="/materials"
          variant="outline-secondary"
        >
          Back to Materials
        </Button>
      </div>

      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {material && (
        <Row>

          {/* =========================
              MAIN CONTENT
          ========================== */}
          <Col md={8}>

            {/* MATERIAL CARD */}
            <Card className="mb-4 shadow-sm">
              <Card.Body>

                <div className="d-flex justify-content-between align-items-start mb-3">

                  <div>
                    <h3 className="fw-bold">
                      {material.title}
                    </h3>

                    <p className="text-muted mb-2">
                      {material.subject}
                    </p>

                    <Badge
                      bg={
                        material.type === 'pdf'
                          ? 'danger'
                          : material.type === 'txt'
                            ? 'success'
                            : 'primary'
                      }
                    >
                      {material.type.toUpperCase()}
                    </Badge>
                  </div>

                  <small className="text-muted">
                    Created:{' '}
                    {new Date(
                      material.createdAt
                    ).toLocaleDateString()}
                  </small>

                </div>

                {/* STATISTICS */}
                <div className="mb-3">
                  <strong>Statistics:</strong>

                  <div className="d-flex gap-3 mt-2">

                    <Badge bg="info">
                      Flashcards: {material.flashcardCount || 0}
                    </Badge>

                    <Badge bg="warning">
                      Quizzes: {material.quizCount || 0}
                    </Badge>

                  </div>
                </div>

                <hr />

                {/* =========================
                    GENERATE STUDY CONTENT
                ========================== */}
                <div className="mb-4">

                  <h5 className="fw-bold mb-3">
                    Generate Study Content
                  </h5>

                  <div className="d-flex gap-2 flex-wrap mb-3">

                    {/* SUMMARY BUTTON */}
                    <Button
                      variant="primary"
                      onClick={generateSummary}
                      disabled={generating.summary}
                    >
                      {generating.summary ? (
                        <>
                          <Spinner
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
                          Generating...
                        </>
                      ) : material.summary ? (
                        '🔄 Regenerate Summary'
                      ) : (
                        '✨ Generate Summary'
                      )}
                    </Button>

                    {/* FLASHCARDS */}
                    <Button
                      variant="success"
                      onClick={generateFlashcards}
                      disabled={generating.flashcards}
                    >
                      {generating.flashcards ? (
                        <>
                          <Spinner
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
                          Generating...
                        </>
                      ) : (
                        'Generate Flashcards'
                      )}
                    </Button>

                    {/* QUIZ */}
                    <Button
                      variant="warning"
                      onClick={generateQuiz}
                      disabled={generating.quiz}
                    >
                      {generating.quiz ? (
                        <>
                          <Spinner
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
                          Generating...
                        </>
                      ) : (
                        'Generate Quiz'
                      )}
                    </Button>

                  </div>

                  {/* SETTINGS */}
                  <Row className="mb-3">

                    <Col md={4}>
                      <Form.Label>
                        Flashcard Count
                      </Form.Label>

                      <Form.Select
                        value={flashcardCount}
                        onChange={(e) =>
                          setFlashcardCount(
                            parseInt(e.target.value)
                          )
                        }
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                      </Form.Select>
                    </Col>

                    <Col md={4}>
                      <Form.Label>
                        Quiz Count
                      </Form.Label>

                      <Form.Select
                        value={quizCount}
                        onChange={(e) =>
                          setQuizCount(
                            parseInt(e.target.value)
                          )
                        }
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                      </Form.Select>
                    </Col>

                    <Col md={4}>
                      <Form.Label>
                        Difficulty
                      </Form.Label>

                      <Form.Select
                        value={difficulty}
                        onChange={(e) =>
                          setDifficulty(e.target.value)
                        }
                      >
                        <option value="Easy">
                          Easy
                        </option>

                        <option value="Medium">
                          Medium
                        </option>

                        <option value="Hard">
                          Hard
                        </option>
                      </Form.Select>
                    </Col>

                  </Row>

                </div>

                {/* VIEW FLASHCARDS */}
                {material.flashcardCount > 0 && (
                  <Button
                    as={Link}
                    to={`/flashcards/${material._id}`}
                    variant="outline-success"
                    className="me-2 mb-2"
                  >
                    View Flashcards
                  </Button>
                )}

                {/* PRACTICE QUIZ */}
                {material.quizCount > 0 && (
                  <Button
                    variant="outline-warning"
                    className="mb-2"
                    onClick={async () => {
                      try {
                        const res = await api.get(
                          '/quizzes',
                          {
                            params: {
                              material: material._id
                            }
                          }
                        );

                        if (res.data.length > 0) {
                          navigate(
                            `/quiz/${res.data[0]._id}`
                          );
                        }
                      } catch (err) {
                        setError(
                          'Failed to load quiz'
                        );
                      }
                    }}
                  >
                    Practice Quiz
                  </Button>
                )}

              </Card.Body>
            </Card>

            {/* =========================
                AI SUMMARY
            ========================== */}
            {summary && (
              <Card className="shadow-sm mb-4">

                <Card.Body>

                  <div className="d-flex justify-content-between align-items-center mb-3">

                    <div>
                      <h4 className="fw-bold mb-1">
                        🧠 AI Study Summary
                      </h4>

                      <small className="text-muted">
                        AI-generated notes for quick learning and revision
                      </small>
                    </div>

                    <Badge bg="primary">
                      AI Powered
                    </Badge>

                  </div>

                  <hr />

                  <div
                    className="summary-content"
                    style={{
                      fontSize: '16px',
                      color: '#212529'
                    }}
                  >
                    {renderSummary(summary)}
                  </div>

                </Card.Body>

              </Card>
            )}

          </Col>

          {/* =========================
              SIDEBAR
          ========================== */}
          <Col md={4}>

            <Card className="shadow-sm">

              <Card.Body>

                <h5 className="fw-bold mb-3">
                  Quick Actions
                </h5>

                <div className="d-grid gap-2">

                  <Button
                    as={Link}
                    to={`/flashcards/${material._id}`}
                    variant="outline-primary"
                    disabled={
                      material.flashcardCount === 0
                    }
                  >
                    📚 Study Flashcards
                  </Button>

                  <Button
                    variant="outline-success"
                    disabled={
                      material.quizCount === 0
                    }
                    onClick={async () => {
                      try {
                        const res = await api.get(
                          '/quizzes',
                          {
                            params: {
                              material: material._id
                            }
                          }
                        );

                        if (res.data.length > 0) {
                          navigate(
                            `/quiz/${res.data[0]._id}`
                          );
                        }
                      } catch (err) {
                        setError(
                          'Failed to load quiz'
                        );
                      }
                    }}
                  >
                    📝 Take Quiz
                  </Button>

                  <Button
                    as={Link}
                    to="/progress"
                    variant="outline-info"
                  >
                    📊 View Progress
                  </Button>

                </div>

              </Card.Body>

            </Card>

          </Col>

        </Row>
      )}

    </Container>
  );
};

export default MaterialDetails;