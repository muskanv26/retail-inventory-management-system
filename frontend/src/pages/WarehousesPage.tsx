import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Plus } from 'lucide-react';

export const WarehousesPage: React.FC = () => {
  return (
    <div className="page-shell">
      <PageHeader
        title="Warehouse Locations"
        description="Fulfillment centers, capacity limits, and physical facility status"
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
            <Plus size={16} /> Add Warehouse
          </button>
        }
      />

      <div className="table-container">
        <div className="table-header-bar">
          <h3 className="table-title">Fulfillment Facilities</h3>
          <span className="badge badge-indigo">Warehouse Module Shell</span>
        </div>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Facility Code</th>
              <th>Warehouse Name</th>
              <th>Location</th>
              <th>Capacity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>WH-EAST-1</code></td>
              <td>East Coast Fulfillment Hub</td>
              <td>New York, NY</td>
              <td>50,000 units</td>
              <td><span className="badge badge-emerald">Active</span></td>
            </tr>
            <tr>
              <td><code>WH-WEST-2</code></td>
              <td>West Coast Distribution Center</td>
              <td>Los Angeles, CA</td>
              <td>75,000 units</td>
              <td><span className="badge badge-emerald">Active</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
