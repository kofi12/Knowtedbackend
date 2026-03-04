export interface Course {
  id: string;
  name: string;
  semester: 'Winter' | 'Summer' | 'Fall';
  year: number;
  materialsCount: number;
  aidsCount: number;
  lastUpdated: string;
  color: string;
  progress: number; // 0-100
}

export interface Material {
  id: string;
  courseId: string;
  name: string;
  type: 'pdf' | 'video' | 'doc' | 'slides';
  uploadedAt: string;
}

export interface Aid {
  id: string;
  courseId: string;
  type: 'quiz' | 'flashcards' | 'guide' | 'schedule';
  name: string;
  createdAt: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  known: boolean;
}

export const mockCourses: Course[] = [
  {
    id: '1',
    name: 'Introduction to Computer Science',
    semester: 'Fall',
    year: 2023,
    materialsCount: 12,
    aidsCount: 8,
    lastUpdated: '2 hours ago',
    color: 'indigo',
    progress: 68,
  },
  {
    id: '2',
    name: 'Calculus II',
    semester: 'Winter',
    year: 2024,
    materialsCount: 24,
    aidsCount: 15,
    lastUpdated: '1 day ago',
    color: 'teal',
    progress: 45,
  },
  {
    id: '3',
    name: 'Modern European History',
    semester: 'Summer',
    year: 2023,
    materialsCount: 18,
    aidsCount: 6,
    lastUpdated: '3 days ago',
    color: 'blue',
    progress: 82,
  },
  {
    id: '4',
    name: 'Organic Chemistry',
    semester: 'Fall',
    year: 2023,
    materialsCount: 31,
    aidsCount: 22,
    lastUpdated: '5 days ago',
    color: 'purple',
    progress: 34,
  },
];

export const mockMaterials: Material[] = [
  {
    id: 'm1',
    courseId: '1',
    name: 'Week 1 - Introduction to Programming.pdf',
    type: 'pdf',
    uploadedAt: '2024-02-01',
  },
  {
    id: 'm2',
    courseId: '1',
    name: 'Lecture 2 - Data Structures.mp4',
    type: 'video',
    uploadedAt: '2024-02-03',
  },
  {
    id: 'm3',
    courseId: '1',
    name: 'Assignment 1 - Variables and Types.docx',
    type: 'doc',
    uploadedAt: '2024-02-05',
  },
];

export const mockAids: Aid[] = [
  {
    id: 'a1',
    courseId: '1',
    type: 'flashcards',
    name: 'Week 1-2 Flashcards',
    createdAt: '2024-02-10',
  },
  {
    id: 'a2',
    courseId: '1',
    type: 'quiz',
    name: 'Midterm Practice Quiz',
    createdAt: '2024-02-08',
  },
  {
    id: 'a3',
    courseId: '1',
    type: 'guide',
    name: 'Final Exam Study Guide',
    createdAt: '2024-02-06',
  },
];

export const mockFlashcards: Flashcard[] = [
  {
    id: 'f1',
    question: 'What is a variable in programming?',
    answer: 'A variable is a named storage location in memory that holds a value. It can be changed during program execution and has a specific data type.',
    known: false,
  },
  {
    id: 'f2',
    question: 'What is the difference between a stack and a queue?',
    answer: 'A stack follows Last-In-First-Out (LIFO) principle, while a queue follows First-In-First-Out (FIFO) principle. Stack operations are push/pop, queue operations are enqueue/dequeue.',
    known: false,
  },
  {
    id: 'f3',
    question: 'Define Big O notation',
    answer: 'Big O notation describes the upper bound of algorithm complexity, expressing how runtime or space requirements grow relative to input size. It focuses on worst-case scenarios.',
    known: false,
  },
  {
    id: 'f4',
    question: 'What is recursion?',
    answer: 'Recursion is a programming technique where a function calls itself to solve a problem by breaking it down into smaller, similar subproblems. It requires a base case to prevent infinite loops.',
    known: false,
  },
];