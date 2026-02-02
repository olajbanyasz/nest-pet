import React, { useEffect, useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingProvider';
import { useNotification } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import {
  getUsers,
  promoteUserToAdmin,
  demoteAdminToUser,
  deleteUser,
  User,
} from '../api/adminApi';
import UserList from './UserList';
import UserFilter from './UserFilter';

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
      isValidFilter ? setFilteredUsers(data) : setUsers(data);
      notify('Users loaded successfully', 'success', 3000);
    } catch (err) {
      console.error(err);
      notify('Failed to load users', 'error', 5000);
    } finally {
      hide();
    }
  }, [userFilter]);

  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    if (user?.role === 'admin' && isValidFilter) {
      loadUsersWithNotification();
    }
  }, [initialized, user, userFilter]);

  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    if (user?.role === 'admin') {
      loadUsersWithNotification();
    }
  }, [initialized, user]);

  const handlePromote = async (id: string) => {
    show();
    try {
      await promoteUserToAdmin(id);
      notify('User promoted to admin successfully', 'success', 3000);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: 'admin' } : u)),
      );
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
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
      <UserFilter userFilter={userFilter} setUserFilter={setUserFilter} />
      <UserList
        users={isValidFilter ? filteredUsers : users}
        currentUserId={user.id}
        onPromote={handlePromote}
        onDemote={handleDemote}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default AdminPage;
