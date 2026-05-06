export interface User {
  name: string;
  email: string;
  token?: string;
}

export function saveUser(user: User) {
  localStorage.setItem('documind_user', JSON.stringify(user));
}

export function getUser(): User | null {
  const raw = localStorage.getItem('documind_user');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function getToken(): string | null {
  return getUser()?.token || null;
}

export function getAuthHeader(): { Authorization: string } | {} {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function logout() {
  localStorage.removeItem('documind_user');
}
