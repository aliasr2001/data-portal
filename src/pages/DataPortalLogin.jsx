import { useState } from 'react';
import './DataPortalLogin.css';
import Logo from '../components/Logo';

/**
 * DataPortalLogin - Main entry login screen for the Data Portal.
 * Custom-branded with dark blue and white highlights, featuring a professional layout.
 */
function DataPortalLogin({ onGoogleLoginClick }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please fill in both fields.');
      return;
    }
    // Log local sign-in attempt
    console.log('Local login attempt:', { email });
    alert('Local sign-in authentication is currently in sandbox mode.');
  };

  const GoogleColorIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7l2.76 2.13c1.61-1.49 2.54-3.69 2.54-6.26z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.76-2.13c-.76.51-1.74.82-2.91.82-2.24 0-4.14-1.51-4.82-3.56H1.54v2.2A8.99 8.99 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M4.18 10.95a5.39 5.39 0 0 1 0-3.42V5.33H1.54a8.99 8.99 0 0 0 0 8.34l2.64-2.2A5.39 5.39 0 0 1 4.18 10.95z"/>
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.4A8.99 8.99 0 0 0 1.54 5.33l2.64 2.2C4.86 5.09 6.76 3.58 9 3.58z"/>
    </svg>
  );

  return (
    <div className="portal-login-container">
      {/* Top Navbar */}
      <header className="portal-navbar">
        <Logo />
      </header>

      {/* Main Card */}
      <main className="portal-login-main">
        <div className="portal-card">
          <h1 className="portal-card__title">Sign in</h1>
          <p className="portal-card__subtitle">Access your data hub dashboard</p>

          <form onSubmit={handleSubmit}>
            <div className="portal-form-group">
              <label className="portal-label" htmlFor="portal-email">Email</label>
              <input
                id="portal-email"
                type="email"
                className="portal-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="portal-form-group">
              <label className="portal-label" htmlFor="portal-password">Password</label>
              <input
                id="portal-password"
                type="password"
                className="portal-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="portal-btn portal-btn--primary">
              Sign in
            </button>
          </form>

          <div className="portal-divider">or</div>

          <button 
            type="button" 
            className="portal-btn portal-btn--secondary" 
            onClick={onGoogleLoginClick}
            id="google-oauth-btn"
          >
            <span className="portal-btn-icon">
              <GoogleColorIcon />
            </span>
            Continue with Google
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="portal-footer">
        <div>© 2026 DataPortal Inc.</div>
        <nav className="portal-footer-links" aria-label="Portal footer navigation">
          <a href="#">User Agreement</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Help Center</a>
        </nav>
      </footer>
    </div>
  );
}

export default DataPortalLogin;
