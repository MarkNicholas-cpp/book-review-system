import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import Container from './Container';
import Button from './Button';
import { isAuthenticated, getCurrentUser, logout } from '../auth/authClient';
import type { User } from '../services/usersService';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const auth = isAuthenticated();
      setAuthenticated(auth);
      
      if (auth) {
        try {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      }
      
      setLoading(false);
    };

    checkAuth();

    // Listen for storage changes (logout from other tabs)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    setAuthenticated(false);
    navigate('/', { replace: true });
  };

  return (
    <nav className="navbar">
      <Container>
        <div className="navbar-content">
          <Link to="/" className="navbar-logo">
            <img 
              src="https://t3.ftcdn.net/jpg/08/16/60/34/360_F_816603463_EaoHWLUT1q1eDrAY7HCTfYgG8h8ZKeWN.jpg" 
              alt="BookReview Logo"
              className="navbar-logo-image"
            />
          </Link>
          <div className="navbar-links">
            <Link to="/" className="navbar-link">Home</Link>
            <Link to="/reviews" className="navbar-link">Reviews</Link>
            <Link to="/blogs" className="navbar-link">Blogs</Link>
            {authenticated && (
              <>
                <Link to="/write-review" className="navbar-link">Write Review</Link>
                <Link to="/write-blog" className="navbar-link">Write Blog</Link>
              </>
            )}
          </div>
          <div className="navbar-actions">
            {loading ? (
              <div className="navbar-loading">Loading...</div>
            ) : authenticated && user ? (
              <div className="navbar-user-menu">
                <Link to="/profile" className="navbar-user-link">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="navbar-avatar"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`navbar-avatar-placeholder ${user.avatar ? 'hidden' : ''}`}></div>
                  <span className="navbar-user-name">{user.name}</span>
                </Link>
                <button 
                  className="navbar-logout-btn"
                  onClick={handleLogout}
                  aria-label="Logout"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="small">Log in</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="small">Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </Container>
    </nav>
  );
};

export default Navbar;
