const ADMIN_BASE_URL = '/api/admin';

export type Role = 'user' | 'admin';

export interface AdminUser {
  id: string;
  email: string;
  role: Role;
  name?: string;
  createdAt?: string;
}

interface BackendUser {
  _id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  name?: string;
  createdAt?: string;
}

function mapBackendUser(user: BackendUser): AdminUser {
  return {
    id: user._id,
    email: user.email,
    role: user.role.toLowerCase() as Role,
    name: user.name,
    createdAt: user.createdAt,
  };
}

async function fetchJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }
  return (await response.json()) as T;
}

/* ======================
   API CALLS
====================== */

export const getUsers = async (): Promise<AdminUser[]> => {
  const response = await fetch(`${ADMIN_BASE_URL}/users`, {
    credentials: 'include',
  });

  const users = await fetchJson<BackendUser[]>(response);
  return users.map(mapBackendUser);
};

export const getUserById = async (id: string): Promise<AdminUser> => {
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

export const promoteUserToAdmin = async (id: string): Promise<AdminUser> => {
  const response = await fetch(`${ADMIN_BASE_URL}/users/${id}/promote`, {
    method: 'PATCH',
    credentials: 'include',
  });

  const user = await fetchJson<BackendUser>(response);
  return mapBackendUser(user);
};

export const demoteAdminToUser = async (id: string): Promise<AdminUser> => {
  const response = await fetch(`${ADMIN_BASE_URL}/users/${id}/demote`, {
    method: 'PATCH',
    credentials: 'include',
  });

  const user = await fetchJson<BackendUser>(response);
  return mapBackendUser(user);
};
