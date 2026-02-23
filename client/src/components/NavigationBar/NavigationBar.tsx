import { Avatar } from 'primereact/avatar';
import { Menubar } from 'primereact/menubar';
import { Tooltip } from 'primereact/tooltip';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LogoutButton from '../LogoutButton/LogoutButton';

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
    {
      label: 'Stream',
      command: () => navigate('/stream'),
      className: isActive('/stream') ? 'active-menu-item' : '',
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
    {
      label: 'Stream',
      command: () => navigate('/stream'),
      className: isActive('/stream') ? 'active-menu-item' : '',
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
