import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { CourseCard } from '../components/CourseCard';
import { useCourses } from '../lib/CoursesContext';
import { DocumentDto, fetchDashboardRecent, fetchDashboardSummary, DashboardSummaryDto, getUserIdFromToken } from '../lib/api';

export function Dashboard() {
  const { courses, loading } = useCourses();
  const [summary, setSummary] = useState<DashboardSummaryDto | null>(null);
  const [recentDocuments, setRecentDocuments] = useState<DocumentDto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const userId = getUserIdFromToken();
    if (!userId) return;

    fetchDashboardSummary(userId)
      .then(setSummary)
      .catch(() => {
        // API not available — will fall back to counting from courses
      });

    fetchDashboardRecent(userId, undefined, 5)
      .then((data) => setRecentDocuments(data.recentDocuments ?? []))
      .catch(() => {
        setRecentDocuments([]);
      });
  }, []);

  // Use API summary if available, otherwise compute from courses
  const activeCourses = summary?.activeCourses ?? courses.length;
  const studyMaterials = summary?.studyMaterials ?? courses.reduce((sum, c) => sum + c.materialsCount, 0);
  const generatedAids = summary?.generatedAids ?? courses.reduce((sum, c) => sum + c.aidsCount, 0);

  if (!loading && courses.length === 0) {
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
            {activeCourses}
          </div>
          <div className="text-xs md:text-sm text-muted-foreground">Active Courses</div>
        </div>
        <div className="p-4 md:p-6 bg-card border border-border rounded-lg md:rounded-xl">
          <div className="text-2xl md:text-3xl font-bold mb-1">
            {studyMaterials}
          </div>
          <div className="text-xs md:text-sm text-muted-foreground">Study Materials</div>
        </div>
        <div className="p-4 md:p-6 bg-card border border-border rounded-lg md:rounded-xl">
          <div className="text-2xl md:text-3xl font-bold mb-1">
            {generatedAids}
          </div>
          <div className="text-xs md:text-sm text-muted-foreground">Generated Aids</div>
        </div>
      </div>

      {/* Courses grid */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-lg md:text-xl font-semibold">Your Courses</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground"
            />
          </div>
        </div>
        {(() => {
          const filtered = courses.filter(course =>
            course.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
          if (filtered.length === 0 && searchQuery) {
            return (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No courses matching "{searchQuery}"
              </p>
            );
          }
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filtered.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          );
        })()}
      </div>

      {/* Recent documents */}
      <div className="mt-8 md:mt-10">
        <h2 className="text-lg md:text-xl font-semibold mb-4">Recent Documents</h2>
        <div className="bg-card border border-border rounded-lg md:rounded-xl divide-y divide-border">
          {recentDocuments.length === 0 ? (
            <div className="p-4 md:p-6 text-sm text-muted-foreground">No documents uploaded yet.</div>
          ) : (
            recentDocuments.map((doc) => (
              <div key={doc.documentId} className="p-4 md:p-5">
                <div className="font-medium truncate">{doc.originalFilename}</div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1">
                  {new Date(doc.uploadedAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
