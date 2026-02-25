import { Button } from 'primereact/button';
import React from 'react';

import { getVideoStreamUrl, VideoItem } from '../../api/streamApi';

interface VideoItemComponentProps {
  video: VideoItem;
  onSelect: (selectedVideo: VideoItem) => void;
  onDelete: (fileName: string) => void;
  isAdmin: boolean;
}

const THUMB_WIDTH = 200;
const THUMB_HEIGHT = 130;

const VideoItemComponent: React.FC<VideoItemComponentProps> = ({
  video,
  onSelect,
  onDelete,
  isAdmin,
}) => {
  return (
    <div
      key={video.filename}
      style={{
        position: 'relative',
        width: `${THUMB_WIDTH}px`,
        margin: '0 auto',
        cursor: 'pointer',
        textAlign: 'center',
      }}
      onClick={() => onSelect(video)}
    >
      {isAdmin && (
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger p-button-text"
          style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            width: '28px',
            height: '28px',
            padding: 0,
            opacity: 0.6,
            backgroundColor: 'rgba(0,0,0,0.45)',
            zIndex: 2,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(video.filename);
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
          aria-label="Delete video"
        />
      )}
      <video
        width={THUMB_WIDTH}
        height={THUMB_HEIGHT}
        muted
        preload="metadata"
        style={{
          objectFit: 'cover',
          backgroundColor: '#000',
        }}
      >
        <source
          src={`${getVideoStreamUrl(video.filename)}#t=0.1`}
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
        {video.filename}
      </div>
    </div>
  );
};

export default VideoItemComponent;
