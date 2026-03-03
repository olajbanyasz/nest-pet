import type { Meta, StoryObj } from '@storybook/react-webpack5';

import TodoCompletionStat from './TodoCompletionStat';

const meta: Meta<typeof TodoCompletionStat> = {
  title: 'Components/TodoCompletionStat/TodoCompletionStat',
  component: TodoCompletionStat,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TodoCompletionStat>;

export const Default: Story = {
  args: {
    completedTodoEvents: 24,
    lastCompletedTodoAt: '2026-03-03T09:45:00.000Z',
    currentStreakDays: 3,
    bestStreakDays: 7,
  },
};

export const NoCompletions: Story = {
  args: {
    completedTodoEvents: 0,
    lastCompletedTodoAt: null,
    currentStreakDays: 0,
    bestStreakDays: 0,
  },
};

export const OnFire: Story = {
  args: {
    completedTodoEvents: 182,
    lastCompletedTodoAt: '2026-03-03T22:15:00.000Z',
    currentStreakDays: 28,
    bestStreakDays: 28,
  },
};
