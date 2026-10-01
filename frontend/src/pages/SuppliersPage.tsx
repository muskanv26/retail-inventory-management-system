import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Plus } from 'lucide-react';

export const SuppliersPage: React.FC = () => {
  return (
    <div className="page-shell">
      <PageHeader
        title="Supplier Directory"
        description="Manage vendor details, procurement contacts, and active status"
        action={
          <button
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'white',
              padding: '0.6rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
            }}
          >
            <Plus size={16} /> Register Supplier
          </button>
        }
      />

      <div className="table-container">
        <div className="table-header-bar">
          <h3 className="table-title">Vendor Directory</h3>
          <span className="badge badge-indigo">Supplier Module Shell</span>
        </div>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Supplier Code</th>
              <th>Company Name</th>
              <th>Contact Name</th>
              <th>Email</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>SUP-TECH-01</code></td>
              <td>Global Tech Solutions Ltd</td>
              <td>Sarah Connor</td>
              <td>contact@globaltech.com</td>
              <td><span className="badge badge-emerald">Active</span></td>
            </tr>
            <tr>
              <td><code>SUP-TEXT-02</code></td>
              <td>Apex Textile Industries</td>
              <td>Michael Chang</td>
              <td>m.chang@apextextile.org</td>
              <td><span className="badge badge-emerald">Active</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
