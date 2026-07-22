/**
 * LoadingOverlay - A full-page overlay with a spinner animation
 * shown during page-to-page navigation transitions.
 */
function LoadingOverlay({ message }) {
    return (
        <div className="loading-overlay">
            <div className="loading-overlay__content">
                <div className="loading-spinner" role="status" aria-label="Loading">
                    <div className="loading-spinner__ring" />
                    <div className="loading-spinner__ring loading-spinner__ring--2" />
                    <div className="loading-spinner__ring loading-spinner__ring--3" />
                </div>
                <p className="loading-overlay__text">
                    {message || 'Loading...'}
                </p>
            </div>
        </div>
    );
}

export default LoadingOverlay;