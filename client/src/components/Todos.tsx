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
import { useNotification } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import TodoFilter from './TodoFilter';

function Todos() {
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
    } catch (err) {
      console.error('[Todos] fetchTodos error:', err);
    }
  }, [todoFilter]);

  const fetchTodosWithNotification = useCallback(async () => {
    show();
    try {
      const data = await apiFetchTodos(todoFilter);
      setTodos(data.reverse());
      notify('Todos loaded successfully', 'success', 3000);
    } catch (err) {
      notify('Failed to load todos', 'error', 5000);
      console.error('[Todos] fetchTodos error:', err);
    } finally {
      hide();
    }
  }, [todoFilter]);
  
  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    fetchTodosWithNotification().catch((err) => {
      console.error('[Todos] fetchTodosWithNotification error', err);
    });
  }, [initialized, user, todoFilter, fetchTodosWithNotification]);

  const addTodo = async (title: string) => {
    show();
    try {
      await apiAddTodo(title);
      notify('Todo added successfully', 'success', 3000);
      await fetchTodos();
    } catch (err) {
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
    } catch (err) {
      notify('Failed to update todo', 'error', 5000);
    } finally {
      hide();
    }
  };

  const deleteTodo = async (id: string) => {
    show();
    try {
      await apiDeleteTodo(id);
      notify('Todo deleted successfully', 'success', 3000);
      await fetchTodos();
    } catch (err) {
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
    } catch (err) {
      notify('Failed to update todo title', 'error', 5000);
    } finally {
      hide();
    }
  };

  return (
    <div className="todo-container">
      <NewTodoForm onAdd={addTodo} />
      <h1 style={{ textAlign: 'center' }}>Todos</h1>
      <TodoFilter todoFilter={todoFilter} setTodoFilter={setTodoFilter} />
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
