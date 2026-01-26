import api from './axios';

const ADMIN_BASE_URL = '/admin';

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
  _id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  name?: string;
  createdAt?: string;
  lastLoginAt?: string;
  todoCount?: number;
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

export const getUsers = async (): Promise<User[]> => {
  const res = await api.get<BackendUser[]>(`${ADMIN_BASE_URL}/users`);
  return res.data.map(mapBackendUser);
};

export const getUserById = async (id: string): Promise<User> => {
  const res = await api.get<BackendUser>(`${ADMIN_BASE_URL}/users/${id}`);
  return mapBackendUser(res.data);
};

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`${ADMIN_BASE_URL}/users/${id}`);
};

export const promoteUserToAdmin = async (id: string): Promise<User> => {
  const res = await api.patch<BackendUser>(
    `${ADMIN_BASE_URL}/users/${id}/promote`,
  );
  return mapBackendUser(res.data);
};

export const demoteAdminToUser = async (id: string): Promise<User> => {
  const res = await api.patch<BackendUser>(
    `${ADMIN_BASE_URL}/users/${id}/demote`,
  );
  return mapBackendUser(res.data);
};
