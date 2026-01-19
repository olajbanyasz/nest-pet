import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminPage: React.FC = () => {
  const { user } = useAuth();

  if (!user || user.role !== 'admin') {
    return <Navigate to="/todos" replace />;
  }

  return (
    <div className="admin-container">
      <h1>Admin panel</h1>
      <p>User management ide jön</p>
    </div>
  );
};

export default AdminPage;
