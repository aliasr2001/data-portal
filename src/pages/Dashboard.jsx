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
    cvFileName: '',
    coverLetter: '',
    photoFileName: '',
    photoDataUrl: '',
    address: '',
    joiningDate: '',
    nationality: ''
  });
  const [experienceEntries, setExperienceEntries] = useState([]);
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [experienceForm, setExperienceForm] = useState({
    position: '',
    company: '',
    currentlyWorking: false
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

  const handleExperienceInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setExperienceForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleExperienceForm = () => {
    setShowExperienceForm((prev) => !prev);
    if (!showExperienceForm) {
      setExperienceForm({ position: '', company: '', currentlyWorking: false });
    }
  };

  const addExperience = () => {
    if (!experienceForm.position.trim() || !experienceForm.company.trim()) {
      return;
    }
    setExperienceEntries((prev) => [...prev, { ...experienceForm }]);
    setExperienceForm({ position: '', company: '', currentlyWorking: false });
    setShowExperienceForm(false);
  };

  const removeExperience = (index) => {
    setExperienceEntries((prev) => prev.filter((_, i) => i !== index));
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

  const missingRequirements = [];

  if (!connections.facebook) {
    missingRequirements.push('Connect your Facebook profile');
  }
  if (!connections.instagram) {
    missingRequirements.push('Connect your Instagram profile');
  }
  if (!profileData.fullName) {
    missingRequirements.push('Enter your full name');
  }
  if (!profileData.phone) {
    missingRequirements.push('Enter your phone number');
  }
  if (!profileData.cvFileName) {
    missingRequirements.push('Upload your CV');
  }
  if (!profileData.joiningDate) {
    missingRequirements.push('Select your joining date');
  }
  if (!profileData.nationality) {
    missingRequirements.push('Enter your nationality');
  }

  const isFormReady = missingRequirements.length === 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormReady) {
      setSaveStatus(`Please complete the following before submitting: ${missingRequirements.join(', ')}`);
      return;
    }

    setSaveStatus('Saving your profile...');

    try {
      const submissionProfile = {
        ...profileData,
        photoDataUrl: ''
      };

      const formData = new FormData();
      formData.append('email', (userEmail || '').trim().toLowerCase());
      formData.append('profile', JSON.stringify(submissionProfile));

      const cvInput = document.getElementById('cvAttachment');
      if (cvInput?.files?.[0]) {
        formData.append('cvAttachment', cvInput.files[0]);
      }

      const response = await fetch(`${API_BASE_URL}/api/profile/save-profile`, {
        method: 'POST',
        body: formData
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
                    {/* <span className="avatar-initial">{getDisplayName().charAt(0)}</span> */}
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
                <p className="card-section-desc">Attach your social media profiles to complete 30% profile.</p>
              </div>
              <span className="social-pill">{(connections.facebook ? 1 : 0) + (connections.instagram ? 1 : 0)} linked</span>
            </div>

            <ul className="connections-list">
              <li className="connection-item facebook-item">
                <div className="platform-info">
                  <span className="platform-icon facebook-color-svg">
                    <svg viewBox="0 0 36 36" width="38" height="38" fill="currentColor">
                      <path fill="#1877f2" d="M20.181 35.87C29.094 34.791 36 27.202 36 18c0-9.941-8.059-18-18-18S0 8.059 0 18c0 8.442 5.811 15.526 13.652 17.471L14 34h5.5l.681 1.87Z"></path>
                      <path fill="#ffffff" d="M13.651 35.471v-11.97H9.936V18h3.715v-2.37c0-6.127 2.772-8.964 8.784-8.964 1.138 0 3.103.223 3.91.446v4.983c-.425-.043-1.167-.065-2.081-.065-2.952 0-4.09 1.116-4.09 4.025V18h5.883l-1.008 5.5h-4.867v12.37a18.183 18.183 0 0 1-6.53-.399Z"></path>
                    </svg>
                  </span>
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
              <h1>Complete Your Profile to Help Us Know About You.</h1>
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
                    placeholder="+974 0000-0000"
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

                <div className="form-group full-width">
                  <label>Experience</label>
                  <div className="experience-box">
                    <div className="experience-box-header">
                      <span className="experience-box-label">
                        {experienceEntries.length > 0
                          ? `${experienceEntries.length} experience entry(ies) added`
                          : 'No experience added yet'}
                      </span>
                      <button
                        type="button"
                        className="experience-add-btn"
                        onClick={toggleExperienceForm}
                        title="Add experience"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        <span>Add</span>
                      </button>
                    </div>

                    {experienceEntries.length > 0 && (
                      <div className="experience-entries-list">
                        {experienceEntries.map((entry, index) => (
                          <div key={index} className="experience-entry-chip">
                            <div className="experience-chip-info">
                              <span className="experience-chip-position">{entry.position}</span>
                              <span className="experience-chip-separator">at</span>
                              <span className="experience-chip-company">{entry.company}</span>
                              {entry.currentlyWorking && (
                                <span className="experience-chip-badge">Current</span>
                              )}
                            </div>
                            <button
                              type="button"
                              className="experience-chip-remove"
                              onClick={() => removeExperience(index)}
                              title="Remove experience"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {showExperienceForm && (
                      <div className="experience-expanded-form">
                        <div className="experience-form-row">
                          <div className="experience-form-group">
                            <label htmlFor="expPosition">Position</label>
                            <input
                              type="text"
                              id="expPosition"
                              name="position"
                              className="portal-input"
                              value={experienceForm.position}
                              onChange={handleExperienceInputChange}
                              placeholder="e.g. Sales Manager"
                            />
                          </div>
                          <div className="experience-form-group">
                            <label htmlFor="expCompany">Company</label>
                            <input
                              type="text"
                              id="expCompany"
                              name="company"
                              className="portal-input"
                              value={experienceForm.company}
                              onChange={handleExperienceInputChange}
                              placeholder="e.g. Vodafone Qatar"
                            />
                          </div>
                        </div>
                        <div className="experience-form-row">
                          <label className="experience-checkbox-label">
                            <input
                              type="checkbox"
                              name="currentlyWorking"
                              checked={experienceForm.currentlyWorking}
                              onChange={handleExperienceInputChange}
                              className="experience-checkbox"
                            />
                            <span className="experience-checkbox-text">I currently work here</span>
                          </label>
                        </div>
                        <div className="experience-form-actions">
                          <button
                            type="button"
                            className="portal-btn portal-btn--secondary experience-cancel-btn"
                            onClick={toggleExperienceForm}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="portal-btn portal-btn--primary experience-save-btn"
                            onClick={addExperience}
                            disabled={!experienceForm.position.trim() || !experienceForm.company.trim()}
                          >
                            Save Experience
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="joiningDate">When are you able to join us?</label>
                  <select
                    id="joiningDate"
                    name="joiningDate"
                    className="portal-input"
                    value={profileData.joiningDate}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select an option</option>
                    <option value="Immediately">Immediately</option>
                    <option value="With 2 weeks">With 2 weeks</option>
                    <option value="Within a month">Within a month</option>
                    <option value="Within 3 months">Within 3 months</option>
                  </select>
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
                <div className="save-status-text" role="status" aria-live="polite">
                  {saveStatus || (isFormReady ? 'Everything looks ready for submission.' : 'Complete the missing items above to submit your profile.')}
                </div>
                {!isFormReady && missingRequirements.length > 0 && (
                  <ul className="missing-requirements-list">
                    {missingRequirements.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
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
