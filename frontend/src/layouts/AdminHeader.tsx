import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminHeaderProps {
  onToggleMobile: () => void;
}

const adminTitleMap: Record<string, string> = {
  '/admin': 'Operations Dashboard',
  '/admin/products': 'Product Catalog Management',
  '/admin/inventory': 'Multi-Warehouse Inventory Stock',
  '/admin/warehouses': 'Warehouse Infrastructure Directory',
  '/admin/suppliers': 'Supplier Procurement Directory',
  '/admin/orders': 'Order Management & Fulfillment',
  '/admin/stock-movements': 'Stock Movement Audit Log',
};

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleMobile }) => {
  const location = useLocation();
  const { user } = useAuth();
  const title = adminTitleMap[location.pathname] || 'Retail Inventory Management Admin';

  return (
    <header className="top-header">
      <div className="header-left">
        <button className="mobile-menu-toggle" onClick={onToggleMobile} aria-label="Toggle Navigation">
          <Menu size={22} />
        </button>
        <h2 className="page-title">{title}</h2>
      </div>

      <div className="header-right">
        <div className="user-profile">
          <div className="user-avatar">AD</div>
          <div className="user-info">
            <span className="user-name">{user?.name || 'Operations Admin'}</span>
            <span className="user-role">Inventory Operations Manager</span>
          </div>
        </div>
      </div>
    </header>
  );
};
