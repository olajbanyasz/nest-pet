import React, { useEffect, useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingProvider';
import { useNotification } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import ApplicationDetails from './ApplicationDetails';
import {
    getUsers,
    promoteUserToAdmin,
    demoteAdminToUser,
    deleteUser,
    User,
} from '../api/adminApi';

const DashBoard: React.FC = () => {
    const { user, loading: authLoading, initialized } = useAuth();
    const { show, hide } = useLoading();
    const { notify } = useNotification();
    const navigate = useNavigate();

    useEffect(() => {
        if (!initialized) return;
        if (!user) {
            navigate('/login', { replace: true });
            return;
        }
        if (user?.role === 'admin') {
            //loadUsersWithNotification();
        }
    }, []);

    if (authLoading) return null;

    if (!user || user.role !== 'admin') {
        return <Navigate to="/todos" replace />;
    }

    return (
        <div className="dashboard-container">
            <h1 style={{ textAlign: 'center' }}>Dashboard</h1>
            <ApplicationDetails />
        </div>
    );
};

export default DashBoard;
