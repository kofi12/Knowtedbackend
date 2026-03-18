import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Course } from "./mockData";
import {
  CourseDto,
  fetchCourses as apiFetchCourses,
  createCourse as apiCreateCourse,
  updateCourse as apiUpdateCourse,
  deleteCourse as apiDeleteCourse,
} from "./api";
import { useAuth } from "../context/AuthContext";

interface CoursesContextType {
  courses: Course[];
  loading: boolean;
  addCourse: (
    course: Omit<Course, "id" | "materialsCount" | "aidsCount" | "lastUpdated" | "progress">
  ) => Promise<void>;
  updateCourse: (
    id: string,
    updates: Partial<Pick<Course, "name" | "semester" | "year" | "color">>
  ) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  refetchCourses: () => Promise<void>;
}

const CoursesContext = createContext<CoursesContextType | null>(null);

const COLORS = ["indigo", "teal", "blue", "purple"];

/* ---------- Helpers ---------- */

function parseTerm(term: string): { semester: "Winter" | "Summer" | "Fall"; year: number } {
  const parts = (term || "").trim().split(/\s+/);
  const semesterStr = parts[0] || "Fall";
  const yearStr = parts[1] || String(new Date().getFullYear());

  let semester: "Winter" | "Summer" | "Fall" = "Fall";
  if (["Winter", "Summer", "Fall"].includes(semesterStr)) {
    semester = semesterStr as "Winter" | "Summer" | "Fall";
  }

  return {
    semester,
    year: parseInt(yearStr, 10) || new Date().getFullYear(),
  };
}

function formatRelativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  return new Date(isoDate).toLocaleDateString();
}

function dtoToCourse(dto: CourseDto, index: number): Course {
  const { semester, year } = parseTerm(dto.term);

  return {
    id: dto.courseId,
    name: dto.name,
    semester,
    year,
    materialsCount: dto.materialCount ?? 0,
    aidsCount: 0,
    lastUpdated: formatRelativeTime(dto.updatedAt),
    color: COLORS[index % COLORS.length],
    progress: 0,
  };
}

/* ---------- Provider ---------- */

export function CoursesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCourses = useCallback(async () => {
    if (!user?.id) {
      setCourses([]);
      setLoading(false);
      return;
    }

    try {
      const dtos = await apiFetchCourses(user.id);
      setCourses(dtos.map((dto, i) => dtoToCourse(dto, i)));
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  /* ---------- CREATE COURSE ---------- */

  const addCourse = async (
    course: Omit<Course, "id" | "materialsCount" | "aidsCount" | "lastUpdated" | "progress">
  ) => {
    if (!user?.id) {
      throw new Error("You are not authenticated.");
    }

    const term = `${course.semester} ${course.year}`;

    try {
      const dto = await apiCreateCourse(user.id, {
        name: course.name,
        term,
      });

      const created = dtoToCourse(dto, courses.length);
      created.color = course.color;

      setCourses((prev) => [created, ...prev]);
    } catch {
      throw new Error("Failed to create course in API");
    }
  };

  /* ---------- UPDATE COURSE ---------- */

  const updateCourse = async (
    id: string,
    updates: Partial<Pick<Course, "name" | "semester" | "year" | "color">>
  ) => {
    setCourses((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, ...updates, lastUpdated: "Just now" } : c
      )
    );

    if (!user?.id) {
      await loadCourses();
      throw new Error("You are not authenticated.");
    }

    const current = courses.find((c) => c.id === id);
    if (!current) return;

    const patchData: { name?: string; term?: string } = {};

    if (updates.name) patchData.name = updates.name;

    if (updates.semester || updates.year) {
      const sem = updates.semester || current.semester;
      const yr = updates.year || current.year;
      patchData.term = `${sem} ${yr}`;
    }

    try {
      await apiUpdateCourse(user.id, id, patchData);
    } catch {
      await loadCourses();
      throw new Error("Failed to update course");
    }
  };

  /* ---------- DELETE COURSE ---------- */

  const deleteCourse = async (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));

    if (!user?.id) {
      await loadCourses();
      throw new Error("You are not authenticated.");
    }

    try {
      await apiDeleteCourse(user.id, id);
    } catch {
      await loadCourses();
      throw new Error("Failed to delete course");
    }
  };

  return (
    <CoursesContext.Provider
      value={{
        courses,
        loading,
        addCourse,
        updateCourse,
        deleteCourse,
        refetchCourses: loadCourses,
      }}
    >
      {children}
    </CoursesContext.Provider>
  );
}

/* ---------- Hook ---------- */

export function useCourses() {
  const context = useContext(CoursesContext);

  if (!context) {
    throw new Error("useCourses must be used within a CoursesProvider");
  }

  return context;
}