import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const StreamPage: React.FC = () => {
    const { user, initialized } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!initialized) return;
        if (!user) {
            navigate('/login', { replace: true });
            return;
        }
    }, [initialized, user]);

    return (
        <div className="stream-container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }}>
            <h1>Stream panel</h1>
            <video width="640" controls style={{margin: "20px 0"}} loop autoPlay>
                <source src="http://localhost:3001/api/stream/video" type="video/mp4" />
            </video>
        </div>
    );
};

export default StreamPage;
