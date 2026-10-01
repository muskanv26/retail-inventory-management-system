import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Plus } from 'lucide-react';

export const InventoryPage: React.FC = () => {
  return (
    <div className="page-shell">
      <PageHeader
        title="Inventory Stock Management"
        description="Monitor warehouse quantities, reserved stock, and reorder thresholds"
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
            <Plus size={16} /> New Inventory Record
          </button>
        }
      />

      <div className="table-container">
        <div className="table-header-bar">
          <h3 className="table-title">Inventory Stock Records</h3>
          <span className="badge badge-indigo">Inventory Module Shell</span>
        </div>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Warehouse Code</th>
              <th>Product SKU</th>
              <th>Quantity On Hand</th>
              <th>Quantity Reserved</th>
              <th>Reorder Level</th>
              <th>Stock Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>WH-EAST-1</code></td>
              <td><code>PROD-ELEC-001</code></td>
              <td>150</td>
              <td>20</td>
              <td>30</td>
              <td><span className="badge badge-emerald">Optimal</span></td>
            </tr>
            <tr>
              <td><code>WH-WEST-2</code></td>
              <td><code>PROD-APPR-002</code></td>
              <td>15</td>
              <td>10</td>
              <td>25</td>
              <td><span className="badge badge-rose">Low Stock</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
