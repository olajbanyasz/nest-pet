import React from 'react';
import { getVideoStreamUrl, VideoItem } from '../api/streamApi';

interface VideoListProps {
  videoList: VideoItem[];
  selectVideo: (selectedVideo: VideoItem) => void;
}

const THUMB_WIDTH = 220;
const THUMB_HEIGHT = 140;

const VideoList: React.FC<VideoListProps> = ({
  videoList,
  selectVideo,
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px',
        maxWidth: '760px',
        margin: '0 auto',
      }}
    >
      {videoList.map((v) => (
        <div
          key={v.filename}
          style={{
            cursor: 'pointer',
            textAlign: 'center',
          }}
          onClick={() => selectVideo(v)}
        >
          <video
            width={THUMB_WIDTH}
            height={THUMB_HEIGHT}
            muted
            preload="metadata"
            style={{
              objectFit: 'cover',
              borderRadius: '8px',
              backgroundColor: '#000',
            }}
          >
            <source
              src={`${getVideoStreamUrl(v.filename)}#t=0.1`}
              type="video/mp4"
            />
          </video>

          <div
            style={{
              marginTop: '6px',
              fontSize: '13px',
              color: '#888',
              wordBreak: 'break-all',
            }}
          >
            {v.filename}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoList;
