import { BarChart3, LayoutDashboard, LogOut, PiggyBank, Settings } from 'lucide-react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

export default function Navigation() {
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch {
      toast.error('Failed to log out');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <Nav className="flex-column bg-dark border-end border-secondary p-4" style={{ width: '250px', minHeight: '100vh' }}>
      <h3 className="text-light mb-4">Budget Tracker</h3>
      
      <Nav.Link 
        as={Link} 
        to="/" 
        className={`mb-3 ${isActive('/') ? 'text-primary' : 'text-light'}`}
      >
        <LayoutDashboard className="me-2" size={20} />
        Dashboard
      </Nav.Link>
      
      <Nav.Link 
        as={Link} 
        to="/savings" 
        className={`mb-3 ${isActive('/savings') ? 'text-primary' : 'text-light'}`}
      >
        <PiggyBank className="me-2" size={20} />
        Savings Goals
      </Nav.Link>
      
      <Nav.Link 
        as={Link} 
        to="/reports" 
        className={`mb-3 ${isActive('/reports') ? 'text-primary' : 'text-light'}`}
      >
        <BarChart3 className="me-2" size={20} />
        Reports
      </Nav.Link>
      
      <Nav.Link 
        as={Link} 
        to="/settings" 
        className={`mb-3 ${isActive('/settings') ? 'text-primary' : 'text-light'}`}
      >
        <Settings className="me-2" size={20} />
        Settings
      </Nav.Link>
      
      <Nav.Link 
        onClick={handleLogout}
        className="text-danger mt-auto"
        style={{ cursor: 'pointer' }}
      >
        <LogOut className="me-2" size={20} />
        Logout
      </Nav.Link>
    </Nav>
  );
}
