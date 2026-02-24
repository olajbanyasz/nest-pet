import type { Meta, StoryObj } from '@storybook/react-webpack5';

import TodoItem from './TodoItem';

const meta: Meta<typeof TodoItem> = {
  title: 'Components/TodoItem/TodoItem',
  component: TodoItem,
  tags: ['autodocs'],
  argTypes: {
    onToggle: { action: 'toggled' },
    onDelete: { action: 'deleted' },
    onUpdateTitle: { action: 'title-updated' },
  },
};

export default meta;
type Story = StoryObj<typeof TodoItem>;

const baseTodo = {
  _id: 'todo-1',
  title: 'Prepare sprint review notes',
  completed: false,
};

export const Active: Story = {
  args: {
    todo: baseTodo,
  },
};

export const Completed: Story = {
  args: {
    todo: {
      ...baseTodo,
      _id: 'todo-2',
      completed: true,
      title: 'Release v1.2.0',
    },
  },
};

export const LongTitle: Story = {
  args: {
    todo: {
      ...baseTodo,
      _id: 'todo-3',
      title:
        'Document deployment rollback steps and validate monitoring alerts for production incident response',
    },
  },
};
