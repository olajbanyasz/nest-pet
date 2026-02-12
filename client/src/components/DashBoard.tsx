import React, { useEffect, useState, useCallback } from 'react';
import OnlineUsersModal from './OnlineUsersModal';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingProvider';
import { useNotification } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import ApplicationDetails from './ApplicationDetails';
import { getApplicationDetails } from '../api/adminApi';
import TodoStatsChart from './TodoStatsChart';

const DashBoard: React.FC = () => {
  const { user, loading: authLoading, initialized, onlineCount, onlineUsers } = useAuth();
  const { show, hide } = useLoading();
  const { notify } = useNotification();
  const navigate = useNavigate();

  const [appDetails, setAppDetails] = useState<any>({});

  const loadAppDetailsWithNotification = useCallback(async () => {
    show();
    try {
      const data = await getApplicationDetails();
      setAppDetails(data);
      notify('Application details loaded successfully', 'success', 3000);
    } catch (err) {
      console.error(err);
      notify('Failed to load application details', 'error', 5000);
    } finally {
      hide();
    }
  }, []);

  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    if (user?.role === 'admin') {
      loadAppDetailsWithNotification();
    }
  }, []);

  if (authLoading) return null;

  if (!user || user.role !== 'admin') {
    return <Navigate to="/todos" replace />;
  }

  return (
    <div className="dashboard-container">
      <h1 style={{ textAlign: 'center' }}>Dashboard</h1>
      <OnlineUsersModal onlineCount={onlineCount} onlineUsers={onlineUsers} />
      <ApplicationDetails appDetails={appDetails} />
      <TodoStatsChart />
    </div>
  );
};

export default DashBoard;
