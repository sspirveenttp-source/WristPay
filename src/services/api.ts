/**
 * WristPay AI - Base API Client
 */

export const getAuthToken = (): string | null => {
  return localStorage.getItem('wristpay_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('wristpay_token', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('wristpay_token');
};

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMessage = `Request failed (${response.status})`;
    try {
      const errorJson = await response.json();
      errorMessage = errorJson.error || errorJson.message || errorMessage;
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
