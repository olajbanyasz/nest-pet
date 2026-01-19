import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import { useAuth } from '../contexts/AuthContext';

const AppLayout: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

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
