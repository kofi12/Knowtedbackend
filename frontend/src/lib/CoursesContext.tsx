import { createContext, useContext, useState, ReactNode } from 'react';
import { Course, mockCourses } from './mockData';

interface CoursesContextType {
  courses: Course[];
  addCourse: (course: Omit<Course, 'id' | 'materialsCount' | 'aidsCount' | 'lastUpdated' | 'progress'>) => void;
  updateCourse: (id: string, updates: Partial<Pick<Course, 'name' | 'semester' | 'year' | 'color'>>) => void;
  deleteCourse: (id: string) => void;
}

const CoursesContext = createContext<CoursesContextType | null>(null);

export function CoursesProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>(mockCourses);

  const addCourse = (course: Omit<Course, 'id' | 'materialsCount' | 'aidsCount' | 'lastUpdated' | 'progress'>) => {
    const newCourse: Course = {
      ...course,
      id: crypto.randomUUID(),
      materialsCount: 0,
      aidsCount: 0,
      lastUpdated: 'Just now',
      progress: 0,
    };
    setCourses(prev => [newCourse, ...prev]);
  };

  const updateCourse = (id: string, updates: Partial<Pick<Course, 'name' | 'semester' | 'year' | 'color'>>) => {
    setCourses(prev => prev.map(c => (c.id === id ? { ...c, ...updates, lastUpdated: 'Just now' } : c)));
  };

  const deleteCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  return (
    <CoursesContext.Provider value={{ courses, addCourse, updateCourse, deleteCourse }}>
      {children}
    </CoursesContext.Provider>
  );
}

export function useCourses() {
  const context = useContext(CoursesContext);
  if (!context) throw new Error('useCourses must be used within a CoursesProvider');
  return context;
}
