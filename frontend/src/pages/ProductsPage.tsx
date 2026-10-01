import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Plus } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  return (
    <div className="page-shell">
      <PageHeader
        title="Product Catalog"
        description="Manage product definitions, SKUs, pricing, and categories"
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
            <Plus size={16} /> Add Product
          </button>
        }
      />

      <div className="table-container">
        <div className="table-header-bar">
          <h3 className="table-title">Product Items</h3>
          <span className="badge badge-indigo">Catalog Module Shell</span>
        </div>
        <table className="custom-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th>Unit Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>PROD-ELEC-001</code></td>
              <td>Wireless Ergonomic Mouse</td>
              <td>ELECTRONICS</td>
              <td>$49.99</td>
              <td><span className="badge badge-emerald">Active</span></td>
            </tr>
            <tr>
              <td><code>PROD-APPR-002</code></td>
              <td>Cotton Crewneck T-Shirt</td>
              <td>APPAREL</td>
              <td>$19.99</td>
              <td><span className="badge badge-emerald">Active</span></td>
            </tr>
            <tr>
              <td><code>PROD-HOME-003</code></td>
              <td>Stainless Steel Water Bottle</td>
              <td>HOME & KITCHEN</td>
              <td>$24.50</td>
              <td><span className="badge badge-rose">Inactive</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
