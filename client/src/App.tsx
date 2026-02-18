import './App.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import React from 'react';
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import AdminPage from './components/AdminPage';
import AppLayout from './components/AppLayout';
import DashBoard from './components/DashBoard';
import Login from './components/Login';
import Notification from './components/Notification';
import ProtectedRoute from './components/ProtectedRoute';
import StreamPage from './components/StreamPage';
import Todos from './components/Todos';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

const RootRedirect: React.FC = () => {
  const { user, initialized } = useAuth();

  if (!initialized) return null;

  return <Navigate to={user ? '/todos' : '/login'} replace />;
};

function App() {
  return (
    <NotificationProvider>
      <Notification />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route element={<AppLayout />}>
              <Route
                path="/todos"
                element={
                  <ProtectedRoute>
                    <Todos />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <DashBoard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stream"
                element={
                  <ProtectedRoute>
                    <StreamPage />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
