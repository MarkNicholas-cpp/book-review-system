import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import { login } from '../auth/authClient';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Check if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { isAuthenticated } = await import('../auth/authClient');
      if (isAuthenticated()) {
        const next = searchParams.get('next') || '/profile';
        navigate(next, { replace: true });
      }
    };
    checkAuth();
  }, [navigate, searchParams]);

  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError(null);
    setPasswordError(null);

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
      const result = await login(email.trim(), password);

      if (result.success && result.user) {
        // Get redirect destination
        const next = searchParams.get('next') || '/profile';
        navigate(next, { replace: true });
      } else {
        setError(result.error || 'Unable to log in. Please try again.');
        // Focus on first input
        document.getElementById('email-input')?.focus();
      }
    } catch (err) {
      console.error('Login error:', err);
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
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Enter your email to continue.</p>
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
            placeholder="Enter your password"
            className="auth-input"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError(null);
              setError(null);
            }}
            error={passwordError || undefined}
            disabled={loading}
            autoComplete="current-password"
            required
          />

          <div className="auth-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              <span>Remember me</span>
            </label>
            <div className="forgot-password-link">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
          </div>

          <Button 
            variant="primary" 
            size="large" 
            className="auth-submit-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Continue'}
          </Button>
        </form>

        {/* Demo Credentials */}
        <div className="demo-credentials">
          <div className="demo-header">
            <span className="divider-line"></span>
            <span className="divider-text">Demo Accounts</span>
            <span className="divider-line"></span>
          </div>
          <div className="demo-accounts">
            <button
              type="button"
              className="demo-account-btn"
              onClick={() => {
                setEmail('sarah@demo.com');
                setPassword('demo123');
                setError(null);
              }}
              disabled={loading}
            >
              <span className="demo-account-name">Sarah Johnson</span>
              <span className="demo-account-email">sarah@demo.com</span>
            </button>
            <button
              type="button"
              className="demo-account-btn"
              onClick={() => {
                setEmail('emma@demo.com');
                setPassword('demo123');
                setError(null);
              }}
              disabled={loading}
            >
              <span className="demo-account-name">Emma Wilson</span>
              <span className="demo-account-email">emma@demo.com</span>
            </button>
            <button
              type="button"
              className="demo-account-btn"
              onClick={() => {
                setEmail('michael@demo.com');
                setPassword('demo123');
                setError(null);
              }}
              disabled={loading}
            >
              <span className="demo-account-name">Michael Chen</span>
              <span className="demo-account-email">michael@demo.com</span>
            </button>
          </div>
          <p className="demo-note">Click any account to auto-fill credentials. Password: <strong>demo123</strong></p>
        </div>

        {/* Secondary Action */}
        <div className="auth-secondary">
          <p className="secondary-text">
            Don't have an account? <Link to="/signup" className="secondary-link">Sign up</Link>
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

export default LoginPage;
