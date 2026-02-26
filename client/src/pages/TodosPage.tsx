import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  addTodo as apiAddTodo,
  deleteTodo as apiDeleteTodo,
  fetchTodos as apiFetchTodos,
  Todo,
  toggleTodo as apiToggleTodo,
  updateTodoTitle,
} from '../api/todosApi';
import NewTodoForm from '../components/NewTodoForm/NewTodoForm';
import TodoFilter from '../components/TodoFilter/TodoFilter';
import TodoList from '../components/TodoList/TodoList';
import { useAuth } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingProvider';
import { useNotification } from '../contexts/NotificationContext';

function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todoFilter, setTodoFilter] = useState<string>('all');
  const { show, hide } = useLoading();
  const { user, initialized } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();

  const fetchTodos = useCallback(async () => {
    try {
      const data = await apiFetchTodos(todoFilter);
      setTodos(data.reverse());
    } catch {
      // console.error('[Todos] fetchTodos error');
    }
  }, [todoFilter]);

  const fetchTodosWithNotification = useCallback(async () => {
    show();
    try {
      const data = await apiFetchTodos(todoFilter);
      setTodos(data.reverse());
      notify('Todos loaded successfully', 'success', 3000);
    } catch {
      notify('Failed to load todos', 'error', 5000);
      // console.error('[Todos] fetchTodos error');
    } finally {
      hide();
    }
  }, [todoFilter]);

  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      void navigate('/login', { replace: true });
      return;
    }

    void fetchTodosWithNotification();
  }, [initialized, user, todoFilter, fetchTodosWithNotification]);

  const addTodo = async (title: string) => {
    show();
    try {
      await apiAddTodo(title);
      notify('Todo added successfully', 'success', 3000);
      await fetchTodos();
    } catch {
      notify('Failed to add todo', 'error', 5000);
    } finally {
      hide();
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find((t) => t._id === id);
    if (!todo) return;

    show();
    try {
      await apiToggleTodo(id, !todo.completed);
      notify('Todo updated successfully', 'success', 3000);
      await fetchTodos();
    } catch {
      notify('Failed to update todo', 'error', 5000);
    } finally {
      hide();
    }
  };

  const deleteTodo = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this todo?',
    );

    if (!confirmed) return;

    show();
    try {
      await apiDeleteTodo(id);
      notify('Todo deleted successfully', 'success', 3000);
      await fetchTodos();
    } catch {
      notify('Failed to delete todo', 'error', 5000);
    } finally {
      hide();
    }
  };

  const updateTitle = async (id: string, title: string) => {
    show();
    try {
      await updateTodoTitle(id, title);
      notify('Todo title updated successfully', 'success', 3000);
      await fetchTodos();
    } catch {
      notify('Failed to update todo title', 'error', 5000);
    } finally {
      hide();
    }
  };

  return (
    <div className="todo-container">
      <NewTodoForm onAdd={(title) => void addTodo(title)} />
      <h1 style={{ textAlign: 'center' }}>Todos</h1>
      <TodoFilter todoFilter={todoFilter} setTodoFilter={setTodoFilter} />
      <TodoList
        todos={todos}
        onToggle={(id) => void toggleTodo(id)}
        onDelete={(id) => void deleteTodo(id)}
        onUpdateTitle={(id, title) => void updateTitle(id, title)}
      />
    </div>
  );
}

export default TodosPage;
