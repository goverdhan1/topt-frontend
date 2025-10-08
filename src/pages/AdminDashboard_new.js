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
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [verifyingUser, setVerifyingUser] = useState(null);

  const { admin, adminLogout } = useAdmin();
  const navigate = useNavigate();

  // Form states
  const [userForm, setUserForm] = useState({ mobile: '', otpCode: '' });
  const [documentForm, setDocumentForm] = useState({ title: '', description: '', google_drive_link: '' });
  const [verifyForm, setVerifyForm] = useState({ otpCode: '' });

  // OTP sending states
  const [otpSending, setOtpSending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpError, setOtpError] = useState(null);

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
        mobile: userForm.mobile,
        otpCode: userForm.otpCode
      });

      if (response.data.success) {
        setShowUserModal(false);
        setUserForm({ mobile: '', otpCode: '' });
        loadData(); // Reload users
        alert('User added and verified successfully!');
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

  const handleVerifyUserClick = (user) => {
    setVerifyingUser(user);
    setVerifyForm({ otpCode: '' });
    setShowVerifyModal(true);
  };

  const handleVerifyUserWithOTP = async () => {
    if (!verifyingUser || !verifyForm.otpCode) {
      setError('Please enter the 6-digit OTP code');
      return;
    }

    try {
      setError(null);
      const response = await axios.put(`/api/admin/users/${verifyingUser.id}/verify-with-otp`, {
        otpCode: verifyForm.otpCode
      });

      if (response.data.success) {
        setShowVerifyModal(false);
        setVerifyingUser(null);
        setVerifyForm({ otpCode: '' });
        loadData(); // Reload users
        alert('User verified successfully!');
      } else {
        setError(response.data.error);
      }
    } catch (error) {
      console.error('Error verifying user with OTP:', error);
      setError(error.response?.data?.error || 'Failed to verify user');
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

  // OTP sending functions
  const handleSendOTP = async () => {
    if (!userForm.mobile) {
      setOtpError('Please enter a mobile number first');
      return;
    }

    setOtpSending(true);
    setOtpError(null);

    try {
      const response = await axios.post('/api/admin/send-otp', {
        mobile: userForm.mobile
      });

      if (response.data.success) {
        setOtpSent(true);
        setResendCooldown(60); // 60 second cooldown
        alert('OTP sent successfully! The user will receive a verification call/SMS.');
      } else {
        setOtpError(response.data.error);
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setOtpError(error.response?.data?.error || 'Failed to send OTP');
    } finally {
      setOtpSending(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) {
      return; // Still in cooldown period
    }

    await handleSendOTP();
  };

  // Countdown timer effect
  useEffect(() => {
    let interval;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [resendCooldown]);

  // Reset OTP states when modal is closed
  const handleCloseUserModal = () => {
    setShowUserModal(false);
    setUserForm({ mobile: '', otpCode: '' });
    setOtpSent(false);
    setResendCooldown(0);
    setOtpError(null);
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
                                  <div className="btn-group btn-group-sm">
                                    {!user.is_verified && (
                                      <Button
                                        variant="outline-success"
                                        size="sm"
                                        onClick={() => handleVerifyUserClick(user)}
                                        title="Verify with OTP"
                                      >
                                        <i className="fas fa-mobile-alt"></i>
                                      </Button>
                                    )}
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      onClick={() => handleDeleteUser(user.id)}
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
                              <tr key={doc.id}>
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
                                      onClick={() => handleDeleteDocument(doc.id)}
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
          {otpError && (
            <Alert variant="danger" dismissible onClose={() => setOtpError(null)}>
              <i className="fas fa-exclamation-triangle me-2"></i>
              {otpError}
            </Alert>
          )}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Mobile Number</Form.Label>
              <Form.Control
                type="tel"
                value={userForm.mobile}
                onChange={(e) => setUserForm(prev => ({ ...prev, mobile: e.target.value }))}
                placeholder="Enter mobile number with country code"
                disabled={otpSent}
              />
              <Form.Text className="text-muted">
                The user will receive a verification call from Twilio
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>OTP Code</Form.Label>
              <Form.Control
                type="text"
                value={userForm.otpCode}
                onChange={(e) => setUserForm(prev => ({ ...prev, otpCode: e.target.value.replace(/\D/g, '').substring(0, 6) }))}
                placeholder="Enter 6-digit OTP code"
                maxLength="6"
                className="text-center fs-5"
                style={{ letterSpacing: '0.3em' }}
                disabled={!otpSent}
              />
              <Form.Text className="text-muted">
                Enter the 6-digit code received by the user via call or SMS
              </Form.Text>
            </Form.Group>

            {/* OTP Status and Actions */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                {otpSent && (
                  <Badge bg="success" className="me-2">
                    <i className="fas fa-check-circle me-1"></i>
                    OTP Sent
                  </Badge>
                )}
                {resendCooldown > 0 && (
                  <small className="text-muted">
                    Resend available in {resendCooldown}s
                  </small>
                )}
              </div>

              <div className="btn-group btn-group-sm">
                {!otpSent ? (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={handleSendOTP}
                    disabled={otpSending || !userForm.mobile}
                  >
                    {otpSending ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane me-1"></i>
                        Send OTP
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleResendOTP}
                    disabled={resendCooldown > 0}
                  >
                    <i className="fas fa-redo me-1"></i>
                    {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend OTP'}
                  </Button>
                )}
              </div>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseUserModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddUser}
            disabled={!userForm.mobile || !userForm.otpCode || userForm.otpCode.length !== 6 || !otpSent}
          >
            Add User
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Verify User with OTP Modal */}
      <Modal show={showVerifyModal} onHide={() => setShowVerifyModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Verify User with OTP</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {verifyingUser && (
            <div>
              <p className="mb-3">
                <strong>User:</strong> {formatMobileNumber(verifyingUser.mobile_number)}
              </p>
              <p className="mb-3 text-muted">
                Enter the 6-digit OTP code that was sent to the user's mobile number via call or SMS.
              </p>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>OTP Code</Form.Label>
                  <Form.Control
                    type="text"
                    value={verifyForm.otpCode}
                    onChange={(e) => setVerifyForm({ otpCode: e.target.value.replace(/\D/g, '').substring(0, 6) })}
                    placeholder="Enter 6-digit code"
                    maxLength="6"
                    className="text-center fs-4"
                    style={{ letterSpacing: '0.5em' }}
                  />
                  <Form.Text className="text-muted">
                    The user should have received this code via call or SMS
                  </Form.Text>
                </Form.Group>
              </Form>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowVerifyModal(false)}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleVerifyUserWithOTP}
            disabled={!verifyForm.otpCode || verifyForm.otpCode.length !== 6}
          >
            Verify User
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
