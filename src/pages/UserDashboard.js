import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, ListGroup, Badge, Modal } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const UserDashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    // Filter documents based on search term
    if (searchTerm.trim() === '') {
      setFilteredDocuments(documents);
    } else {
      const filtered = documents.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredDocuments(filtered);
    }
  }, [documents, searchTerm]);

  const loadDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/user/documents');

      if (response.data.success) {
        setDocuments(response.data.documents);
        setFilteredDocuments(response.data.documents);
      } else {
        setError(response.data.error);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleDocumentClick = (document) => {
    setSelectedDocument(document);
    setShowDocumentModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return <LoadingSpinner message="Loading documents..." />;
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <div className="bg-white shadow-sm border-bottom">
        <Container fluid>
          <Row className="align-items-center py-3">
            <Col>
              <h1 className="mb-0 d-flex align-items-center">
                <i className="fas fa-mobile-alt text-success me-3"></i>
                User Dashboard
              </h1>
            </Col>
            <Col xs="auto">
              <div className="d-flex align-items-center">
                <span className="me-3 text-muted">
                  {user?.mobileNumber ? formatMobileNumber(user.mobileNumber) : 'User'}
                </span>
                <Button variant="outline-success" size="sm" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt me-1"></i>
                  Logout
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container fluid className="py-4">
        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {/* Search Bar */}
        <Row className="mb-4">
          <Col md={6}>
            <InputGroup>
              <InputGroup.Text>
                <i className="fas fa-search"></i>
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button
                  variant="outline-secondary"
                  onClick={() => setSearchTerm('')}
                >
                  <i className="fas fa-times"></i>
                </Button>
              )}
            </InputGroup>
          </Col>
          <Col md={6} className="text-end">
            <small className="text-muted">
              {filteredDocuments.length} of {documents.length} documents
            </small>
          </Col>
        </Row>

        {/* Documents Grid */}
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-5">
            <i className="fas fa-file-alt fa-4x text-muted mb-4"></i>
            <h3 className="text-muted">No documents found</h3>
            <p className="text-muted">
              {searchTerm ? 'Try adjusting your search terms' : 'No documents are currently available'}
            </p>
          </div>
        ) : (
          <Row className="g-4">
            {filteredDocuments.map((document) => (
              <Col key={document.id} md={6} lg={4}>
                <Card className="h-100 shadow-sm hover-card">
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="flex-grow-1">
                        <Card.Title className="h6 mb-1">
                          {truncateText(document.title, 50)}
                        </Card.Title>
                        <small className="text-muted">
                          Added {formatDate(document.created_at)}
                        </small>
                      </div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        href={document.google_drive_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ms-2"
                      >
                        <i className="fas fa-external-link-alt"></i>
                      </Button>
                    </div>

                    {document.description && (
                      <Card.Text className="text-muted flex-grow-1 mb-3">
                        {truncateText(document.description, 120)}
                      </Card.Text>
                    )}

                    <div className="mt-auto">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="w-100"
                        onClick={() => handleDocumentClick(document)}
                      >
                        <i className="fas fa-eye me-1"></i>
                        View Details
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      {/* Document Details Modal */}
      <Modal show={showDocumentModal} onHide={() => setShowDocumentModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-file-alt text-primary me-2"></i>
            {selectedDocument?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDocument && (
            <div>
              <Row className="mb-3">
                <Col sm={4}>
                  <strong>Added:</strong>
                </Col>
                <Col sm={8}>
                  {formatDate(selectedDocument.created_at)}
                </Col>
              </Row>

              {selectedDocument.description && (
                <Row className="mb-3">
                  <Col sm={4}>
                    <strong>Description:</strong>
                  </Col>
                  <Col sm={8}>
                    {selectedDocument.description}
                  </Col>
                </Row>
              )}

              <Row className="mb-3">
                <Col sm={4}>
                  <strong>Google Drive Link:</strong>
                </Col>
                <Col sm={8}>
                  <a
                    href={selectedDocument.google_drive_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-break"
                  >
                    {selectedDocument.google_drive_link}
                  </a>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col sm={4}>
                  <strong>File ID:</strong>
                </Col>
                <Col sm={8}>
                  <code className="small">{selectedDocument.file_id || 'N/A'}</code>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDocumentModal(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            href={selectedDocument?.google_drive_link}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fas fa-external-link-alt me-1"></i>
            Open in Google Drive
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .hover-card {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }

        .hover-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        }

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

export default UserDashboard;
