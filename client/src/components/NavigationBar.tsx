import React from 'react';
import LogoutButton from './LogoutButton';
import { Menubar } from 'primereact/menubar';
import { Avatar } from 'primereact/avatar';
import { Tooltip } from 'primereact/tooltip';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const NavigationBar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const end = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <Tooltip target=".avatar-icon" />
      <Avatar
        className="avatar-icon"
        data-pr-tooltip={user?.email}
        data-pr-position="bottom"
        style={{ cursor: 'pointer' }}
        icon="pi pi-user"
        shape="circle"
      />
      <LogoutButton logout={logout} />
    </div>
  );

  const userItems = [
    {
      label: 'My Todos',
      command: () => navigate('/todos'),
      className: isActive('/todos') ? 'active-menu-item' : '',
    },
  ];

  const adminItems = [
    {
      label: 'My Todos',
      command: () => navigate('/todos'),
      className: isActive('/todos') ? 'active-menu-item' : '',
    },
    {
      label: 'User Management',
      command: () => navigate('/admin'),
      className: isActive('/admin') ? 'active-menu-item' : '',
    },
    {
      label: 'Dashboard',
      command: () => navigate('/dashboard'),
      className: isActive('/dashboard') ? 'active-menu-item' : '',
    },
  ];

  return (
    <div id="navigation-bar">
      <Menubar
        model={user?.role === 'admin' ? adminItems : userItems}
        end={end}
        style={{ borderRadius: 0 }}
      />
    </div>
  );
};

export default NavigationBar;
