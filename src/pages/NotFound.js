import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-vh-100 bg-light d-flex align-items-center">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <div className="mb-4">
              <i className="fas fa-exclamation-triangle fa-5x text-warning"></i>
            </div>
            <h1 className="display-4 mb-3">404 - Page Not Found</h1>
            <p className="lead text-muted mb-4">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <div className="d-flex gap-2 justify-content-center flex-wrap">
              <Link to="/">
                <Button variant="primary" size="lg">
                  <i className="fas fa-home me-2"></i>
                  Go Home
                </Button>
              </Link>
              <Link to="/admin/login">
                <Button variant="outline-primary" size="lg">
                  <i className="fas fa-user-shield me-2"></i>
                  Admin Login
                </Button>
              </Link>
              <Link to="/user/login">
                <Button variant="outline-success" size="lg">
                  <i className="fas fa-mobile-alt me-2"></i>
                  User Login
                </Button>
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default NotFound;
