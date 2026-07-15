import React from 'react';

/**
 * LogoIcon - Reusable SVG icon for the Data Portal brand logo.
 * Can be easily swapped out or updated in a single place.
 */
export function LogoIcon({ className }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M12 2C6.48 2 2 4.02 2 6.5v11C2 20.0 6.48 22 12 22s10-2 10-4.5v-11C22 4.02 17.52 2 12 2zm0 3c4.97 0 8 1.48 8 2.5s-3.03 2.5-8 2.5-8-1.48-8-2.5 3.03-2.5 8-2.5zm0 14.5c-4.97 0-8-1.48-8-2.5V11.8c1.88 1.1 4.7 1.7 8 1.7s6.12-.6 8-1.7V14c0 1.02-3.03 2.5-8 2.5zm0-4.5c-4.97 0-8-1.48-8-2.5V7.3c1.88 1.1 4.7 1.7 8 1.7s6.12-.6 8-1.7v2.2c0 1.02-3.03 2.5-8 2.5z"/>
    </svg>
  );
}

/**
 * Logo - The primary brand logo component for the Data Portal.
 * Abstracts the markup and branding elements so they can be easily re-themed or rebranded.
 * 
 * @param {string} variant - 'default' (login style) or 'dashboard' (dashboard navigation style)
 * @param {boolean} showDashboardSuffix - Whether to append " Dashboard" to the brand name
 */
export default function Logo({ variant = 'default', showDashboardSuffix = false }) {
  const containerClass = variant === 'dashboard' ? 'dashboard-nav-brand' : 'portal-logo';
  const iconClass = variant === 'dashboard' ? 'dashboard-nav-logo-icon' : '';

  return (
    <div className={containerClass}>
      <LogoIcon className={iconClass} />
      <span>GreetHR{showDashboardSuffix ? ' Portal' : ''}</span>
    </div>
  );
}
