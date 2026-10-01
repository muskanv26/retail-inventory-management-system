import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Plus } from 'lucide-react';

export const OrdersPage: React.FC = () => {
  return (
    <div className="page-shell">
      <PageHeader
        title="Order Management"
        description="Track purchase orders and sales orders through their lifecycle"
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
            <Plus size={16} /> Create Order
          </button>
        }
      />

      <div className="table-container">
        <div className="table-header-bar">
          <h3 className="table-title">System Orders</h3>
          <span className="badge badge-indigo">Order Module Shell</span>
        </div>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Type</th>
              <th>Warehouse Code</th>
              <th>Total Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>ORD-SALES-1001</code></td>
              <td><span className="badge badge-indigo">SALES</span></td>
              <td><code>WH-EAST-1</code></td>
              <td>$249.95</td>
              <td><span className="badge badge-amber">Processing</span></td>
            </tr>
            <tr>
              <td><code>PO-BUY-2002</code></td>
              <td><span className="badge badge-emerald">PURCHASE</span></td>
              <td><code>WH-WEST-2</code></td>
              <td>$1,450.00</td>
              <td><span className="badge badge-emerald">Completed</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
