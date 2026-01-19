import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  requiredRole?: UserRole;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole, children }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" replace />;

  if (requiredRole && user.role !== requiredRole) return <Navigate to="/todos" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
