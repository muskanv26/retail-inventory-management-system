import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Boxes,
  Building2,
  Truck,
  ShoppingCart,
  ArrowLeftRight,
  Store,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminSidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Products', path: '/admin/products', icon: Package },
  { label: 'Inventory', path: '/admin/inventory', icon: Boxes },
  { label: 'Warehouses', path: '/admin/warehouses', icon: Building2 },
  { label: 'Suppliers', path: '/admin/suppliers', icon: Truck },
  { label: 'Orders', path: '/admin/orders', icon: ShoppingCart },
  { label: 'Stock Movements', path: '/admin/stock-movements', icon: ArrowLeftRight },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { switchRole } = useAuth();
  const navigate = useNavigate();

  const handleSwitchToCustomer = () => {
    switchRole('CUSTOMER');
    navigate('/');
  };

  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="brand-icon">
          <Store size={20} />
        </div>
        <span className="brand-title">RIM Admin Ops</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              end={item.path === '/admin'}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button
          onClick={handleSwitchToCustomer}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.825rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            width: '100%',
            padding: '0.5rem',
            borderRadius: '6px',
            backgroundColor: 'var(--bg-tertiary)',
          }}
        >
          <ShoppingBag size={16} style={{ color: 'var(--accent-amber)' }} />
          <span>Customer Storefront</span>
        </button>
      </div>
    </aside>
  );
};
