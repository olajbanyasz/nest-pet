import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TodoList from './TodoList';
import NewTodoForm from './NewTodoForm';
import { useLoading } from '../contexts/LoadingProvider';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchTodos as apiFetchTodos,
  addTodo as apiAddTodo,
  toggleTodo as apiToggleTodo,
  deleteTodo as apiDeleteTodo,
  updateTodoTitle,
  Todo,
} from '../api/todosApi';

function Todos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const navigate = useNavigate();
  const { show, hide } = useLoading();
  const { logout } = useAuth();

  const handleAuthError = useCallback(() => {
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  const fetchTodos = useCallback(async () => {
    try {
      show();
      const data = await apiFetchTodos();
      setTodos(data.reverse());
    } catch (error: any) {
      console.error('Error fetching todos:', error);

      if (error?.message?.includes('401')) {
        handleAuthError();
      }
    } finally {
      hide();
    }
  }, [show, hide, handleAuthError]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const addTodo = async (title: string) => {
    try {
      show();
      await apiAddTodo(title);
      await fetchTodos();
    } catch (error: any) {
      console.error('Error adding todo:', error);
      if (error?.message?.includes('401')) {
        handleAuthError();
      }
    } finally {
      hide();
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t._id === id);
    if (!todo) return;

    try {
      show();
      await apiToggleTodo(id, !todo.completed);
      await fetchTodos();
    } catch (error: any) {
      console.error('Error updating todo:', error);
      if (error?.message?.includes('401')) {
        handleAuthError();
      }
    } finally {
      hide();
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      show();
      await apiDeleteTodo(id);
      await fetchTodos();
    } catch (error: any) {
      console.error('Error deleting todo:', error);
      if (error?.message?.includes('401')) {
        handleAuthError();
      }
    } finally {
      hide();
    }
  };

  const updateTitle = async (id: string, title: string) => {
    try {
      show();
      await updateTodoTitle(id, title);
      await fetchTodos();
    } catch (error: any) {
      console.error('Error updating todo title:', error);
      if (error?.message?.includes('401')) {
        handleAuthError();
      }
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
