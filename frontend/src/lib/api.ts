export interface UserProfile {
  studentId: string;
  email: string;
  displayName: string;
}

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = { ...options?.headers };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  if (options?.body && !(options.body instanceof FormData)) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }
  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json();
}

export async function fetchCurrentUser(): Promise<UserProfile> {
  return apiFetch<UserProfile>('/api/me');
}

export async function deleteDocument(documentId: string): Promise<void> {
  return apiFetch<void>(`/api/documents/${documentId}`, { method: 'DELETE' });
}

export interface CourseResponse {
  courseId: string;
  userId: string;
  code: string;
  name: string;
  term: string;
  createdAt: string;
  updatedAt: string;
}

export async function createCourse(data: { name: string; code?: string; term: string }): Promise<CourseResponse> {
  return apiFetch<CourseResponse>('/api/courses', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateCourse(courseId: string, data: { name?: string; code?: string; term?: string }): Promise<CourseResponse> {
  return apiFetch<CourseResponse>(`/api/courses/${courseId}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteCourse(courseId: string): Promise<void> {
  return apiFetch<void>(`/api/courses/${courseId}`, { method: 'DELETE' });
}
