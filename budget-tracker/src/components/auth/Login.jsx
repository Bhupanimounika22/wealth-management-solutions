import React, { useState } from 'react';
import { Button, Card, Container, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const { login, googleSignIn } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      setLoading(true);
      await googleSignIn();
      navigate('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div className="w-100" style={{ maxWidth: '400px' }}>
        <Card className="bg-dark border-light">
          <Card.Body>
            <h2 className="text-center mb-4 text-light">Log In</h2>
            <Form onSubmit={handleSubmit}>
              <Form.Group id="email" className="mb-3">
                <Form.Label className='text-light' type="email">Email</Form.Label>
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
                    type={showPassword ? 'text' : 'password'} // Toggle between text and password
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
              <Button disabled={loading} className="w-100 mb-3" type="submit">
                Log In
              </Button>
              <Button
                variant="outline-light"
                className="w-100 mb-3"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                Sign In with Google
              </Button>
            </Form>
            <div className="w-100 text-center mt-3">
              <Link to="/register" className="text-light">Need an account? Sign Up</Link>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}