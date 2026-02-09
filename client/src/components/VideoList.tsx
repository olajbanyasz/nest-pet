import React from 'react';
import { VideoItem } from '../api/streamApi';
import VideoItemComponent from './VideoItem';

interface VideoListProps {
    videoList: VideoItem[];
    selectVideo: (selectedVideo: VideoItem) => void;
    deleteVideo: (fileName: string) => void;
    isAdmin: boolean;
}

const VideoList: React.FC<VideoListProps> = ({
    videoList,
    selectVideo,
    deleteVideo,
    isAdmin,
}) => {
    const onSelect = (video: VideoItem) => {
        selectVideo(video);
    };

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px',
                maxWidth: '640px',
                margin: '0 auto',
            }}
        >
            {videoList.map((video) => (
                <VideoItemComponent
                    video={video}
                    onSelect={onSelect}
                    onDelete={deleteVideo}
                    isAdmin={isAdmin}
                    key={video.filename}
                />
            ))}
        </div>
    );
};

export default VideoList;
