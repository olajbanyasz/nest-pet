import React, { useEffect, useState, useCallback } from 'react';
import VideoList from './VideoList';
import UploadVideo from './UploadVideo';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { getVideos, VideoItem, uploadVideo, getVideoStreamUrl, deleteVideo } from '../api/streamApi';
import { Role } from '../api/authApi';

const StreamPage: React.FC = () => {
    const { user, initialized } = useAuth();
    const { notify } = useNotification();
    const navigate = useNavigate();
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

    const isAdmin = user?.role === 'admin';

    const fetchVideoList = useCallback(async (shouldNotify: boolean = false) => {
        try {
            const res = await getVideos();
            setVideos(res);
            setSelectedVideo(res[0]);
            shouldNotify && notify('Videos loaded successfully', 'success', 3000);
        } catch {
            shouldNotify && notify('Failed to load videos', 'error', 5000);
        }
    }, []);

    const onVideoDelete = async (fileName: string) => {
        try {
            const res = await deleteVideo(fileName);
            notify('Video deleted successfully', 'success', 3000);
            fetchVideoList(false);
        } catch (error) {
            notify('Failed to delete video', 'error', 5000);
        }
    };

    const onVideoUpload = async (file: File) => {
        try {
            const res = await uploadVideo(file);
            notify('Video uploaded successfully', 'success', 3000);
            fetchVideoList(false);
        } catch (error) {
            notify('Failed to upload video', 'error', 5000);
        }
    };

    useEffect(() => {
        if (!initialized) return;
        if (!user) {
            navigate('/login', { replace: true });
            return;
        }
        fetchVideoList(true);
    }, [initialized, user, fetchVideoList]);

    return (
        <div className="stream-container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }}>
            <h1>Stream panel</h1>
            {isAdmin && <UploadVideo onUpload={onVideoUpload} />}
            {selectedVideo && (
                <video
                    width="640"
                    height="400"
                    controls
                    style={{ margin: "20px 0" }}
                    loop
                    autoPlay
                    key={selectedVideo.filename}
                >
                    <source src={getVideoStreamUrl(selectedVideo?.filename!)} type="video/mp4" />
                </video>
            )}
            <VideoList videoList={videos} selectVideo={setSelectedVideo} deleteVideo={onVideoDelete} isAdmin={isAdmin}/>
        </div>
    );
};

export default StreamPage;
