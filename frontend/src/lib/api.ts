export interface UserProfile {
  studentId: string;
  email: string;
  displayName: string;
}

export interface CourseDto {
  courseId: string;
  userId: string;
  code: string;
  name: string;
  term: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummaryDto {
  activeCourses: number;
  studyMaterials: number;
  generatedAids: number;
}

export interface DocumentDto {
  documentId: string;
  userId: string;
  courseId: string;
  originalFilename: string;
  storageKey: string;
  storageBucket: string;
  contentType: string;
  fileSizeBytes: number;
  fileHashSha256: string;
  uploadStatus: string;
  uploadedAt: string;
}

export interface StudyAidDto {
  studyAidId: string;
  courseId: string;
  documentId: string;
  typeId: number;
  type: string;
  title: string;
  generationStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardRecentDto {
  recentDocuments: DocumentDto[];
  recentStudyAids: StudyAidDto[];
}

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

/** Decode JWT payload to extract userId (subject claim) */
export function getUserIdFromToken(): string | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || null;
  } catch {
    return null;
  }
}

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

// ── Auth / User ──

export async function fetchCurrentUser(): Promise<UserProfile> {
  return apiFetch<UserProfile>('/api/me');
}

// ── Courses ──

export async function fetchCourses(userId: string): Promise<CourseDto[]> {
  return apiFetch<CourseDto[]>(`/api/courses?userId=${userId}`);
}

export async function fetchCourse(userId: string, courseId: string): Promise<CourseDto> {
  return apiFetch<CourseDto>(`/api/courses/${courseId}?userId=${userId}`);
}

export async function createCourse(userId: string, data: { name: string; code?: string; term?: string }): Promise<CourseDto> {
  return apiFetch<CourseDto>(`/api/courses?userId=${userId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCourse(userId: string, courseId: string, data: { name?: string; code?: string; term?: string }): Promise<CourseDto> {
  return apiFetch<CourseDto>(`/api/courses/${courseId}?userId=${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteCourse(userId: string, courseId: string): Promise<void> {
  return apiFetch<void>(`/api/courses/${courseId}?userId=${userId}`, { method: 'DELETE' });
}

// ── Dashboard ──

export async function fetchDashboardSummary(userId: string): Promise<DashboardSummaryDto> {
  return apiFetch<DashboardSummaryDto>(`/api/dashboard/summary?userId=${userId}`);
}

export async function fetchDashboardRecent(userId: string, courseId?: string, limit?: number): Promise<DashboardRecentDto> {
  const params = new URLSearchParams({ userId });
  if (courseId) params.set('courseId', courseId);
  if (limit) params.set('limit', String(limit));
  return apiFetch<DashboardRecentDto>(`/api/dashboard/recent?${params}`);
}

// ── Documents ──

export async function deleteDocument(documentId: string): Promise<void> {
  return apiFetch<void>(`/api/documents/${documentId}`, { method: 'DELETE' });
}
