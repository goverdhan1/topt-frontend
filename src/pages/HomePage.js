import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-vh-100 bg-light">
      <Container className="py-5">
        <Row className="justify-content-center mb-5">
          <Col md={8} className="text-center">
            <h1 className="display-4 fw-bold text-primary mb-3">
              OTP Google Drive Authentication System
            </h1>
            <p className="lead text-muted">
              Secure admin-controlled user authentication with TOTP and Google Drive integration
            </p>
          </Col>
        </Row>

        <Row className="g-4 justify-content-center">
          <Col md={5}>
            <Card className="h-100 shadow-sm">
              <Card.Body className="d-flex flex-column">
                <div className="text-center mb-4">
                  <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center" style={{width: '60px', height: '60px'}}>
                    <i className="fas fa-user-shield fa-2x"></i>
                  </div>
                </div>
                <Card.Title className="text-center mb-3">Admin Portal</Card.Title>
                <Card.Text className="text-muted text-center flex-grow-1">
                  Manage users, verify accounts, and control document access with comprehensive admin tools.
                </Card.Text>
                <Link to="/admin/login" className="mt-auto">
                  <Button variant="primary" size="lg" className="w-100">
                    Admin Login
                  </Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>

          <Col md={5}>
            <Card className="h-100 shadow-sm">
              <Card.Body className="d-flex flex-column">
                <div className="text-center mb-4">
                  <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center" style={{width: '60px', height: '60px'}}>
                    <i className="fas fa-mobile-alt fa-2x"></i>
                  </div>
                </div>
                <Card.Title className="text-center mb-3">User Portal</Card.Title>
                <Card.Text className="text-muted text-center flex-grow-1">
                  Secure TOTP-based authentication and access to shared Google Drive documents.
                </Card.Text>
                <Link to="/user/login" className="mt-auto">
                  <Button variant="success" size="lg" className="w-100">
                    User Login
                  </Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-5">
          <Col className="text-center">
            <div className="bg-white p-4 rounded shadow-sm">
              <h3 className="mb-3">System Features</h3>
              <Row className="g-3">
                <Col md={4}>
                  <div className="d-flex align-items-center">
                    <i className="fas fa-shield-alt text-success me-2"></i>
                    <span>Secure Authentication</span>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="d-flex align-items-center">
                    <i className="fas fa-mobile-alt text-primary me-2"></i>
                    <span>TOTP Authentication</span>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="d-flex align-items-center">
                    <i className="fab fa-google-drive text-danger me-2"></i>
                    <span>Document Management</span>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="d-flex align-items-center">
                    <i className="fas fa-user-cog text-warning me-2"></i>
                    <span>Admin Control</span>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="d-flex align-items-center">
                    <i className="fas fa-search text-info me-2"></i>
                    <span>Document Search</span>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="d-flex align-items-center">
                    <i className="fas fa-history text-secondary me-2"></i>
                    <span>Audit Logging</span>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HomePage;
