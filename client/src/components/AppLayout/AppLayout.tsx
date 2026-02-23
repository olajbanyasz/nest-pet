import React from 'react';
import { Outlet } from 'react-router-dom';
import NavigationBar from '../NavigationBar/NavigationBar';
import TokenRefreshModal from '../TokenRefreshModal/TokenRefreshModal';

const AppLayout: React.FC = () => {
  return (
    <>
      <NavigationBar />
      <TokenRefreshModal />
      <main className="app-content">
        <Outlet />
      </main>
    </>
  );
};

export default AppLayout;
