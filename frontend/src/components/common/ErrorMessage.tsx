import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'An error occurred',
  message,
  onRetry,
}) => {
  return (
    <div className="error-banner">
      <AlertTriangle size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
      <div style={{ flex: 1 }}>
        <h4 className="error-title">{title}</h4>
        <p className="error-message">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              marginTop: '0.75rem',
              padding: '0.4rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              backgroundColor: 'rgba(244, 63, 94, 0.2)',
              color: '#f87171',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
            }}
          >
            Retry Request
          </button>
        )}
      </div>
    </div>
  );
};
