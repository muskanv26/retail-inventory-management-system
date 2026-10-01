import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const MainLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = () => setMobileOpen((prev) => !prev);
  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="app-container">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={closeMobile} />
      <div className="main-wrapper">
        <Header onToggleMobile={toggleMobile} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
