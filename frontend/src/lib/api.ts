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

export interface FlashcardResponseDto {
  flashcardId: number;
  frontText: string;
  backText: string;
  orderIndex: number;
  createdAt: string;
}

export interface FlashcardDeckResponseDto {
  deckId: string;
  courseId: string;
  documentId: string | null;
  title: string;
  generationStatus: string;
  createdAt: string;
  flashcards: FlashcardResponseDto[];
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

// ── Document Bank ──

export interface DocumentBankItemDto {
  documentId: string;
  originalFilename: string;
  contentType: string;
  fileSizeBytes: number;
  uploadedAt: string;
  courseId: string;
  courseName: string;
}

export async function fetchAllDocuments(search?: string, courseId?: string): Promise<DocumentBankItemDto[]> {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (courseId) params.set('courseId', courseId);
  const query = params.toString();
  return apiFetch<DocumentBankItemDto[]>(`/api/documents${query ? `?${query}` : ''}`);
}

// ── Flashcards ──

export async function generateFlashcards(courseId: string, documentId: string, title?: string): Promise<FlashcardDeckResponseDto> {
  const formData = new FormData();
  formData.append('documentId', documentId);
  if (title) formData.append('title', title);
  return apiFetch<FlashcardDeckResponseDto>(`/api/courses/${courseId}/flashcards/generate`, {
    method: 'POST',
    body: formData,
  });
}

export async function listFlashcardDecks(courseId: string): Promise<FlashcardDeckResponseDto[]> {
  return apiFetch<FlashcardDeckResponseDto[]>(`/api/courses/${courseId}/flashcards`);
}

export async function getFlashcardDeck(deckId: string): Promise<FlashcardDeckResponseDto> {
  return apiFetch<FlashcardDeckResponseDto>(`/api/flashcards/decks/${deckId}`);
}

export async function deleteFlashcardDeck(deckId: string): Promise<void> {
  return apiFetch<void>(`/api/flashcards/decks/${deckId}`, { method: 'DELETE' });
}

// ── Quizzes ──

export interface QuestionOptionDto {
  optionId: number;
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface QuizQuestionDto {
  questionId: number;
  questionText: string;
  questionType: string;
  orderIndex: number;
  options: QuestionOptionDto[];
}

export interface QuizResponseDto {
  quizId: string;
  courseId: string;
  documentId: string | null;
  title: string;
  generationStatus: string;
  questionType: string;
  createdAt: string;
  questions: QuizQuestionDto[];
}

export interface AttemptAnswerDto {
  questionId: number;
  selectedOptionId: number | null;
  questionTextSnapshot: string;
  selectedOptionTextSnapshot: string | null;
  isCorrect: boolean | null;
}

export interface QuizAttemptResponseDto {
  attemptId: number;
  quizId: string;
  startedAt: string;
  completedAt: string | null;
  score: number | null;
  totalPoints: number | null;
  answers: AttemptAnswerDto[];
}

export async function generateQuiz(courseId: string, documentId: string, questionType: string, title?: string): Promise<QuizResponseDto> {
  const params = new URLSearchParams();
  params.append('documentId', documentId);
  params.append('questionType', questionType);
  if (title) params.append('title', title);
  return apiFetch<QuizResponseDto>(`/api/courses/${courseId}/quizzes/generate?${params.toString()}`, {
    method: 'POST',
  });
}

export async function listQuizzes(courseId: string): Promise<QuizResponseDto[]> {
  return apiFetch<QuizResponseDto[]>(`/api/courses/${courseId}/quizzes`);
}

export async function getQuiz(quizId: string): Promise<QuizResponseDto> {
  return apiFetch<QuizResponseDto>(`/api/quizzes/${quizId}`);
}

export async function submitQuizAttempt(quizId: string, answers: Record<number, number[]>): Promise<QuizAttemptResponseDto> {
  return apiFetch<QuizAttemptResponseDto>(`/api/quizzes/${quizId}/attempts`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
}

export async function listQuizAttempts(quizId: string): Promise<QuizAttemptResponseDto[]> {
  return apiFetch<QuizAttemptResponseDto[]>(`/api/quizzes/${quizId}/attempts`);
}

export async function deleteQuiz(quizId: string): Promise<void> {
  return apiFetch<void>(`/api/quizzes/${quizId}`, { method: 'DELETE' });
}
