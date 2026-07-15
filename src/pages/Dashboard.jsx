import { useState } from 'react';
import './Dashboard.css';
import Logo from '../components/Logo';

/**
 * Dashboard - The user profile and dashboard completion screen.
 * Uses a richer, more polished layout inspired by modern recruitment portals.
 */
function Dashboard({ userEmail, onLogout, connections, onToggleConnection, isFormCompleted, setIsFormCompleted, onSubmitSuccess }) {
  const [profileData, setProfileData] = useState({
    fullName: '',
    phone: '',
    currentJob: '',
    expectedSalary: '',
    cvFileName: '',
    coverLetter: '',
    photoFileName: '',
    photoDataUrl: '',
    address: '',
    joiningDate: '',
    nationality: ''
  });
  const [saveStatus, setSaveStatus] = useState('');
  const API_BASE_URL = import.meta.env.VITE_API_URL || '';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      if (name === 'profilePicture') {
        const reader = new FileReader();
        reader.onload = (event) => {
          setProfileData((prev) => ({
            ...prev,
            photoFileName: file.name,
            photoDataUrl: event.target.result
          }));
        };
        reader.readAsDataURL(file);
      } else if (name === 'cvAttachment') {
        setProfileData((prev) => ({
          ...prev,
          cvFileName: file.name
        }));
      }
    }
  };

  const handleToggleConnection = (platform) => {
    if (onToggleConnection) {
      onToggleConnection(platform);
    }
  };

  const isFormReady = Boolean(
    connections.facebook &&
    connections.instagram &&
    profileData.fullName &&
    profileData.phone &&
    profileData.currentJob &&
    profileData.expectedSalary &&
    profileData.cvFileName &&
    profileData.address &&
    profileData.joiningDate &&
    profileData.nationality
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormReady) {
      setSaveStatus('Please complete all required fields and connect both social accounts before submitting.');
      return;
    }

    setSaveStatus('Saving your profile...');

    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/save-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: (userEmail || '').trim().toLowerCase(),
          profile: profileData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to save profile');
      }

      if (setIsFormCompleted) {
        setIsFormCompleted(true);
      }
      setSaveStatus('Profile submitted successfully.');
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveStatus(error.message || 'Unable to save profile.');
      alert(error.message || 'Unable to save profile.');
    }
  };

  const getDisplayName = () => {
    if (profileData.fullName) return profileData.fullName;
    if (userEmail) {
      const part = userEmail.split('@')[0];
      return part.charAt(0).toUpperCase() + part.slice(1);
    }
    return 'Candidate';
  };

  const calculateCompletion = () => {
    let pct = 0;
    if (isFormCompleted) pct += 50;
    if (connections.facebook) pct += 15;
    if (connections.instagram) pct += 15;
    return pct;
  };

  const completionPct = calculateCompletion();

  return (
    <div className="dashboard-container">
      <header className="dashboard-nav">
        <div className="dashboard-nav-brand">
          <Logo variant="dashboard" showDashboardSuffix />
          <span className="dashboard-nav-badge">Talent Portal</span>
        </div>
        <div className="dashboard-nav-actions">
          <div className="dashboard-status-pill">
            <span className="dashboard-status-dot" />
            {isFormCompleted ? 'Profile ready' : 'Draft in progress'}
          </div>
          <button onClick={onLogout} className="dashboard-logout-btn">
            Sign out
          </button>
        </div>
      </header>

      <main className="dashboard-grid">
        <section className="dashboard-sidebar" aria-label="Profile sidebar">
          <div className="dashboard-card profile-summary-card">
            <label htmlFor="profilePicture" className="profile-avatar-upload" title="Upload profile photo">
              <div className="profile-avatar">
                {profileData.photoDataUrl ? (
                  <img src={profileData.photoDataUrl} alt="Profile" className="avatar-img" />
                ) : (
                  <div className="avatar-placeholder-content">
                    <span className="avatar-initial">{getDisplayName().charAt(0)}</span>
                    <span className="avatar-upload-text">Upload Photo</span>
                  </div>
                )}
              </div>
              <span className="avatar-upload-hint">Tap to upload</span>
              <input
                type="file"
                id="profilePicture"
                name="profilePicture"
                className="file-input-hidden"
                onChange={handleFileChange}
                accept="image/*"
              />
            </label>
            <h2 className="profile-name">{getDisplayName()}</h2>
            <p className="profile-email">{userEmail || 'candidate@dataportal.com'}</p>
            <div className="profile-role-row">
              <span className="profile-role-chip">{profileData.currentJob || 'Open to opportunities'}</span>
              <span className="profile-role-chip">Available soon</span>
            </div>

            <div className="profile-completion-bar-wrapper">
              <div className="profile-completion-label">
                <span>Profile Completion</span>
                <span className="profile-completion-pct">{completionPct}%</span>
              </div>
              <div className="profile-completion-track">
                <div className="profile-completion-fill" style={{ width: `${completionPct}%` }} />
              </div>
            </div>
          </div>

          <div className="dashboard-card social-connections-card">
            <div className="social-header">
              <div>
                <h3 className="card-section-title">Social Profiles</h3>
                <p className="card-section-desc">Attach your social media profiles to standout to HR Manager.</p>
              </div>
              <span className="social-pill">{(connections.facebook ? 1 : 0) + (connections.instagram ? 1 : 0)} linked</span>
            </div>

            <ul className="connections-list">
              <li className="connection-item facebook-item">
                <div className="platform-info">
                  <span className="platform-icon facebook-color">f</span>
                  <div>
                    <div className="platform-name">Facebook</div>
                    <div className="platform-status">{connections.facebook ? 'Connected' : 'Not connected'}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleConnection('facebook')}
                  className={`connection-toggle-btn ${connections.facebook ? 'connected' : ''}`}
                >
                  {connections.facebook ? 'Disconnect' : 'Connect'}
                </button>
              </li>

              <li className="connection-item instagram-item">
                <div className="platform-info">
                  <span className="platform-icon instagram-color">ig</span>
                  <div>
                    <div className="platform-name">Instagram</div>
                    <div className="platform-status">{connections.instagram ? 'Connected' : 'Not connected'}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleConnection('instagram')}
                  className={`connection-toggle-btn ${connections.instagram ? 'connected' : ''}`}
                >
                  {connections.instagram ? 'Disconnect' : 'Connect'}
                </button>
              </li>
            </ul>
          </div>
        </section>

        <section className="dashboard-content" aria-label="Profile forms">
          <div className="dashboard-hero-card">
            <div className="hero-copy">
              <p className="hero-eyebrow">Applicant profile</p>
              <h1>Build a polished profile that hiring teams remember.</h1>
              <p>Complete your details. So, the HR team can reach you.</p>
            </div>
            <div className="hero-highlights">
              <div className="hero-highlight">
                <strong>{connections.facebook ? '1' : '0'}</strong>
                <span>Social link</span>
              </div>
              <div className="hero-highlight">
                <strong>{profileData.cvFileName ? '1' : '0'}</strong>
                <span>Document ready</span>
              </div>
            </div>
          </div>

          <div className="dashboard-card form-card">
            <div className="profile-hero">
              <div className="profile-hero-left">
                <h2 className="profile-hero-title">Your details</h2>
                <p className="profile-hero-sub">Keep your application information accurate and easy to review.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    className="portal-input"
                    value={profileData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your first and last name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="portal-input"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-0000"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="currentJob">Current Job</label>
                  <input
                    type="text"
                    id="currentJob"
                    name="currentJob"
                    className="portal-input"
                    value={profileData.currentJob}
                    onChange={handleInputChange}
                    placeholder="e.g. Software Engineer"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="expectedSalary">Expected Salary</label>
                  <input
                    type="text"
                    id="expectedSalary"
                    name="expectedSalary"
                    className="portal-input"
                    value={profileData.expectedSalary}
                    onChange={handleInputChange}
                    placeholder="e.g. $100,000 / year"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="nationality">Nationality</label>
                  <input
                    type="text"
                    id="nationality"
                    name="nationality"
                    className="portal-input"
                    value={profileData.nationality}
                    onChange={handleInputChange}
                    placeholder="Enter your nationality"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="joiningDate">When are you able to join us?</label>
                  <input
                    type="date"
                    id="joiningDate"
                    name="joiningDate"
                    className="portal-input"
                    value={profileData.joiningDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    className="portal-input"
                    value={profileData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your street address, city, state, and zip code"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cvAttachment">CV Attachment</label>
                  <div className="file-upload-wrapper">
                    <input
                      type="file"
                      id="cvAttachment"
                      name="cvAttachment"
                      className="portal-input file-input-hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx"
                      required={!profileData.cvFileName}
                    />
                    <label htmlFor="cvAttachment" className="file-upload-btn">
                      Choose File
                    </label>
                    <span className="file-upload-name">{profileData.cvFileName || 'No file chosen'}</span>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="coverLetter">Cover Letter (Optional)</label>
                  <textarea
                    id="coverLetter"
                    name="coverLetter"
                    className="portal-input textarea-field"
                    value={profileData.coverLetter}
                    onChange={handleInputChange}
                    placeholder="Introduce yourself and tell us why you are a great fit..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="form-actions">
                <div className="save-status-text">{saveStatus}</div>
                <button type="submit" className="portal-btn portal-btn--primary save-profile-btn" disabled={!isFormReady}>
                  Submit Profile
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
