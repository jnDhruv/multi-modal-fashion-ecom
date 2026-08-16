import React from 'react'
import './ErrorMessage.css'

function ErrorMessage({ type = 'generic', message, onRetry }) {
  const errorTypes = {
    connection: {
      icon: '🔌',
      title: 'Unable to connect to the server',
      description: 'Please check your connection and make sure the backend is running.',
      action: 'Try Again',
    },
    ai: {
      icon: '✨',
      title: 'AI explanation temporarily unavailable',
      description: 'Gemini API is not configured or encountered an error. Products will still be shown.',
      action: 'Retry',
    },
    no_results: {
      icon: '🔍',
      title: 'No products found',
      description: 'We couldn\'t find any products matching your search. Try a different query.',
      action: 'Clear Search',
    },
    generic: {
      icon: '⚠️',
      title: 'Something went wrong',
      description: message || 'An unexpected error occurred. Please try again.',
      action: 'Try Again',
    },
  }

  const config = errorTypes[type] || errorTypes.generic

  return (
    <div className="error-message" role="alert" aria-live="assertive">
      <div className="error-message__card">
        <div className="error-message__icon" aria-hidden="true">
          {config.icon}
        </div>

        <div className="error-message__text">
          <h3 className="error-message__title">{config.title}</h3>
          <p className="error-message__description">
            {message || config.description}
          </p>
        </div>

        {message && message !== config.description && (
          <div className="error-message__debug">
            <details>
              <summary>Technical details</summary>
              <code>{message}</code>
            </details>
          </div>
        )}

        {onRetry && (
          <button
            className="error-message__btn"
            onClick={onRetry}
          >
            {config.action}
          </button>
        )}
      </div>
    </div>
  )
}

export default ErrorMessage
