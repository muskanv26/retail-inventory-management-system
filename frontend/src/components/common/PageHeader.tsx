import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, action }) => {
  return (
    <div className="page-header-container">
      <div>
        <h1 className="page-title" style={{ fontSize: '1.5rem' }}>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};
