import React from 'react';
import { Outlet } from 'react-router-dom';
import { CustomerHeader } from '../components/customer/CustomerHeader';
import { CustomerFooter } from '../components/customer/CustomerFooter';

export const CustomerLayout: React.FC = () => {
  return (
    <div className="store-container">
      <CustomerHeader />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <CustomerFooter />
    </div>
  );
};
