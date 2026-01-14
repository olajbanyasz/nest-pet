import React from 'react';
import { Outlet } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';

const AppLayout: React.FC = () => {
  return (
    <>
      <NavigationBar />
      <main className="app-content">
        <Outlet />
      </main>
    </>
  );
};

export default AppLayout;
