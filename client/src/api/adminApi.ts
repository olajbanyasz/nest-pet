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
  inactive?: boolean;
  inactiveAt?: string;
  deleted?: boolean;
  deletedAt?: string;
}

interface BackendUser {
  _id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  name?: string;
  createdAt?: string;
  lastLoginAt?: string;
  todoCount?: number;
  inactive?: boolean;
  inactiveAt?: string;
  deleted?: boolean;
  deletedAt?: string;
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
    inactive: user.inactive,
    inactiveAt: user.inactiveAt,
    deleted: user.deleted,
    deletedAt: user.deletedAt,
  };
}

export const getUsers = async (
  email?: string,
  deleted?: boolean | 'all',
): Promise<User[]> => {
  const params = new URLSearchParams();
  if (email) {
    params.set('email', email);
  }
  if (deleted === true) {
    params.set('deleted', 'true');
  } else if (deleted === 'all') {
    params.set('deleted', 'all');
  }
  const query = params.size > 0 ? `?${params.toString()}` : '';
  const res = await api.get<BackendUser[]>(`${ADMIN_BASE_URL}/users${query}`);
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

export const restoreUser = async (id: string): Promise<User> => {
  const res = await api.patch<BackendUser>(
    `${ADMIN_BASE_URL}/users/${id}/restore`,
  );
  return mapBackendUser(res.data);
};

export const getApplicationDetails = async (): Promise<{
  totalUsers: number;
  totalAdmins: number;
  totalTodos: number;
  totalCompletedTodos: number;
  totalActiveTodos: number;
  totalDeletedTodos: number;
}> => {
  try {
    const response = await api.get<{
      totalUsers: number;
      totalAdmins: number;
      totalTodos: number;
      totalCompletedTodos: number;
      totalActiveTodos: number;
      totalDeletedTodos: number;
    }>(`/admin/details`);
    return response.data;
  } catch (err) {
    console.error('[Admin API] Get application details error:', String(err));
    throw err;
  }
};
