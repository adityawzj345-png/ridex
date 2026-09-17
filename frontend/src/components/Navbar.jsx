import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Ride<span>X</span>
        </Link>
        
        <div className="hamburger" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <span className={`bar ${isMobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`bar ${isMobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`bar ${isMobileMenuOpen ? 'open' : ''}`}></span>
        </div>

        <div className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/bikes" className="nav-link">Fleet</Link>
          {user ? (
            <>
              {user.is_admin && <Link to="/admin" className="nav-link">Dashboard</Link>}
              <Link to="/my-bookings" className="nav-link">My Bookings</Link>
              <Link to="/profile" className="nav-link">Profile</Link>
              <button onClick={logout} className="btn-secondary nav-btn" style={{ border: 'none', cursor: 'pointer' }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary nav-btn">Sign In</Link>
              <Link to="/register" className="btn-primary nav-btn">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
