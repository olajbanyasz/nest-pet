import React, { useEffect, useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingProvider';
import {
  getUsers,
  promoteUserToAdmin,
  demoteAdminToUser,
  deleteUser,
  AdminUser,
} from '../api/adminApi';
import UserList from './UserList';

const AdminPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { show, hide } = useLoading();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      show();
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load users');
    } finally {
      hide();
    }
  }, [show, hide]);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadUsers();
    }
  }, [user, loadUsers]);

  const handlePromote = async (id: string) => {
    try {
      show();
      await promoteUserToAdmin(id);
      setUsers(prev =>
        prev.map(u =>
          u.id === id ? { ...u, role: 'admin' } : u,
        ),
      );
    } catch (err) {
      console.error(err);
      alert('Failed to promote user');
    } finally {
      hide();
    }
  };

    const handleDemote = async (id: string) => {
    try {
      show();
      await demoteAdminToUser(id);
      setUsers(prev =>
        prev.map(u =>
          u.id === id ? { ...u, role: 'user' } : u,
        ),
      );
    } catch (err) {
      console.error(err);
      alert('Failed to demote user');
    } finally {
      hide();
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this user?');
    if (!confirmed) return;

    try {
      show();
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
      <h1>Admin panel</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <UserList
        users={users}
        currentUserId={user.id}
        onPromote={handlePromote}
        onDelete={handleDelete}
        onDemote={handleDemote}
      />
    </div>
  );
};

export default AdminPage;
