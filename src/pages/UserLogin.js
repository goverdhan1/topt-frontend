import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Modal } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const QRCodeModal = ({ show, onHide, qrData, secret }) => {
  return (
    <Modal show={show} onHide={onHide} centered size="md">
      <Modal.Header closeButton>
        <Modal.Title>Setup Authenticator App</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <p className="mb-3">
          Scan this QR code with your authenticator app (like Google Authenticator or Authy):
        </p>
        {qrData?.base64 && (
          <div className="mb-3">
            <img
              src={qrData.base64}
              alt="TOTP QR Code"
              style={{ maxWidth: '200px', maxHeight: '200px' }}
            />
          </div>
        )}
        <p className="text-muted small mb-3">
          Or manually enter this secret key: <code>{secret}</code>
        </p>
        <Alert variant="info">
          <strong>Next step:</strong> After scanning, enter the 6-digit code from your authenticator app.
        </Alert>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onHide}>
          I've scanned the code
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const UserLogin = () => {
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [formData, setFormData] = useState({
    mobile: '',
    otp: ''
  });
  const [validated, setValidated] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [totpSecret, setTotpSecret] = useState('');
  const [isLoginFlow, setIsLoginFlow] = useState(false);

  const { requestOTP, login, loading, error, setError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/user/dashboard';

  React.useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const formatPhoneNumber = (phone) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // Add country code if not present
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    } else if (cleaned.length > 10) {
      return `+${cleaned}`;
    }

    return phone;
  };

  const handlePhoneChange = (e) => {
    const { value } = e.target;
    let formatted = value;

    // Allow only digits, spaces, parentheses, hyphens, and plus sign
    formatted = formatted.replace(/[^\d\s\-\(\)\+]/g, '');

    // Limit length
    if (formatted.replace(/\D/g, '').length > 15) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      mobile: formatted
    }));

    if (error) setError(null);
  };

  const handleOTPChange = (e) => {
    const { value } = e.target;
    // Allow only digits and limit to 6 characters
    const formatted = value.replace(/\D/g, '').substring(0, 6);

    setFormData(prev => ({
      ...prev,
      otp: formatted
    }));

    if (error) setError(null);
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setValidated(true);

    const formattedMobile = formatPhoneNumber(formData.mobile);

    const result = await requestOTP(formattedMobile);

    if (result.success) {
      if (result.enabled) {
        // TOTP already enabled, proceed to OTP input for login
        setIsLoginFlow(true);
        setOtpRequested(true);
        setStep('otp');
        setCountdown(30); // 30 second countdown
      } else if (result.qrData) {
        // First-time setup, show QR code modal
        setIsLoginFlow(false);
        setQrData(result.qrData);
        setTotpSecret(result.secret);
        setShowQRModal(true);
        setOtpRequested(true);
        setStep('otp');
        setCountdown(30); // 30 second countdown
      }
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setValidated(true);

    const formattedMobile = formatPhoneNumber(formData.mobile);
    const result = await login(formattedMobile, formData.otp);

    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    const formattedMobile = formatPhoneNumber(formData.mobile);
    const result = await requestOTP(formattedMobile);

    if (result.success) {
      if (result.enabled) {
        // Already enabled, just reset countdown
        setCountdown(30);
      } else if (result.qrData) {
        // Regenerate QR for setup
        setQrData(result.qrData);
        setTotpSecret(result.secret);
        setShowQRModal(true);
        setCountdown(30);
      }
    }
  };

  const resetForm = () => {
    setStep('phone');
    setFormData({ mobile: '', otp: '' });
    setValidated(false);
    setOtpRequested(false);
    setCountdown(0);
    setError(null);
    setIsLoginFlow(false);
  };

  if (loading) {
    return <LoadingSpinner message="Authenticating..." />;
  }

  return (
    <>
      <div className="min-vh-100 bg-light d-flex align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md={6} lg={5}>
              <Card className="shadow">
                <Card.Body className="p-4">
                  <div className="text-center mb-4">
                    <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                      <i className="fas fa-mobile-alt fa-2x"></i>
                    </div>
                    <h2 className="mb-2">User Login</h2>
                    <p className="text-muted">
                      {step === 'phone' ? (isLoginFlow ? 'Enter your mobile number to login' : 'Enter your mobile number to setup TOTP authentication') : 'Enter the 6-digit code from your authenticator app'}
                    </p>
                  </div>

                  {error && (
                    <Alert variant="danger" className="mb-4">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      {error}
                    </Alert>
                  )}

                  {step === 'phone' ? (
                    <Form noValidate validated={validated} onSubmit={handlePhoneSubmit}>
                      <Form.Group className="mb-4">
                        <Form.Label>Mobile Number</Form.Label>
                        <Form.Control
                          type="tel"
                          name="mobile"
                          value={formData.mobile}
                          onChange={handlePhoneChange}
                          placeholder="Enter your mobile number"
                          required
                          disabled={loading}
                        />
                        <Form.Text className="text-muted">
                          Enter your mobile number with country code (e.g., +1234567890)
                        </Form.Text>
                        <Form.Control.Feedback type="invalid">
                          Please enter a valid mobile number.
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Button
                        variant="success"
                        type="submit"
                        size="lg"
                        className="w-100 mb-3"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            {isLoginFlow ? 'Logging in...' : 'Setting up authentication...'}
                          </>
                        ) : (
                          isLoginFlow ? 'Login' : 'Setup Authentication'
                        )}
                      </Button>
                    </Form>
                  ) : (
                    <Form noValidate validated={validated} onSubmit={handleOTPSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>OTP Code</Form.Label>
                        <Form.Control
                          type="text"
                          name="otp"
                          value={formData.otp}
                          onChange={handleOTPChange}
                          placeholder="Enter 6-digit OTP"
                          maxLength="6"
                          required
                          disabled={loading}
                          className="text-center fs-4"
                          style={{ letterSpacing: '0.5em' }}
                        />
                        <Form.Text className="text-muted">
                          Enter the 6-digit code from your authenticator app
                        </Form.Text>
                        <Form.Control.Feedback type="invalid">
                          Please enter the 6-digit OTP code.
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Button
                        variant="success"
                        type="submit"
                        size="lg"
                        className="w-100 mb-3"
                        disabled={loading || formData.otp.length !== 6}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Verifying...
                          </>
                        ) : (
                          'Verify & Login'
                        )}
                      </Button>

                      <div className="text-center">
                        <Button
                          variant="link"
                          onClick={handleResendOTP}
                          disabled={countdown > 0}
                          className="text-decoration-none"
                        >
                          {countdown > 0 ? `Resend in ${countdown}s` : (isLoginFlow ? 'Resend OTP' : 'Regenerate QR Code')}
                        </Button>
                      </div>
                    </Form>
                  )}

                  <div className="text-center mt-3">
                    <Button variant="link" onClick={resetForm} className="text-decoration-none">
                      <i className="fas fa-arrow-left me-1"></i>
                      {step === 'phone' ? 'Back to Home' : 'Change Number'}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
      <QRCodeModal 
        show={showQRModal} 
        onHide={() => setShowQRModal(false)} 
        qrData={qrData} 
        secret={totpSecret} 
      />
    </>
  );
};

export default UserLogin;
