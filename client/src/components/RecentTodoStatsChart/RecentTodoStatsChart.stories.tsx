import type { Meta, StoryObj } from '@storybook/react-webpack5';
import RecentTodoStatsChart from './RecentTodoStatsChart';

const meta: Meta<typeof RecentTodoStatsChart> = {
  title: 'Components/RecentTodoStatsChart/RecentTodoStatsChart',
  component: RecentTodoStatsChart,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RecentTodoStatsChart>;

const labels = [
  'Day 1',
  'Day 2',
  'Day 3',
  'Day 4',
  'Day 5',
  'Day 6',
  'Day 7',
  'Day 8',
  'Day 9',
  'Day 10',
  'Day 11',
  'Day 12',
  'Day 13',
  'Day 14',
];

export const Default: Story = {
  args: {
    chartData: {
      labels,
      datasets: [
        {
          label: 'Created todos',
          data: [2, 4, 3, 6, 5, 7, 4, 8, 6, 5, 7, 9, 8, 10],
          fill: false,
          tension: 0.3,
        },
        {
          label: 'Completed Todos',
          data: [2, 3, 3, 5, 4, 6, 3, 7, 5, 4, 6, 8, 7, 9],
          fill: false,
          tension: 0.4,
        },
        {
          label: 'Deleted Todos',
          data: [1, 2, 1, 3, 2, 4, 2, 5, 3, 2, 4, 5, 4, 6],
          fill: false,
          tension: 0.4,
        },
      ],
    },
  },
};

export const HighActivity: Story = {
  args: {
    chartData: {
      labels,
      datasets: [
        {
          label: 'Created todos',
          data: [25, 32, 28, 35, 40, 38, 42, 39, 45, 41, 47, 50, 52, 49],
          fill: false,
          tension: 0.3,
        },
        {
          label: 'Completed Todos',
          data: [2, 3, 3, 5, 4, 6, 3, 7, 5, 4, 6, 8, 7, 9],
          fill: false,
          tension: 0.4,
        },
        {
          label: 'Deleted Todos',
          data: [1, 2, 1, 3, 2, 4, 2, 5, 3, 2, 4, 5, 4, 6],
          fill: false,
          tension: 0.4,
        },
      ],
    },
  },
};

export const NoData: Story = {
  args: {
    chartData: null,
  },
};
