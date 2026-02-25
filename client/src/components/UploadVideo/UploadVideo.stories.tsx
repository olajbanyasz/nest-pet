import type { Meta, StoryObj } from '@storybook/react-webpack5';
import React from 'react';

import { LoadingProvider } from '../../contexts/LoadingProvider';
import UploadVideo from './UploadVideo';

const meta: Meta<typeof UploadVideo> = {
  title: 'Components/UploadVideo/UploadVideo',
  component: UploadVideo,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <LoadingProvider>
        <Story />
      </LoadingProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof UploadVideo>;

export const Default: Story = {
  args: {
    onUpload: async () => {},
  },
};

export const SimulatedProgress: Story = {
  args: {
    onUpload: async (_file, onProgress) => {
      for (let value = 10; value <= 100; value += 10) {
        onProgress?.(value);
        await new Promise((resolve) => {
          window.setTimeout(resolve, 150);
        });
      }
    },
  },
};
