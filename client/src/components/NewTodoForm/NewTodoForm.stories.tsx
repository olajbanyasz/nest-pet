import type { Meta, StoryObj } from '@storybook/react-webpack5';
import React, { useEffect, useRef } from 'react';

import NewTodoForm from './NewTodoForm';

const meta: Meta<typeof NewTodoForm> = {
  title: 'Components/NewTodoForm/NewTodoForm',
  component: NewTodoForm,
  tags: ['autodocs'],
  argTypes: {
    onAdd: { action: 'add-clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof NewTodoForm>;

export const Default: Story = {};

const PrefilledNewTodoForm: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const input = containerRef.current?.querySelector(
      'input[placeholder="Add new todo"]',
    ) as HTMLInputElement | null;
    if (!input) return;

    input.value = 'Buy milk';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }, []);

  return (
    <div ref={containerRef}>
      <NewTodoForm onAdd={() => {}} />
    </div>
  );
};

export const WithTypedValue: Story = {
  name: 'With Typed Value',
  render: () => <PrefilledNewTodoForm />,
};
