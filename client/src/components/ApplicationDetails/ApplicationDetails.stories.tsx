import type { Meta, StoryObj } from '@storybook/react-webpack5';
import ApplicationDetails from './ApplicationDetails';

const meta: Meta<typeof ApplicationDetails> = {
  title: 'Components/ApplicationDetails/ApplicationDetails',
  component: ApplicationDetails,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ApplicationDetails>;

const baseDetails = {
  totalUsers: 128,
  totalAdmins: 6,
  totalTodos: 1890,
  totalCompletedTodos: 1325,
  totalActiveTodos: 440,
  totalDeletedTodos: 125,
};

export const Default: Story = {
  args: {
    appDetails: baseDetails,
  },
};

export const HighLoad: Story = {
  args: {
    appDetails: {
      totalUsers: 10420,
      totalAdmins: 42,
      totalTodos: 98234,
      totalCompletedTodos: 74120,
      totalActiveTodos: 18114,
      totalDeletedTodos: 6000,
    },
  },
};

export const Empty: Story = {
  args: {
    appDetails: {
      totalUsers: 0,
      totalAdmins: 0,
      totalTodos: 0,
      totalCompletedTodos: 0,
      totalActiveTodos: 0,
      totalDeletedTodos: 0,
    },
  },
};
