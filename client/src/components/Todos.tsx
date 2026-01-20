import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TodoList from './TodoList';
import NewTodoForm from './NewTodoForm';
import { useLoading } from '../contexts/LoadingProvider';
import { fetchTodos as apiFetchTodos, addTodo as apiAddTodo, toggleTodo as apiToggleTodo, deleteTodo as apiDeleteTodo, updateTodoTitle, Todo } from '../api/todosApi';

function Todos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const navigate = useNavigate();
  const { show, hide } = useLoading();

  const fetchTodos = useCallback(async () => {
    try {
      show();
      const data = await apiFetchTodos();
      setTodos(data.reverse());
    } catch (error) {
      console.error('Error fetching todos:', error);
      navigate('/');
    } finally {
      hide();
    }
  }, [navigate, show, hide]);

  useEffect(() => {
    fetchTodos();
  }, [navigate, fetchTodos]);

  const addTodo = async (title: string) => {
    try {
      show();
      await apiAddTodo(title);
      fetchTodos();
    } catch (error) {
      console.error('Error adding todo:', error);
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
      fetchTodos();
    } catch (error) {
      console.error('Error updating todo:', error);
    } finally {
      hide();
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      show();
      await apiDeleteTodo(id);
      fetchTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
    } finally {
      hide();
    }
  };

  const updateTitle = async (id: string, title: string) => {
    try {
      show();
      await updateTodoTitle(id, title);
      fetchTodos();
    } catch (error) {
      console.error('Error updating todo title:', error);
    } finally {
      hide();
    }
  };

  return (
    <div className="todo-container">
      <NewTodoForm onAdd={addTodo} />
      <h1 style={{ textAlign: "center" }}>Todos</h1>
      <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} onUpdateTitle={updateTitle} />
    </div>
  );
}

export default Todos;