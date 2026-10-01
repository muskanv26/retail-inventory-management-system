import React from 'react';
import { PageHeader } from '../components/common/PageHeader';

export const StockMovementsPage: React.FC = () => {
  return (
    <div className="page-shell">
      <PageHeader
        title="Stock Movement Audit Log"
        description="Immutable record of stock adjustments, receipts, reservations, and outbound movements"
      />

      <div className="table-container">
        <div className="table-header-bar">
          <h3 className="table-title">Stock Movement Log</h3>
          <span className="badge badge-indigo">Audit Module Shell</span>
        </div>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Movement Type</th>
              <th>Quantity</th>
              <th>Reference Number</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2026-09-29 18:30:12</td>
              <td><span className="badge badge-emerald">INBOUND</span></td>
              <td>+50</td>
              <td><code>PO-BUY-2002</code></td>
              <td>Received stock for Purchase Order PO-BUY-2002</td>
            </tr>
            <tr>
              <td>2026-09-29 17:15:00</td>
              <td><span className="badge badge-rose">OUTBOUND</span></td>
              <td>-10</td>
              <td><code>ORD-SALES-1001</code></td>
              <td>Fulfillment for Sales Order ORD-SALES-1001</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
