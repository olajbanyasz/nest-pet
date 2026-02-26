import type { Meta, StoryObj } from '@storybook/react-webpack5';

import VideoItemComponent from './VideoItem';

const meta: Meta<typeof VideoItemComponent> = {
  title: 'Components/VideoItem/VideoItem',
  component: VideoItemComponent,
  tags: ['autodocs'],
  argTypes: {
    onSelect: { action: 'selected' },
    onDelete: { action: 'deleted' },
  },
};

export default meta;
type Story = StoryObj<typeof VideoItemComponent>;

const sampleVideo = {
  filename: 'demo-video.mp4',
  url: 'http://localhost:3001/api/stream/video/demo-video.mp4',
};

export const ViewerMode: Story = {
  args: {
    video: sampleVideo,
    isAdmin: false,
  },
};

export const AdminMode: Story = {
  args: {
    video: sampleVideo,
    isAdmin: true,
  },
};

export const LongFileName: Story = {
  args: {
    video: {
      filename:
        'my-very-long-video-file-name-from-recording-session-2026-02-25.mp4',
      url: 'http://localhost:3001/api/stream/video/my-very-long-video-file-name-from-recording-session-2026-02-25.mp4',
    },
    isAdmin: true,
  },
};
