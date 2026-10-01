import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

export const AdminLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = () => setMobileOpen((prev) => !prev);
  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="app-container">
      <AdminSidebar mobileOpen={mobileOpen} onCloseMobile={closeMobile} />
      <div className="main-wrapper">
        <AdminHeader onToggleMobile={toggleMobile} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
