import React from 'react';
import { Plus } from 'lucide-react';
import { CourseCard } from '../components/CourseCard';
import { mockCourses } from '../lib/mockData';

export function Dashboard() {
  if (mockCourses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <Plus className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">No courses yet</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Get started by creating your first course. Add your study materials and
          let Know-ted generate personalized study aids.
        </p>
        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
          <Plus className="w-5 h-5" />
          <span>Create Your First Course</span>
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Stats overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="p-4 md:p-6 bg-card border border-border rounded-lg md:rounded-xl">
          <div className="text-2xl md:text-3xl font-bold mb-1">
            {mockCourses.length}
          </div>
          <div className="text-xs md:text-sm text-muted-foreground">Active Courses</div>
        </div>
        <div className="p-4 md:p-6 bg-card border border-border rounded-lg md:rounded-xl">
          <div className="text-2xl md:text-3xl font-bold mb-1">
            {mockCourses.reduce((sum, c) => sum + c.materialsCount, 0)}
          </div>
          <div className="text-xs md:text-sm text-muted-foreground">Study Materials</div>
        </div>
        <div className="p-4 md:p-6 bg-card border border-border rounded-lg md:rounded-xl">
          <div className="text-2xl md:text-3xl font-bold mb-1">
            {mockCourses.reduce((sum, c) => sum + c.aidsCount, 0)}
          </div>
          <div className="text-xs md:text-sm text-muted-foreground">Generated Aids</div>
        </div>
      </div>

      {/* Courses grid */}
      <div>
        <h2 className="text-lg md:text-xl font-semibold mb-4">Your Courses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {mockCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </div>
  );
}