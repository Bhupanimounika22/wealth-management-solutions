import React, { useState } from 'react';
import { Button, Card, Container, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for confirm password visibility
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters long');
    }

    try {
      setLoading(true);
      await register(email, password);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      console.error("Registration error:", error);
      toast.error('Failed to create an account');
    } finally {
      setLoading(false);
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div className="w-100" style={{ maxWidth: '400px' }}>
        <Card className="bg-dark border-light">
          <Card.Body>
            <h2 className="text-center mb-4 text-light">Sign Up</h2>
            <Form onSubmit={handleSubmit}>
              <Form.Group id="email" className="mb-3">
                <Form.Label className='text-light'>Email</Form.Label>
                <Form.Control
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </Form.Group>
              <Form.Group id="password" className="mb-3">
                <Form.Label className='text-light'>Password</Form.Label>
                <div className="input-group">
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={togglePasswordVisibility}
                    disabled={loading}
                    className="text-light border-light"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </Button>
                </div>
              </Form.Group>
              <Form.Group id="confirm-password" className="mb-3">
                <Form.Label className='text-light'>Confirm Password</Form.Label>
                <div className="input-group">
                  <Form.Control
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={toggleConfirmPasswordVisibility}
                    disabled={loading}
                    className="text-light border-light"
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </Button>
                </div>
              </Form.Group>
              <Button disabled={loading} className="w-100 mb-3" type="submit">
                Sign Up
              </Button>
            </Form>
            <div className="w-100 text-center mt-3">
              <Link to="/login" className="text-light">Already have an account? Log In</Link>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}