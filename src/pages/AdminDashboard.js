import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Tab, Button, Table, Modal, Form, Alert, Badge } from 'react-bootstrap';
import { useAdmin } from '../contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';


const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  const { admin, adminLogout } = useAdmin();
  const navigate = useNavigate();

  // Form states
  const [userForm, setUserForm] = useState({ mobile: '' });
  const [documentForm, setDocumentForm] = useState({ title: '', description: '', google_drive_link: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersResponse, documentsResponse] = await Promise.all([
        axios.get('/api/admin/users'),
        axios.get('/api/admin/documents')
      ]);

      if (usersResponse.data.success) {
        setUsers(usersResponse.data.users);
      }

      if (documentsResponse.data.success) {
        setDocuments(documentsResponse.data.documents);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await adminLogout();
    navigate('/');
  };

  const handleAddUser = async () => {
    try {
      setError(null);
      const response = await axios.post('/api/admin/users', {
        mobile: userForm.mobile
      });

      if (response.data.success) {
        setShowUserModal(false);
        setUserForm({ mobile: '' });
        loadData(); // Reload users
        alert('User added successfully!');
      } else {
        setError(response.data.error);
      }
    } catch (error) {
      console.error('Error adding user:', error);
      setError(error.response?.data?.error || 'Failed to add user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      setError(null);
      const response = await axios.delete(`/api/admin/users/${userId}`);

      if (response.data.success) {
        loadData(); // Reload users
        alert('User deleted successfully');
      } else {
        setError(response.data.error);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(error.response?.data?.error || 'Failed to delete user');
    }
  };



  const handleAddDocument = async () => {
    try {
      setError(null);
      const response = await axios.post('/api/admin/documents', documentForm);

      if (response.data.success) {
        setShowDocumentModal(false);
        setDocumentForm({ title: '', description: '', google_drive_link: '' });
        loadData(); // Reload documents
        alert('Document added successfully');
      } else {
        setError(response.data.error);
      }
    } catch (error) {
      console.error('Error adding document:', error);
      setError(error.response?.data?.error || 'Failed to add document');
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      setError(null);
      const response = await axios.delete(`/api/admin/documents/${documentId}`);

      if (response.data.success) {
        loadData(); // Reload documents
        alert('Document deleted successfully');
      } else {
        setError(response.data.error);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      setError(error.response?.data?.error || 'Failed to delete document');
    }
  };

  // Reset form when modal is closed
  const handleCloseUserModal = () => {
    setShowUserModal(false);
    setUserForm({ mobile: '' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMobileNumber = (mobile) => {
    // Format mobile number for display
    const cleaned = mobile.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return mobile;
  };

  const getStatusBadge = (user) => {
    if (user.is_verified) {
      return <Badge bg="success">Verified</Badge>;
    }

    switch (user.verification_status) {
      case 'verification_initiated':
        return <Badge bg="info">Verification Initiated</Badge>;
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'otp_sent':
        return <Badge bg="primary">OTP Sent</Badge>;
      case 'verified':
        return <Badge bg="success">Verified</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  if (loading && users.length === 0) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <div className="bg-white shadow-sm border-bottom">
        <Container fluid>
          <Row className="align-items-center py-3">
            <Col>
              <h1 className="mb-0 d-flex align-items-center">
                <i className="fas fa-user-shield text-primary me-3"></i>
                Admin Dashboard
              </h1>
            </Col>
            <Col xs="auto">
              <div className="d-flex align-items-center">
                <span className="me-3 text-muted">Welcome, {admin?.username || 'Admin'}</span>
                <Button variant="outline-danger" size="sm" onClick={handleLogout}>
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
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        <Tab.Container activeKey={activeTab} onSelect={(key) => setActiveTab(key)}>
          <Row>
            <Col sm={3}>
              <Nav variant="pills" className="flex-column">
                <Nav.Item>
                  <Nav.Link eventKey="users" className="d-flex align-items-center">
                    <i className="fas fa-users me-2"></i>
                    Users ({users.length})
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="documents" className="d-flex align-items-center">
                    <i className="fas fa-file-alt me-2"></i>
                    Documents ({documents.length})
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>

            <Col sm={9}>
              <Tab.Content>
                {/* Users Tab */}
                <Tab.Pane eventKey="users">
                  <Card>
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">User Management</h5>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setShowUserModal(true)}
                      >
                        <i className="fas fa-plus me-1"></i>
                        Add User
                      </Button>
                    </Card.Header>
                    <Card.Body>
                      {users.length === 0 ? (
                        <div className="text-center py-4">
                          <i className="fas fa-users fa-3x text-muted mb-3"></i>
                          <p className="text-muted">No users found</p>
                        </div>
                      ) : (
                        <Table responsive>
                          <thead>
                            <tr>
                              <th>Mobile Number</th>
                              <th>Status</th>
                              <th>Created</th>
                              <th>Last Login</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {users.map((user) => (
                              <tr key={user.id}>
                                <td>{formatMobileNumber(user.mobile_number)}</td>
                                <td>
                                  {getStatusBadge(user)}
                                </td>
                                <td>{formatDate(user.created_at)}</td>
                                <td>{user.last_login ? formatDate(user.last_login) : 'Never'}</td>
                                <td>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleDeleteUser(user.id)}
                                  >
                                    <i className="fas fa-trash"></i>
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      )}
                    </Card.Body>
                  </Card>
                </Tab.Pane>

                {/* Documents Tab */}
                <Tab.Pane eventKey="documents">
                  <Card>
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">Document Management</h5>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setShowDocumentModal(true)}
                      >
                        <i className="fas fa-plus me-1"></i>
                        Add Document
                      </Button>
                    </Card.Header>
                    <Card.Body>
                      {documents.length === 0 ? (
                        <div className="text-center py-4">
                          <i className="fas fa-file-alt fa-3x text-muted mb-3"></i>
                          <p className="text-muted">No documents found</p>
                        </div>
                      ) : (
                        <Table responsive>
                          <thead>
                            <tr>
                              <th>Title</th>
                              <th>Description</th>
                              <th>Created</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {documents.map((doc) => (
                              <tr key={doc._id}>
                                <td>
                                  <strong>{doc.title}</strong>
                                </td>
                                <td>{doc.description || 'No description'}</td>
                                <td>{formatDate(doc.created_at)}</td>
                                <td>
                                  <div className="btn-group btn-group-sm">
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      href={doc.google_drive_link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <i className="fas fa-external-link-alt"></i>
                                    </Button>
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      onClick={() => handleDeleteDocument(doc._id)}
                                    >
                                      <i className="fas fa-trash"></i>
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      )}
                    </Card.Body>
                  </Card>
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </Container>

      {/* Add User Modal */}
      <Modal show={showUserModal} onHide={handleCloseUserModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Mobile Number</Form.Label>
              <Form.Control
                type="tel"
                value={userForm.mobile}
                onChange={(e) => setUserForm(prev => ({ ...prev, mobile: e.target.value }))}
                placeholder="Enter mobile number with country code"
              />
              <Form.Text className="text-muted">
                Enter the user's mobile number to add them to the system
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseUserModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddUser}
            disabled={!userForm.mobile}
          >
            Add User
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Document Modal */}
      <Modal show={showDocumentModal} onHide={() => setShowDocumentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Document</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={documentForm.title}
                onChange={(e) => setDocumentForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter document title"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={documentForm.description}
                onChange={(e) => setDocumentForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter document description (optional)"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Google Drive Link</Form.Label>
              <Form.Control
                type="url"
                value={documentForm.google_drive_link}
                onChange={(e) => setDocumentForm(prev => ({ ...prev, google_drive_link: e.target.value }))}
                placeholder="https://drive.google.com/..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDocumentModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddDocument}>
            Add Document
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
