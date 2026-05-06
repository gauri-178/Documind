import { getAuthHeader } from './auth';

const BASE_URL = 'http://localhost:8080/api';

async function request(path: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `Request failed with status ${response.status}`);
  }

  // Handle empty responses for DELETE or 204
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null;
  }

  return response.json();
}

export const api = {
  // Auth
  login: (credentials: any) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  signup: (userData: any) => request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  getMe: () => request('/auth/me'),

  // Chats
  getChats: () => request('/chats'),
  createChat: (title?: string) => request('/chats', {
    method: 'POST',
    body: JSON.stringify({ title }),
  }),
  getMessages: (chatId: string | number) => request(`/chats/${chatId}/messages`),
  sendMessage: (chatId: string | number, text: string, documentIds: number[]) => request(`/chats/${chatId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ text, documentIds }),
  }),
  deleteChat: (chatId: string | number) => request(`/chats/${chatId}`, {
    method: 'DELETE',
  }),

  // Documents
  uploadFiles: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    // We don't set Content-Type for FormData, the browser does it with the boundary
    const headers: any = { ...getAuthHeader() };
    
    return fetch(`${BASE_URL}/documents/upload`, {
      method: 'POST',
      headers,
      body: formData,
    }).then(res => {
        if (!res.ok) throw new Error('Upload failed');
        return res.json();
    });
  },
  deleteDocument: (id: string | number) => request(`/documents/${id}`, {
    method: 'DELETE',
  }),
};
