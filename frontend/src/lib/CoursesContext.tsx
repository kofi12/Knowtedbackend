import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Course, mockCourses } from './mockData';
import {
  CourseDto,
  fetchCourses as apiFetchCourses,
  createCourse as apiCreateCourse,
  updateCourse as apiUpdateCourse,
  deleteCourse as apiDeleteCourse,
  getUserIdFromToken,
} from './api';

interface CoursesContextType {
  courses: Course[];
  loading: boolean;
  addCourse: (course: Omit<Course, 'id' | 'materialsCount' | 'aidsCount' | 'lastUpdated' | 'progress'>) => Promise<void>;
  updateCourse: (id: string, updates: Partial<Pick<Course, 'name' | 'semester' | 'year' | 'color'>>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  refetchCourses: () => Promise<void>;
}

const CoursesContext = createContext<CoursesContextType | null>(null);

const COLORS = ['indigo', 'teal', 'blue', 'purple'];

/** Convert backend term string (e.g. "Fall 2024") to semester + year */
function parseTerm(term: string): { semester: 'Winter' | 'Summer' | 'Fall'; year: number } {
  const parts = (term || '').trim().split(/\s+/);
  const semesterStr = parts[0] || 'Fall';
  const yearStr = parts[1] || String(new Date().getFullYear());

  let semester: 'Winter' | 'Summer' | 'Fall' = 'Fall';
  if (['Winter', 'Summer', 'Fall'].includes(semesterStr)) {
    semester = semesterStr as 'Winter' | 'Summer' | 'Fall';
  }

  return { semester, year: parseInt(yearStr, 10) || new Date().getFullYear() };
}

/** Format an ISO date string to a relative time string */
function formatRelativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(isoDate).toLocaleDateString();
}

/** Map a backend CourseDto to the frontend Course type */
function dtoToCourse(dto: CourseDto, index: number): Course {
  const { semester, year } = parseTerm(dto.term);
  return {
    id: dto.courseId,
    name: dto.name,
    semester,
    year,
    materialsCount: 0,
    aidsCount: 0,
    lastUpdated: formatRelativeTime(dto.updatedAt),
    color: COLORS[index % COLORS.length],
    progress: 0,
  };
}

export function CoursesProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCourses = useCallback(async () => {
    const userId = getUserIdFromToken();
    if (!userId) {
      setCourses(mockCourses);
      setLoading(false);
      return;
    }
    try {
      const dtos = await apiFetchCourses(userId);
      setCourses(dtos.map((dto, i) => dtoToCourse(dto, i)));
    } catch {
      setCourses(mockCourses);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const addCourse = async (course: Omit<Course, 'id' | 'materialsCount' | 'aidsCount' | 'lastUpdated' | 'progress'>) => {
    const userId = getUserIdFromToken();
    const term = `${course.semester} ${course.year}`;

    if (!userId) {
      // Offline / no token — local-only
      const newCourse: Course = {
        ...course,
        id: crypto.randomUUID(),
        materialsCount: 0,
        aidsCount: 0,
        lastUpdated: 'Just now',
        progress: 0,
      };
      setCourses((prev: Course[]) => [newCourse, ...prev]);
      return;
    }

    try {
      const dto = await apiCreateCourse(userId, { name: course.name, term });
      const created = dtoToCourse(dto, courses.length);
      created.color = course.color;
      setCourses((prev: Course[]) => [created, ...prev]);
    } catch {
      // Fallback to local
      const newCourse: Course = {
        ...course,
        id: crypto.randomUUID(),
        materialsCount: 0,
        aidsCount: 0,
        lastUpdated: 'Just now',
        progress: 0,
      };
      setCourses((prev: Course[]) => [newCourse, ...prev]);
    }
  };

  const updateCourse = async (id: string, updates: Partial<Pick<Course, 'name' | 'semester' | 'year' | 'color'>>) => {
    // Optimistic update
    setCourses((prev: Course[]) => prev.map((c: Course) => (c.id === id ? { ...c, ...updates, lastUpdated: 'Just now' } : c)));

    const userId = getUserIdFromToken();
    if (!userId) return;

    const current = courses.find(c => c.id === id);
    if (!current) return;

    const patchData: { name?: string; term?: string } = {};
    if (updates.name) patchData.name = updates.name;
    if (updates.semester || updates.year) {
      const sem = updates.semester || current.semester;
      const yr = updates.year || current.year;
      patchData.term = `${sem} ${yr}`;
    }

    try {
      await apiUpdateCourse(userId, id, patchData);
    } catch {
      // Revert on failure
      await loadCourses();
    }
  };

  const deleteCourse = async (id: string) => {
    // Optimistic delete
    setCourses((prev: Course[]) => prev.filter((c: Course) => c.id !== id));

    const userId = getUserIdFromToken();
    if (!userId) return;

    try {
      await apiDeleteCourse(userId, id);
    } catch {
      // Revert on failure
      await loadCourses();
    }
  };

  return (
    <CoursesContext.Provider value={{ courses, loading, addCourse, updateCourse, deleteCourse, refetchCourses: loadCourses }}>
      {children}
    </CoursesContext.Provider>
  );
}

export function useCourses() {
  const context = useContext(CoursesContext);
  if (!context) throw new Error('useCourses must be used within a CoursesProvider');
  return context;
}
