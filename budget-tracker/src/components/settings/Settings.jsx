import { useState } from 'react';
import { Button, Card, Container, Form } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';

export default function Settings() {
  const { currentUser, updatePassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      await updatePassword(newPassword);
      setSuccess('Password updated successfully');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container>
      <h2 className="mb-4 text-light">Settings</h2>
      <Card className="bg-dark border-light">
        <Card.Body>
          <h5 className="mb-4 text-light">Account Settings</h5>
          <Form onSubmit={handlePasswordChange}>
            <Form.Group className="mb-3">
              <Form.Label className="text-light">Email</Form.Label>
              <Form.Control
                type="email"
                value={currentUser?.email || ''}
                disabled
              />
            </Form.Group>

            {/* Other Settings Fields */}

            <Form.Group className="mb-3">
              <Form.Label className="text-light">New Password</Form.Label>
              <Form.Control
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="text-light">Confirm Password</Form.Label>
              <Form.Control
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Form.Group>

            {error && <p className="text-danger">{error}</p>}
            {success && <p className="text-success">{success}</p>}

            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
