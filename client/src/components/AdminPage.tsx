import React, { useEffect, useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingProvider';
import {
  getUsers,
  promoteUserToAdmin,
  demoteAdminToUser,
  deleteUser,
  User,
} from '../api/adminApi';
import UserList from './UserList';

const AdminPage: React.FC = () => {
  const { user, loading: authLoading, initialized } = useAuth();
  const { show, hide } = useLoading();

  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    show();
    try {
      const data = await getUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load users');
    } finally {
      hide();
    }
  }, [show, hide]);

  useEffect(() => {
    if (!initialized || !user) {
      return;
    }
    if (user?.role === 'admin') {
      loadUsers();
    }
  }, [user, loadUsers]);

  const handlePromote = async (id: string) => {
    show();
    try {
      await promoteUserToAdmin(id);
      setUsers(prev =>
        prev.map(u => (u.id === id ? { ...u, role: 'admin' } : u)),
      );
    } catch (err) {
      console.error(err);
      alert('Failed to promote user');
    } finally {
      hide();
    }
  };

  const handleDemote = async (id: string) => {
    show();
    try {
      await demoteAdminToUser(id);
      setUsers(prev =>
        prev.map(u => (u.id === id ? { ...u, role: 'user' } : u)),
      );
    } catch (err) {
      console.error(err);
      alert('Failed to demote user');
    } finally {
      hide();
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this user?',
    );
    if (!confirmed) return;

    show();
    try {
      await deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete user');
    } finally {
      hide();
    }
  };

  if (authLoading) return null;

  if (!user || user.role !== 'admin') {
    return <Navigate to="/todos" replace />;
  }

  return (
    <div className="admin-container">
      <h1 style={{ textAlign: 'center' }}>Admin panel</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <UserList
        users={users}
        currentUserId={user.id}
        onPromote={handlePromote}
        onDemote={handleDemote}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default AdminPage;
