import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Boxes,
  Building2,
  Truck,
  ShoppingCart,
  ArrowLeftRight,
  Store,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavMenuItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const navItems: NavMenuItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Products', path: '/products', icon: Package },
  { label: 'Inventory', path: '/inventory', icon: Boxes },
  { label: 'Warehouses', path: '/warehouses', icon: Building2 },
  { label: 'Suppliers', path: '/suppliers', icon: Truck },
  { label: 'Orders', path: '/orders', icon: ShoppingCart },
  { label: 'Stock Movements', path: '/stock-movements', icon: ArrowLeftRight },
];

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="brand-icon">
          <Store size={20} />
        </div>
        <span className="brand-title">Apex Inventory</span>
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
              end={item.path === '/'}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <span className="badge badge-indigo">v1.0.0-release</span>
      </div>
    </aside>
  );
};
