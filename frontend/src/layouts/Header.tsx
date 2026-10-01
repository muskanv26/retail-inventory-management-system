import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';

interface HeaderProps {
  onToggleMobile: () => void;
}

const routeTitleMap: Record<string, string> = {
  '/': 'Dashboard Overview',
  '/products': 'Product Catalog',
  '/inventory': 'Inventory Stock Management',
  '/warehouses': 'Warehouse Locations',
  '/suppliers': 'Supplier Directory',
  '/orders': 'Order Management',
  '/stock-movements': 'Stock Movement Audit Log',
};

export const Header: React.FC<HeaderProps> = ({ onToggleMobile }) => {
  const location = useLocation();
  const title = routeTitleMap[location.pathname] || 'Retail Inventory Management';

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
            <span className="user-name">Admin User</span>
            <span className="user-role">Inventory Manager</span>
          </div>
        </div>
      </div>
    </header>
  );
};
