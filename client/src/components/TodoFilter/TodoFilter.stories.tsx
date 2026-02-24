import type { Meta, StoryObj } from '@storybook/react-webpack5';

import TodoFilter from './TodoFilter';

const meta: Meta<typeof TodoFilter> = {
  title: 'Components/TodoFilter/TodoFilter',
  component: TodoFilter,
  tags: ['autodocs'],
  argTypes: {
    setTodoFilter: { action: 'filter-changed' },
  },
};

export default meta;
type Story = StoryObj<typeof TodoFilter>;

export const ShowAll: Story = {
  args: {
    todoFilter: 'all',
  },
};

export const ActiveOnly: Story = {
  args: {
    todoFilter: 'active',
  },
};

export const CompletedOnly: Story = {
  args: {
    todoFilter: 'completed',
  },
};
