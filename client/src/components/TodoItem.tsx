import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { InputText } from 'primereact/inputtext';
import React, { useState } from 'react';

interface Todo {
  _id: string;
  title: string;
  completed: boolean;
}

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
}

function TodoItem({ todo, onToggle, onDelete, onUpdateTitle }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdateTitle(todo._id, editTitle.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(todo.title);
    setIsEditing(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10px',
        borderBottom: '1px solid #ddd',
        padding: '8px',
      }}
    >
      <Checkbox
        checked={todo.completed}
        onChange={() => onToggle(todo._id)}
        style={{ width: '30px', marginRight: '10px' }}
      />
      {isEditing ? (
        <InputText
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          style={{ flexGrow: 1, marginRight: '10px' }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
        />
      ) : (
        <span
          style={{
            flexGrow: 1,
            textDecoration: todo.completed ? 'line-through' : 'none',
            cursor: 'pointer',
          }}
          onClick={() => setIsEditing(true)}
        >
          {todo.title}
        </span>
      )}
      {isEditing ? (
        <>
          <Button
            label="Save"
            onClick={handleSave}
            style={{ width: '80px', marginLeft: '5px' }}
            className="p-button-success"
          />
          <Button
            label="Cancel"
            onClick={handleCancel}
            style={{ width: '80px', marginLeft: '5px' }}
            className="p-button-secondary"
          />
        </>
      ) : (
        <>
          <Button
            label="Edit"
            onClick={() => setIsEditing(true)}
            style={{ width: '80px', marginLeft: '5px' }}
            className="p-button-info"
          />
          <Button
            label="Delete"
            onClick={() => onDelete(todo._id)}
            style={{ width: '80px', marginLeft: '5px' }}
            className="p-button-danger"
          />
        </>
      )}
    </div>
  );
}

export default TodoItem;
