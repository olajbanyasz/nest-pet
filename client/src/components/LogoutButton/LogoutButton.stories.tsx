import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { MemoryRouter } from 'react-router-dom';

import LogoutButton from './LogoutButton';

const meta: Meta<typeof LogoutButton> = {
  title: 'Components/LogoutButton/LogoutButton',
  component: LogoutButton,
  tags: ['autodocs'],
  decorators: [
    Story => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  argTypes: {
    logout: { action: 'logout' },
  },
};

export default meta;
type Story = StoryObj<typeof LogoutButton>;

export const Default: Story = {};
