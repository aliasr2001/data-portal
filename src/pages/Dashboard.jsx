import { useState } from 'react';
import './Dashboard.css';
import Logo from '../components/Logo';

/**
 * Dashboard - The user profile and dashboard completion screen.
 * Follows a clean LinkedIn-like dark blue & white theme.
 */
function Dashboard({ userEmail, onLogout, connections, onToggleConnection, isFormCompleted, setIsFormCompleted }) {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
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
          setProfileData(prev => ({
            ...prev,
            photoFileName: file.name,
            photoDataUrl: event.target.result
          }));
        };
        reader.readAsDataURL(file);
      } else if (name === 'cvAttachment') {
        setProfileData(prev => ({
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (setIsFormCompleted) {
      setIsFormCompleted(true);
    }
    alert('Profile updated successfully!');
    console.log('Saved profile data:', profileData);
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
      {/* Top Navigation */}
      <header className="dashboard-nav">
        <Logo variant="dashboard" showDashboardSuffix />
        <button onClick={onLogout} className="dashboard-logout-btn">
          Sign out
        </button>
      </header>

      {/* Main Grid */}
      <main className="dashboard-grid">
        {/* Left column: Profile & Social */}
        <section className="dashboard-sidebar" aria-label="Profile sidebar">
          <div className="dashboard-card profile-summary-card">
            <div className="profile-avatar">
              {profileData.photoDataUrl ? (
                <img src={profileData.photoDataUrl} alt="Profile" className="avatar-img" />
              ) : (
                getDisplayName().charAt(0)
              )}
            </div>
            <h2 className="profile-name">{getDisplayName()}</h2>
            <p className="profile-email">{userEmail || 'candidate@dataportal.com'}</p>
            {profileData.currentJob && <p className="profile-title">{profileData.currentJob}</p>}
            
            {/* Profile Completion Bar */}
            <div className="profile-completion-bar-wrapper">
              <div className="profile-completion-label">
                <span>Profile Completion</span>
                <span className="profile-completion-pct">{completionPct}%</span>
              </div>
              <div className="profile-completion-track">
                <div 
                  className="profile-completion-fill" 
                  style={{ width: `${completionPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="dashboard-card social-connections-card">
            <h3 className="card-section-title">Connected Accounts</h3>
            <p className="card-section-desc">Link your social profiles to synchronize authorization metadata.</p>

            <ul className="connections-list">
              <li className="connection-item">
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

              <li className="connection-item">
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

        {/* Right column: Form */}
        <section className="dashboard-content" aria-label="Profile forms">
          <div className="dashboard-card form-card">
            <h2 className="card-title">Complete your Profile</h2>
            <p className="card-subtitle">Provide your professional information to set up your directory data.</p>

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
                  <select
                    id="nationality"
                    name="nationality"
                    className="portal-input"
                    value={profileData.nationality}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Nationality</option>
                    <option value="American">American</option>
                    <option value="British">British</option>
                    <option value="Canadian">Canadian</option>
                    <option value="Qatari">Qatari</option>
                    <option value="German">German</option>
                    <option value="Australian">Australian</option>
                    <option value="Indian">Indian</option>
                    <option value="Japanese">Japanese</option>
                    <option value="French">French</option>
                    <option value="Spanish">Spanish</option>
                    <option value="Italian">Italian</option>
                    <option value="Other">Other</option>
                  </select>
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
                    <span className="file-upload-name">
                      {profileData.cvFileName || 'No file chosen'}
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="profilePicture">Profile Picture Upload</label>
                  <div className="file-upload-wrapper">
                    <input
                      type="file"
                      id="profilePicture"
                      name="profilePicture"
                      className="portal-input file-input-hidden"
                      onChange={handleFileChange}
                      accept="image/*"
                      required={!profileData.photoFileName}
                    />
                    <label htmlFor="profilePicture" className="file-upload-btn">
                      Choose File
                    </label>
                    <span className="file-upload-name">
                      {profileData.photoFileName || 'No file chosen'}
                    </span>
                  </div>
                </div>

                <div className="form-group full-width">
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
                <button type="submit" className="portal-btn portal-btn--primary save-profile-btn">
                  Save Profile Settings
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
