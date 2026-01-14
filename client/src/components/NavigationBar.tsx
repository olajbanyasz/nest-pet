import React from 'react';
import LogoutButton from './LogoutButton';
import { Menubar } from 'primereact/menubar';
import { Avatar } from 'primereact/avatar';
import { Tooltip } from 'primereact/tooltip';
import { useAuth } from '../contexts/AuthContext';

const NavigationBar: React.FC = () => {
    const { user, logout } = useAuth();
    const end = (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
            }}
        >
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

    return (
        <Menubar end={end} style={{ borderRadius: 0 }} />
    );
};

export default NavigationBar;
