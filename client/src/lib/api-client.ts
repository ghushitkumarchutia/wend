const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const fetcher = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const headers = new Headers(options?.headers);
  if (!headers.has('Content-Type') && !(options?.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `API request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
};
