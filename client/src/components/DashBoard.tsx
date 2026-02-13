import React, { useEffect, useState, useCallback } from 'react';
import OnlineUsersModal from './OnlineUsersModal';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingProvider';
import { useNotification } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import ApplicationDetails from './ApplicationDetails';
import { getApplicationDetails } from '../api/adminApi';
import RecentTodoStatsChart from './RecentTodoStatsChart';
import TodosPieChart from './TodosPieChart';
import { TabView, TabPanel } from 'primereact/tabview';
import { ChartData } from 'chart.js';
import { getLast14DaysStats } from '../api/todosApi';

const DashBoard: React.FC = () => {
  const { user, loading: authLoading, initialized, onlineCount, onlineUsers } = useAuth();
  const { show, hide } = useLoading();
  const { notify } = useNotification();
  const navigate = useNavigate();

  const [appDetails, setAppDetails] = useState<any>({});
  const [chartData, setChartData] = useState<ChartData<'line'> | null>(null);

  const loadRecentTodosStats = useCallback(async () => {
    let mounted = true;
    try {
      const data = await getLast14DaysStats();

      if (!mounted) return;

      const labels = Object.keys(data?.createdTodos ?? {});
      const createdTodosStat = Object.values(data?.createdTodos ?? {});
      const completedTodosStat = Object.values(data?.completedTodos ?? {});
      const deletedTodosStat = Object.values(data?.deletedTodos ?? {});

      setChartData({
        labels,
        datasets: [
          {
            label: 'Created Todos',
            data: createdTodosStat,
            fill: false,
            tension: 0.4,
          },
          {
            label: 'Completed Todos',
            data: completedTodosStat,
            fill: false,
            tension: 0.4,
          },
          {
            label: 'Deleted Todos',
            data: deletedTodosStat,
            fill: false,
            tension: 0.4,
          },
        ],
      });
    } catch (err) {
      console.error(err);
    }

    return () => {
      mounted = false;
    };
  }, []);

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
      loadRecentTodosStats();
    }
  }, [initialized, user, navigate, loadAppDetailsWithNotification, loadRecentTodosStats]);

  if (authLoading) return null;

  if (!user || user.role !== 'admin') {
    return <Navigate to="/todos" replace />;
  }

  return (
    <div className="dashboard-container">
      <h1 style={{ textAlign: 'center' }}>Dashboard</h1>
      <OnlineUsersModal onlineCount={onlineCount} onlineUsers={onlineUsers} />
      <div>
        <TabView>
          <TabPanel header="Application Stat">
            <ApplicationDetails appDetails={appDetails} />
          </TabPanel>
          <TabPanel header="Todos Stat">
            <TodosPieChart appDetails={appDetails} />
          </TabPanel>
          <TabPanel header="Recent Todos Stat">
            <RecentTodoStatsChart chartData={chartData} />
          </TabPanel>
        </TabView>
      </div>
    </div>
  );
};

export default DashBoard;
