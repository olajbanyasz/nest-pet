const ADMIN_BASE_URL = '/api/admin';

export type Role = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  role: Role;
  name?: string;
  createdAt?: string;
  lastLoginAt?: string;
  todoCount?: number;
}

interface BackendUser {
  lastLoginAt: string | undefined;
  todoCount: number | undefined;
  _id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  name?: string;
  createdAt?: string;
}

function mapBackendUser(user: BackendUser): User {
  return {
    id: user._id,
    email: user.email,
    role: user.role.toLowerCase() as Role,
    name: user.name,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    todoCount: user.todoCount,
  };
}

async function fetchJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }
  return (await response.json()) as T;
}

export const getUsers = async (): Promise<User[]> => {
  const response = await fetch(`${ADMIN_BASE_URL}/users`, {
    credentials: 'include',
  });

  const users = await fetchJson<BackendUser[]>(response);
  return users.map(mapBackendUser);
};

export const getUserById = async (id: string): Promise<User> => {
  const response = await fetch(`${ADMIN_BASE_URL}/users/${id}`, {
    credentials: 'include',
  });

  const user = await fetchJson<BackendUser>(response);
  return mapBackendUser(user);
};

export const deleteUser = async (id: string): Promise<void> => {
  const response = await fetch(`${ADMIN_BASE_URL}/users/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to delete user');
  }
};

export const promoteUserToAdmin = async (id: string): Promise<User> => {
  const response = await fetch(`${ADMIN_BASE_URL}/users/${id}/promote`, {
    method: 'PATCH',
    credentials: 'include',
  });

  const user = await fetchJson<BackendUser>(response);
  return mapBackendUser(user);
};

export const demoteAdminToUser = async (id: string): Promise<User> => {
  const response = await fetch(`${ADMIN_BASE_URL}/users/${id}/demote`, {
    method: 'PATCH',
    credentials: 'include',
  });

  const user = await fetchJson<BackendUser>(response);
  return mapBackendUser(user);
};
