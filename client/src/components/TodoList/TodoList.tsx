import React from 'react';
import TodoItem from '../TodoItem/TodoItem';

interface Todo {
  _id: string;
  title: string;
  completed: boolean;
}

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
}

function TodoList({ todos, onToggle, onDelete, onUpdateTitle }: TodoListProps) {
  return (
    <div>
      {todos.map((todo) => (
        <TodoItem
          key={todo._id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdateTitle={onUpdateTitle}
        />
      ))}
    </div>
  );
}

export default TodoList;
