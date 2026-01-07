import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TodoList from './TodoList';
import NewTodoForm from './NewTodoForm';
import LogoutButton from './LogoutButton';

interface Todo {
  _id: string;
  title: string;
  completed: boolean;
}

function Todos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const navigate = useNavigate();

  const fetchTodos = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/todos', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTodos(data.reverse());
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    fetchTodos();
  }, [navigate, fetchTodos]);

  const addTodo = async (title: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      });
      if (response.ok) {
        fetchTodos();
      }
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleTodo = async (id: string) => {
    const token = localStorage.getItem('token');
    const todo = todos.find(t => t._id === id);
    if (!todo) return;
    try {
      const response = await fetch(`/todos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      if (response.ok) {
        fetchTodos();
      }
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/todos/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        fetchTodos();
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  return (
    <div className="App">
      <LogoutButton />
      <h1>Todos</h1>
      <NewTodoForm onAdd={addTodo} />
      <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
    </div>
  );
}

export default Todos;