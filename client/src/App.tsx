import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Login from './components/Login';
import Todos from './components/Todos';
import DashBoard from './components/DashBoard';
import AdminPage from './components/AdminPage';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Notification from './components/Notification';
import './App.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import Dashboard from './components/DashBoard';

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
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
