import React, { useState, useEffect, useCallback } from 'react';
import TodoList from './TodoList';
import NewTodoForm from './NewTodoForm';
import { useLoading } from '../contexts/LoadingProvider';
import {
  fetchTodos as apiFetchTodos,
  addTodo as apiAddTodo,
  toggleTodo as apiToggleTodo,
  deleteTodo as apiDeleteTodo,
  updateTodoTitle,
  Todo,
} from '../api/todosApi';
import { useAuth } from '../contexts/AuthContext';

function Todos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const { show, hide } = useLoading();
  const { user, initialized } = useAuth();

  const fetchTodos = useCallback(async () => {
    show();
    try {
      const data = await apiFetchTodos();
      setTodos(data.reverse());
    } finally {
      hide();
    }
  }, [show, hide]);

  useEffect(() => {
  if (!initialized) return;
  if (!user) return;

  fetchTodos().catch(err => {
    console.error('[Todos] fetchTodos error', err);
  });
}, [initialized, user]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const addTodo = async (title: string) => {
    show();
    try {
      await apiAddTodo(title);
      await fetchTodos();
    } finally {
      hide();
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t._id === id);
    if (!todo) return;

    show();
    try {
      await apiToggleTodo(id, !todo.completed);
      await fetchTodos();
    } finally {
      hide();
    }
  };

  const deleteTodo = async (id: string) => {
    show();
    try {
      await apiDeleteTodo(id);
      await fetchTodos();
    } finally {
      hide();
    }
  };

  const updateTitle = async (id: string, title: string) => {
    show();
    try {
      await updateTodoTitle(id, title);
      await fetchTodos();
    } finally {
      hide();
    }
  };

  return (
    <div className="todo-container">
      <NewTodoForm onAdd={addTodo} />
      <h1 style={{ textAlign: 'center' }}>Todos</h1>
      <TodoList
        todos={todos}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
        onUpdateTitle={updateTitle}
      />
    </div>
  );
}

export default Todos;
