export class AuthExpiredError extends Error {
  constructor() {
    super('Authentication expired');
  }
}

export interface AuthContextLike {
  refresh: () => Promise<boolean>;
  logout: () => void;
}

export async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {},
  authContext?: AuthContextLike,
): Promise<T> {
  const token = window.sessionStorage.getItem('access_token');

  const headers: HeadersInit = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 401 && authContext) {
    const refreshed = await authContext.refresh();

    if (!refreshed) {
      authContext.logout();
      throw new AuthExpiredError();
    }

    const newToken = window.sessionStorage.getItem('access_token');
    const retryHeaders: HeadersInit = {
      ...(options.headers || {}),
      ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}),
    };

    response = await fetch(url, {
      ...options,
      headers: retryHeaders,
      credentials: 'include',
    });
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}
