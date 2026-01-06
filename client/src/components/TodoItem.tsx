import React from 'react';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';

interface Todo {
  _id: string;
  title: string;
  completed: boolean;
}

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
      <Checkbox
        checked={todo.completed}
        onChange={() => onToggle(todo._id)}
        style={{ width: '30px', marginRight: '10px' }}
      />
      <span style={{ flexGrow: 1, textDecoration: todo.completed ? 'line-through' : 'none' }}>
        {todo.title}
      </span>
      <Button
        label="Delete"
        onClick={() => onDelete(todo._id)}
        style={{ width: '80px', marginLeft: '10px' }}
        className="p-button-danger"
      />
    </div>
  );
}

export default TodoItem;