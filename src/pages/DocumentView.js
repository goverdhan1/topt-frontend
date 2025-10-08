import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const DocumentView = () => {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadDocument();
  }, [id]);

  const loadDocument = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/user/documents/${id}`);

      if (response.data.success) {
        setDocument(response.data.document);
      } else {
        setError(response.data.error);
      }
    } catch (error) {
      console.error('Error loading document:', error);
      setError('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <Spinner animation="border" role="status" className="mb-3">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="text-muted">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <Container>
          <Row className="justify-content-center">
            <Col md={6}>
              <Alert variant="danger" className="text-center">
                <i className="fas fa-exclamation-triangle fa-3x mb-3"></i>
                <h4>Error Loading Document</h4>
                <p>{error}</p>
                <Button variant="primary" onClick={() => navigate('/user/dashboard')}>
                  <i className="fas fa-arrow-left me-1"></i>
                  Back to Dashboard
                </Button>
              </Alert>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <Container>
          <Row className="justify-content-center">
            <Col md={6}>
              <Alert variant="warning" className="text-center">
                <i className="fas fa-file-alt fa-3x mb-3"></i>
                <h4>Document Not Found</h4>
                <p>The requested document could not be found.</p>
                <Button variant="primary" onClick={() => navigate('/user/dashboard')}>
                  <i className="fas fa-arrow-left me-1"></i>
                  Back to Dashboard
                </Button>
              </Alert>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <div className="bg-white shadow-sm border-bottom">
        <Container fluid>
          <Row className="align-items-center py-3">
            <Col>
              <Button
                variant="link"
                onClick={() => navigate('/user/dashboard')}
                className="text-decoration-none p-0 me-3"
              >
                <i className="fas fa-arrow-left me-1"></i>
                Back to Dashboard
              </Button>
              <h1 className="mb-0 d-inline">
                <i className="fas fa-file-alt text-primary me-2"></i>
                {document.title}
              </h1>
            </Col>
            <Col xs="auto">
              <Button
                variant="primary"
                href={document.google_drive_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fas fa-external-link-alt me-1"></i>
                Open in Google Drive
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      <Container fluid className="py-4">
        <Row>
          <Col lg={8}>
            <Card>
              <Card.Body>
                <Row className="mb-4">
                  <Col sm={4}>
                    <strong>Added:</strong>
                  </Col>
                  <Col sm={8}>
                    {formatDate(document.created_at)}
                  </Col>
                </Row>

                {document.updated_at && document.updated_at !== document.created_at && (
                  <Row className="mb-4">
                    <Col sm={4}>
                      <strong>Last Updated:</strong>
                    </Col>
                    <Col sm={8}>
                      {formatDate(document.updated_at)}
                    </Col>
                  </Row>
                )}

                {document.description && (
                  <Row className="mb-4">
                    <Col sm={4}>
                      <strong>Description:</strong>
                    </Col>
                    <Col sm={8}>
                      <div className="bg-light p-3 rounded">
                        {document.description}
                      </div>
                    </Col>
                  </Row>
                )}

                <Row className="mb-4">
                  <Col sm={4}>
                    <strong>Google Drive Link:</strong>
                  </Col>
                  <Col sm={8}>
                    <a
                      href={document.google_drive_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="d-block p-2 bg-light rounded text-break"
                    >
                      {document.google_drive_link}
                    </a>
                  </Col>
                </Row>

                {document.file_id && (
                  <Row className="mb-4">
                    <Col sm={4}>
                      <strong>File ID:</strong>
                    </Col>
                    <Col sm={8}>
                      <code className="bg-light p-2 rounded d-block">
                        {document.file_id}
                      </code>
                    </Col>
                  </Row>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  <i className="fas fa-info-circle me-2"></i>
                  Document Actions
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="d-grid gap-2">
                  <Button
                    variant="primary"
                    href={document.google_drive_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="lg"
                  >
                    <i className="fas fa-external-link-alt me-2"></i>
                    Open Document
                  </Button>

                  <Button
                    variant="outline-secondary"
                    onClick={() => navigator.clipboard.writeText(document.google_drive_link)}
                    size="lg"
                  >
                    <i className="fas fa-copy me-2"></i>
                    Copy Link
                  </Button>

                  <Button
                    variant="outline-info"
                    onClick={() => window.open(`mailto:?subject=Shared Document: ${document.title}&body=Check out this document: ${document.google_drive_link}`, '_blank')}
                    size="lg"
                  >
                    <i className="fas fa-share me-2"></i>
                    Share
                  </Button>
                </div>
              </Card.Body>
            </Card>

            <Card className="mt-3">
              <Card.Header>
                <h5 className="mb-0">
                  <i className="fas fa-user me-2"></i>
                  Your Info
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="text-center">
                  <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                    <i className="fas fa-mobile-alt fa-2x"></i>
                  </div>
                  <h6>Authenticated User</h6>
                  <p className="text-muted mb-1">
                    {user?.mobileNumber ? formatMobileNumber(user.mobileNumber) : 'N/A'}
                  </p>
                  <small className="text-success">
                    <i className="fas fa-check-circle me-1"></i>
                    Verified Access
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <style jsx>{`
        .text-break {
          word-break: break-all;
        }
      `}</style>
    </div>
  );
};

// Helper function to format mobile number
const formatMobileNumber = (mobile) => {
  const cleaned = mobile.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return mobile;
};

export default DocumentView;
