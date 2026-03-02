import type { Meta, StoryObj } from '@storybook/react-webpack5';
import React from 'react';

import type { VideoItem } from '../../api/streamApi';
import VideoList from './VideoList';

const meta: Meta<typeof VideoList> = {
  title: 'Components/VideoList/VideoList',
  component: VideoList,
  tags: ['autodocs'],
  argTypes: {
    selectVideo: { action: 'video-selected' },
    deleteVideo: { action: 'video-deleted' },
  },
};

export default meta;
type Story = StoryObj<typeof VideoList>;

const sampleVideos: VideoItem[] = [
  {
    filename: 'intro.mp4',
    url: 'http://localhost:3001/api/stream/video/intro.mp4',
  },
  {
    filename: 'daily-update.mp4',
    url: 'http://localhost:3001/api/stream/video/daily-update.mp4',
  },
  {
    filename: 'product-demo.mp4',
    url: 'http://localhost:3001/api/stream/video/product-demo.mp4',
  },
];

const VideoListStoryWrapper: React.FC<{
  initialVideos: VideoItem[];
  isAdmin: boolean;
  onSelectVideo?: (selectedVideo: VideoItem) => void;
  onDeleteVideo?: (fileName: string) => void;
}> = ({ initialVideos, isAdmin, onSelectVideo, onDeleteVideo }) => {
  const [videos, setVideos] = React.useState<VideoItem[]>(initialVideos);
  const [selectedVideoName, setSelectedVideoName] = React.useState<string>('');

  const handleSelectVideo = (selectedVideo: VideoItem) => {
    setSelectedVideoName(selectedVideo.filename);
    onSelectVideo?.(selectedVideo);
  };

  const handleDeleteVideo = (fileName: string) => {
    setVideos((prev) => prev.filter((video) => video.filename !== fileName));
    onDeleteVideo?.(fileName);
  };

  return (
    <div>
      <VideoList
        videoList={videos}
        selectVideo={handleSelectVideo}
        deleteVideo={handleDeleteVideo}
        isAdmin={isAdmin}
      />
      <div style={{ marginTop: '12px', textAlign: 'center', color: '#666' }}>
        Selected video: {selectedVideoName || 'none'}
      </div>
    </div>
  );
};

export const ViewerMode: Story = {
  render: (args) => (
    <VideoListStoryWrapper
      initialVideos={sampleVideos}
      isAdmin={false}
      onSelectVideo={
        args.selectVideo as ((selectedVideo: VideoItem) => void) | undefined
      }
      onDeleteVideo={
        args.deleteVideo as ((fileName: string) => void) | undefined
      }
    />
  ),
};

export const AdminModeInteractiveDelete: Story = {
  render: (args) => (
    <VideoListStoryWrapper
      initialVideos={sampleVideos}
      isAdmin
      onSelectVideo={
        args.selectVideo as ((selectedVideo: VideoItem) => void) | undefined
      }
      onDeleteVideo={
        args.deleteVideo as ((fileName: string) => void) | undefined
      }
    />
  ),
};

export const Empty: Story = {
  args: {
    videoList: [],
    isAdmin: false,
  },
};
