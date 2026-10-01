import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading dataset...' }) => {
  return (
    <div className="loading-spinner-container">
      <div className="spinner"></div>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{message}</p>
    </div>
  );
};
