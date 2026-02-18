import { Dropdown } from 'primereact/dropdown';
import React from 'react';

interface TodoFilterProps {
  todoFilter: string;
  setTodoFilter: (filter: string) => void;
}

function TodoFilter({ todoFilter, setTodoFilter }: TodoFilterProps) {
  const options = [
    { label: 'Show all', value: 'all' },
    { label: 'Active only', value: 'active' },
    { label: 'Completed only', value: 'completed' },
  ];

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px',
        marginBottom: '10px',
        borderBottom: '1px solid rgb(221, 221, 221)',
      }}
    >
      <i
        className="pi pi-filter"
        style={{ fontSize: '1.5rem', marginRight: '8px', color: '#0ea5e9' }}
      ></i>
      <Dropdown
        id="todo-filter"
        value={todoFilter}
        options={options}
        onChange={(e) => setTodoFilter(e.value)}
      />
    </div>
  );
}

export default TodoFilter;
