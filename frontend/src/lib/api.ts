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
  materialCount: number;
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

export interface CourseDocumentResponseDto {
  documentId: string;
  originalFilename: string;
  contentType: string;
  fileSizeBytes: number;
  uploadedAt: string;
  presignedUrl: string | null;
  courseId: string;
}

export interface DownloadUrlResponse {
  presignedUrl: string;
  expiresAt: string;
}

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

export function hasStoredToken(): boolean {
  return !!localStorage.getItem('token');
}

/** Decode JWT payload to extract userId (subject claim) */
export function getUserIdFromToken(): string | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return null;
    // JWT payload uses base64url; normalize before decoding.
    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    const payload = JSON.parse(atob(padded));
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
  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers, credentials: 'include' });
  if (!response.ok) {
    let detailedMessage = '';
    try {
      const errorBody = await response.json();
      if (errorBody?.message) {
        detailedMessage = String(errorBody.message);
      } else if (errorBody?.error) {
        detailedMessage = String(errorBody.error);
      }
    } catch {
      try {
        detailedMessage = await response.text();
      } catch {
        detailedMessage = '';
      }
    }
    const suffix = detailedMessage ? ` - ${detailedMessage}` : '';
    throw new Error(`API error: ${response.status} ${response.statusText}${suffix}`);
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

export async function logout(): Promise<void> {
  try {
    await apiFetch<void>('/api/auth/logout', { method: 'POST' });
  } finally {
    localStorage.removeItem('token');
  }
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

export async function fetchCourseDocuments(courseId: string, page = 0, size = 20): Promise<CourseDocumentResponseDto[]> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  return apiFetch<CourseDocumentResponseDto[]>(`/api/courses/${courseId}/documents?${params.toString()}`);
}

export async function uploadCourseDocument(courseId: string, file: File): Promise<CourseDocumentResponseDto> {
  const formData = new FormData();
  formData.append('file', file);
  return apiFetch<CourseDocumentResponseDto>(`/api/courses/${courseId}/documents`, {
    method: 'POST',
    body: formData,
  });
}

export async function getDocumentPresignedUrl(documentId: string, expirySeconds = 3600): Promise<DownloadUrlResponse> {
  const params = new URLSearchParams({
    expirySeconds: String(expirySeconds),
  });
  return apiFetch<DownloadUrlResponse>(`/api/documents/${documentId}/presigned-url?${params.toString()}`);
}