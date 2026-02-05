import React, { useEffect, useState, useCallback } from 'react';
import VideoList from './VideoList';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { getVideos, VideoItem } from '../api/streamApi';

const StreamPage: React.FC = () => {
    const { user, initialized } = useAuth();
    const { notify } = useNotification();
    const navigate = useNavigate();
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [selectVideo, setSelectedVideo] = useState<VideoItem | null>(null);

    const fetchVideoList = useCallback(async () => {
        try {
            const res = await getVideos();
            setVideos(res);
            setSelectedVideo(res[0]);
            notify('Videos loaded successfully', 'success', 3000);
        } catch {
            notify('Failed to load videos', 'error', 5000);
        }
    }, []);

    useEffect(() => {
        if (!initialized) return;
        if (!user) {
            navigate('/login', { replace: true });
            return;
        }
        fetchVideoList();
    }, [initialized, user, fetchVideoList]);

    return (
        <div className="stream-container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }}>
            <h1>Stream panel</h1>
            <video width="640" controls style={{ margin: "20px 0" }} loop autoPlay>
                <source src="http://localhost:3001/api/stream/video" type="video/mp4" />
            </video>
            <VideoList videoList={videos} selectVideo={setSelectedVideo}/>
        </div>
    );
};

export default StreamPage;
