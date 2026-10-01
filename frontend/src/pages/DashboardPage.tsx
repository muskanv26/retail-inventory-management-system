import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Package, Boxes, ShoppingCart, ArrowUpRight, Clock } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  return (
    <div className="page-shell">
      <PageHeader
        title="Dashboard Overview"
        description="Real-time retail inventory metrics, active orders, and stock movements"
      />

      <div className="card-grid">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-title">Total Products</span>
            <div style={{ color: 'var(--accent-primary)' }}><Package size={20} /></div>
          </div>
          <div className="card-value" style={{ marginTop: '0.5rem' }}>148</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--accent-emerald)' }}>
            <ArrowUpRight size={14} /> <span>12 added this month</span>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-title">Total Units on Hand</span>
            <div style={{ color: 'var(--accent-emerald)' }}><Boxes size={20} /></div>
          </div>
          <div className="card-value" style={{ marginTop: '0.5rem' }}>14,250</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Across 4 active warehouses
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-title">Pending Orders</span>
            <div style={{ color: 'var(--accent-amber)' }}><ShoppingCart size={20} /></div>
          </div>
          <div className="card-value" style={{ marginTop: '0.5rem' }}>24</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--accent-amber)' }}>
            <Clock size={14} /> <span>8 require immediate fulfillment</span>
          </div>
        </div>
      </div>

      <div className="table-container" style={{ marginTop: '1rem' }}>
        <div className="table-header-bar">
          <h3 className="table-title">Recent System Activity</h3>
          <span className="badge badge-indigo">Live Monitoring</span>
        </div>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Module</th>
              <th>Action</th>
              <th>Reference</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Just now</td>
              <td>Stock Movement</td>
              <td>INBOUND Stock Receipt</td>
              <td>REF-IN-9082</td>
              <td><span className="badge badge-emerald">Completed</span></td>
            </tr>
            <tr>
              <td>12 mins ago</td>
              <td>Order Management</td>
              <td>SALES Order Processing</td>
              <td>ORD-SALES-1042</td>
              <td><span className="badge badge-amber">Processing</span></td>
            </tr>
            <tr>
              <td>45 mins ago</td>
              <td>Inventory</td>
              <td>Reorder Threshold Alert</td>
              <td>SKU-ELEC-409</td>
              <td><span className="badge badge-rose">Reorder Low</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
