import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TodoList from './TodoList';
import NewTodoForm from './NewTodoForm';
import LogoutButton from './LogoutButton';
import { fetchTodos as apiFetchTodos, addTodo as apiAddTodo, toggleTodo as apiToggleTodo, deleteTodo as apiDeleteTodo, updateTodoTitle, Todo } from '../api/todosApi';

function Todos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const navigate = useNavigate();

  const fetchTodos = useCallback(async () => {
    try {
      const data = await apiFetchTodos();
      setTodos(data.reverse());
    } catch (error) {
      console.error('Error fetching todos:', error);
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    fetchTodos();
  }, [navigate, fetchTodos]);

  const addTodo = async (title: string) => {
    try {
      await apiAddTodo(title);
      fetchTodos();
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t._id === id);
    if (!todo) return;
    try {
      await apiToggleTodo(id, !todo.completed);
      fetchTodos();
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await apiDeleteTodo(id);
      fetchTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const updateTitle = async (id: string, title: string) => {
    try {
      await updateTodoTitle(id, title);
      fetchTodos();
    } catch (error) {
      console.error('Error updating todo title:', error);
    }
  };

  return (
    <div className="App">
      <LogoutButton />
      <h1>Todos</h1>
      <NewTodoForm onAdd={addTodo} />
      <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} onUpdateTitle={updateTitle} />
    </div>
  );
}

export default Todos;