import type { Meta, StoryObj } from '@storybook/react-webpack5';

import TodoList from './TodoList';

const meta: Meta<typeof TodoList> = {
  title: 'Components/TodoList/TodoList',
  component: TodoList,
  tags: ['autodocs'],
  argTypes: {
    onToggle: { action: 'toggled' },
    onDelete: { action: 'deleted' },
    onUpdateTitle: { action: 'title-updated' },
  },
};

export default meta;
type Story = StoryObj<typeof TodoList>;

export const Default: Story = {
  args: {
    todos: [
      { _id: 'todo-1', title: 'Write daily standup update', completed: false },
      { _id: 'todo-2', title: 'Review pull request #142', completed: true },
      { _id: 'todo-3', title: 'Plan next sprint backlog', completed: false },
    ],
  },
};

export const Empty: Story = {
  args: {
    todos: [],
  },
};

export const CompletedOnly: Story = {
  args: {
    todos: [
      { _id: 'todo-4', title: 'Finalize release notes', completed: true },
      { _id: 'todo-5', title: 'Archive old tasks', completed: true },
    ],
  },
};
