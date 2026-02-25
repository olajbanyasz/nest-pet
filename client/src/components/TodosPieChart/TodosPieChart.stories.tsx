import type { Meta, StoryObj } from '@storybook/react-webpack5';
import TodosPieChart from './TodosPieChart';

const meta: Meta<typeof TodosPieChart> = {
  title: 'Components/TodosPieChart/TodosPieChart',
  component: TodosPieChart,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TodosPieChart>;

export const Default: Story = {
  args: {
    appDetails: {
      totalUsers: 18,
      totalAdmins: 2,
      totalTodos: 84,
      totalCompletedTodos: 30,
      totalActiveTodos: 46,
      totalDeletedTodos: 8,
    },
  },
};

export const MostlyCompleted: Story = {
  args: {
    appDetails: {
      totalUsers: 26,
      totalAdmins: 3,
      totalTodos: 120,
      totalCompletedTodos: 92,
      totalActiveTodos: 22,
      totalDeletedTodos: 6,
    },
  },
};

export const NoTodos: Story = {
  args: {
    appDetails: {
      totalUsers: 10,
      totalAdmins: 1,
      totalTodos: 0,
      totalCompletedTodos: 0,
      totalActiveTodos: 0,
      totalDeletedTodos: 0,
    },
  },
};
