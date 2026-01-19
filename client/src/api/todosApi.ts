const API_BASE_URL = '/api/todos';

export interface Todo {
  _id: string;
  title: string;
  completed: boolean;
}

export const fetchTodos = async (): Promise<Todo[]> => {
  const response = await fetch(API_BASE_URL, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch todos');
  }

  const data = (await response.json()) as Todo[];
  return data;
};

export const addTodo = async (title: string): Promise<void> => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ title }),
  });
  if (!response.ok) {
    throw new Error('Failed to add todo');
  }
};

export const toggleTodo = async (
  id: string,
  completed: boolean,
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ completed }),
  });
  if (!response.ok) {
    throw new Error('Failed to update todo');
  }
};

export const updateTodoTitle = async (
  id: string,
  title: string,
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ title }),
  });
  if (!response.ok) {
    throw new Error('Failed to update todo title');
  }
};

export const deleteTodo = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to delete todo');
  }
};
