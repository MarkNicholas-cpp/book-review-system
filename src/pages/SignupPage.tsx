import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import { signup } from '../auth/authClient';
import './SignupPage.css';

const SignupPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Check if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { isAuthenticated } = await import('../auth/authClient');
      if (isAuthenticated()) {
        navigate('/profile', { replace: true });
      }
    };
    checkAuth();
  }, [navigate]);

  const validateForm = (): boolean => {
    let isValid = true;
    setNameError(null);
    setEmailError(null);
    setPasswordError(null);

    if (!name.trim()) {
      setNameError('Name is required.');
      isValid = false;
    } else if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters.');
      isValid = false;
    }

    if (!email.trim()) {
      setEmailError('Email is required.');
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError('Please enter a valid email address.');
        isValid = false;
      }
    }

    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await signup({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (result.success && result.user) {
        // Redirect to profile
        navigate('/profile', { replace: true });
      } else {
        setError(result.error || 'Unable to create account. Please try again.');
        // Focus on first error field
        if (result.error?.includes('email')) {
          document.getElementById('email-input')?.focus();
        } else {
          document.getElementById('name-input')?.focus();
        }
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Header */}
        <header className="auth-header">
          <h1 className="auth-logo">BookReview</h1>
          <h2 className="auth-title">Create your account</h2>
          <p className="auth-subtitle">Start sharing reviews and writing blogs.</p>
        </header>

        {/* Error Message */}
        {error && (
          <div className="auth-error" role="alert">
            <p className="auth-error-message">{error}</p>
          </div>
        )}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <Input
            id="name-input"
            type="text"
            label="Name"
            placeholder="Your full name"
            className="auth-input"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameError(null);
              setError(null);
            }}
            error={nameError || undefined}
            disabled={loading}
            autoComplete="name"
            required
          />
          <Input
            id="email-input"
            type="email"
            label="Email"
            placeholder="you@example.com"
            className="auth-input"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError(null);
              setError(null);
            }}
            error={emailError || undefined}
            disabled={loading}
            autoComplete="email"
            required
          />
          <Input
            type="password"
            label="Password"
            placeholder="Create a strong password (min. 8 characters)"
            className="auth-input"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError(null);
              setError(null);
            }}
            error={passwordError || undefined}
            disabled={loading}
            autoComplete="new-password"
            required
          />

          <Button 
            variant="primary" 
            size="large" 
            className="auth-submit-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span className="divider-line"></span>
          <span className="divider-text">or continue with</span>
          <span className="divider-line"></span>
        </div>

        {/* Social Login */}
        <div className="social-login">
          <button type="button" className="social-btn" disabled>
            <span className="social-icon">G</span>
            <span>Continue with Google</span>
          </button>
          <button type="button" className="social-btn" disabled>
            <span className="social-icon">GH</span>
            <span>Continue with GitHub</span>
          </button>
        </div>

        {/* Secondary Action */}
        <div className="auth-secondary">
          <p className="secondary-text">
            Already have an account? <Link to="/login" className="secondary-link">Log in</Link>
          </p>
        </div>
      </div>

      {/* Footer Microcopy */}
      <p className="auth-footer">
        By continuing, you agree to our <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.
        <br />
        <small style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginTop: '8px', display: 'block' }}>
          This is a demo app — passwords are stored for mock auth only.
        </small>
      </p>
    </div>
  );
};

export default SignupPage;
