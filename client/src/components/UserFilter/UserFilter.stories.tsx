import type { Meta, StoryObj } from '@storybook/react-webpack5';
import React from 'react';

import UserFilter from './UserFilter';

const meta: Meta<typeof UserFilter> = {
  title: 'Components/UserFilter/UserFilter',
  component: UserFilter,
  tags: ['autodocs'],
  argTypes: {
    setUserFilter: { action: 'user-filter-changed' },
  },
};

export default meta;
type Story = StoryObj<typeof UserFilter>;

const UserFilterStoryWrapper: React.FC<{
  initialFilter: string;
  onFilterChange?: (filter: string) => void;
}> = ({ initialFilter, onFilterChange }) => {
  const [userFilter, setUserFilter] = React.useState(initialFilter);
  const isValidFilter = userFilter.trim().length >= 3;

  const handleFilterChange = (nextFilter: string) => {
    setUserFilter(nextFilter);
    onFilterChange?.(nextFilter);
  };

  return (
    <div style={{ maxWidth: '700px' }}>
      <UserFilter
        userFilter={userFilter}
        setUserFilter={handleFilterChange}
        isValidFilter={isValidFilter}
      />
      <div style={{ fontSize: '12px', color: '#6b7280' }}>
        AdminPage simulation: isValidFilter = {String(isValidFilter)}
      </div>
    </div>
  );
};

export const Empty: Story = {
  render: (args) => {
    const onFilterChange = args.setUserFilter as
      | ((filter: string) => void)
      | undefined;
    return (
      <UserFilterStoryWrapper
        initialFilter=""
        onFilterChange={onFilterChange}
      />
    );
  },
};

export const PartialEmail: Story = {
  render: (args) => {
    const onFilterChange = args.setUserFilter as
      | ((filter: string) => void)
      | undefined;
    return (
      <UserFilterStoryWrapper
        initialFilter="john"
        onFilterChange={onFilterChange}
      />
    );
  },
};

export const FullEmail: Story = {
  render: (args) => {
    const onFilterChange = args.setUserFilter as
      | ((filter: string) => void)
      | undefined;
    return (
      <UserFilterStoryWrapper
        initialFilter="admin@example.com"
        onFilterChange={onFilterChange}
      />
    );
  },
};
