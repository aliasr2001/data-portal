import './ThankYouPage.css';
import Logo from '../components/Logo';

function ThankYouPage() {
  return (
    <div className="thank-you-page">
      <div className="thank-you-card">
        <div className="thank-you-brand">
          <Logo variant="dashboard" showDashboardSuffix />
        </div>

        <div className="thank-you-icon" aria-label="Success">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12.5l2.5 2.5 5-5" />
          </svg>
        </div>

        <h1>Thank you for completing your profile.</h1>
        <p>Our HR team will contact you within 2–3 days.</p>
      </div>
    </div>
  );
}

export default ThankYouPage;
