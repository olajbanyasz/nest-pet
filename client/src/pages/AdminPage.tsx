import React, { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import {
  deleteUser,
  demoteAdminToUser,
  getUsers,
  promoteUserToAdmin,
  User,
} from '../api/adminApi';
import UserFilter from '../components/UserFilter/UserFilter';
import UserList from '../components/UserList/UserList';
import { useAuth } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingProvider';
import { useNotification } from '../contexts/NotificationContext';

const AdminPage: React.FC = () => {
  const { user, loading: authLoading, initialized } = useAuth();
  const { show, hide } = useLoading();
  const { notify } = useNotification();
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [userFilter, setUserFilter] = useState<string>('');
  const isValidFilter = userFilter.trim().length >= 3;

  const loadUsersWithNotification = useCallback(async () => {
    show();
    try {
      const data = await getUsers(isValidFilter ? userFilter : undefined);
      if (isValidFilter) {
        setFilteredUsers(data);
      } else {
        setUsers(data);
      }
      notify('Users loaded successfully', 'success', 3000);
    } catch {
      notify('Failed to load users', 'error', 5000);
    } finally {
      hide();
    }
  }, [isValidFilter]);

  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      void navigate('/login', { replace: true });
      return;
    }
    if (user?.role === 'admin' && isValidFilter) {
      void loadUsersWithNotification();
    }
  }, [initialized, user, userFilter, loadUsersWithNotification]);

  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      void navigate('/login', { replace: true });
      return;
    }
    if (user?.role === 'admin') {
      void loadUsersWithNotification();
    }
  }, [initialized, user, loadUsersWithNotification]);

  const handlePromote = async (id: string) => {
    show();
    try {
      await promoteUserToAdmin(id);
      notify('User promoted to admin successfully', 'success', 3000);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: 'admin' } : u)),
      );
    } catch {
      notify('Failed to promote user', 'error', 5000);
    } finally {
      hide();
    }
  };

  const handleDemote = async (id: string) => {
    show();
    try {
      await demoteAdminToUser(id);
      notify('Admin demoted to user successfully', 'success', 3000);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: 'user' } : u)),
      );
    } catch {
      notify('Failed to demote user', 'error', 5000);
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
      notify('User deleted successfully', 'success', 3000);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      notify('Failed to delete user', 'error', 5000);
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
      <UserFilter
        userFilter={userFilter}
        setUserFilter={setUserFilter}
        isValidFilter={isValidFilter}
      />
      <UserList
        users={isValidFilter ? filteredUsers : users}
        currentUserId={user.id}
        onPromote={(id) => void handlePromote(id)}
        onDemote={(id) => void handleDemote(id)}
        onDelete={(id) => void handleDelete(id)}
      />
    </div>
  );
};

export default AdminPage;
