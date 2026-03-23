import React, { useState, useEffect } from 'react';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { CourseCard } from '../components/CourseCard';
import { useCourses } from '../lib/CoursesContext';
import { NewCourseModal } from '../components/NewCourseModal';
import {
  DocumentDto,
  fetchDashboardRecent,
  fetchDashboardSummary,
  DashboardSummaryDto,
  getUserIdFromToken,
} from '../lib/api';

export function Dashboard() {
  const { courses, loading } = useCourses();

  const [isNewCourseModalOpen, setIsNewCourseModalOpen] = useState(false);

  const [summary, setSummary] = useState<DashboardSummaryDto | null>(null);
  const [recentDocuments, setRecentDocuments] = useState<DocumentDto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [recentError, setRecentError] = useState<string | null>(null);

  useEffect(() => {
    const userId = getUserIdFromToken();
    if (!userId) {
      setSummaryError("Please sign in to view your dashboard summary.");
      setRecentError("Please sign in to see recent documents.");
      return;
    }

    setSummaryError(null);
    setRecentError(null);

    fetchDashboardSummary(userId)
      .then(setSummary)
      .catch((err) => {
        console.error("Failed to fetch dashboard summary:", err);
        setSummaryError("Couldn't load summary stats. Showing data from your local courses instead.");
      });

    fetchDashboardRecent(userId, undefined, 5)
      .then((data) => setRecentDocuments(data.recentDocuments ?? []))
      .catch((err) => {
        console.error("Failed to fetch recent documents:", err);
        setRecentError("Couldn't load recent documents.");
        setRecentDocuments([]);
      });
  }, []);

  const activeCourses = summary?.activeCourses ?? courses.length;
  const studyMaterials = summary?.studyMaterials ?? courses.reduce((sum, c) => sum + (c.materialsCount ?? 0), 0);
  const generatedAids = summary?.generatedAids ?? courses.reduce((sum, c) => sum + (c.aidsCount ?? 0), 0);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-muted animate-pulse" />
          <div className="h-10 w-64 bg-muted/50 rounded-lg animate-pulse" />
          <div className="h-6 w-80 bg-muted/40 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  {/* State When Course is Empty*/}
  if (courses.length === 0) {
    return (
      <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh',
          textAlign: 'center',
          width: '100%',
          padding: '3rem 2rem',
        }}
      >
        <h2
          style={{
            fontSize: '2.25rem',
            fontWeight: 700,
            marginBottom: '1rem',
          }}
        >
          No Courses Yet
        </h2>

        <p
          style={{
            fontSize: '1.125rem',
            color: 'var(--muted-foreground, #6b7280)',
            maxWidth: '480px',
            width: '100%',
            marginBottom: '2.5rem',
            lineHeight: 1.7,
          }}
        >
          Create your first course to unlock personalized study materials,
          AI-generated flashcards, summaries, quizzes, and more.
        </p>

        <button
          onClick={() => {
            setIsNewCourseModalOpen(true);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 2rem',
            backgroundColor: 'var(--primary, #2563eb)',
            color: 'var(--primary-foreground, #ffffff)',
            borderRadius: '0.75rem',
            fontSize: '1.125rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 24px rgba(37,99,235,0.25)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 32px rgba(37,99,235,0.35)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 24px rgba(37,99,235,0.25)';
          }}
        >
          <Plus style={{ width: '1.5rem', height: '1.5rem' }} strokeWidth={2} />
          <span>Add Your First Course</span>
        </button>

        <div
          style={{
            marginTop: '2rem',
            display: 'flex',
            gap: '2rem',
            fontSize: '0.875rem',
            color: 'var(--muted-foreground, #6b7280)',
          }}
        >
          <span>• Quick setup</span>
          <span>• Start generating aids instantly</span>
        </div>
      </div>

      <NewCourseModal
        isOpen={isNewCourseModalOpen}
        onClose={() => setIsNewCourseModalOpen(false)}
      />
    </>
    );
  }

  {/* For Everything else, theres mastercard*/}
  return (
    <div className="space-y-8 md:space-y-10">
      {(summaryError || recentError) && (
        <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-sm">
          <div className="flex items-start gap-3">
            <div className="text-yellow-600 dark:text-yellow-400 mt-0.5">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div className="flex-1">
              {summaryError && <p>{summaryError}</p>}
              {recentError && <p>{recentError}</p>}
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-primary hover:underline text-sm font-medium flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                Try refreshing
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        {[
          { value: activeCourses, label: "Active Courses" },
          { value: studyMaterials, label: "Study Materials" },
          { value: generatedAids, label: "Generated Aids" },
        ].map((stat, i) => (
          <div
            key={i}
            className={`
              relative p-5 md:p-6 bg-card border border-border rounded-xl
              shadow-lg hover:shadow-primary/30 transition-all duration-500
              group overflow-hidden
              ${i === 0 ? 'ring-1 ring-primary/20' : ''}
            `}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse pointer-events-none" />
            <div className="relative z-10">
              <div className="text-3xl md:text-4xl font-bold mb-1 text-foreground">
                {stat.value}
              </div>
              <div className="text-sm md:text-base text-muted-foreground font-medium">
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Courses grid */}
      <div className="mt-6">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-lg md:text-xl font-semibold shrink-0">Your Courses</h2>
          <div className="relative" style={{ width: 'calc(2 * 280px + 1.5rem)', maxWidth: '100%' }}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground"
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
                <div
                  key={course.id}
                  className="
                    relative rounded-xl overflow-hidden transition-all duration-500
                    hover:shadow-2xl hover:shadow-primary/25 hover:-translate-y-1
                    group
                  "
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none" />
                  <CourseCard course={course} />
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      <section>
        <h2 className="text-xl md:text-2xl font-semibold mb-5 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent inline-block">
          Recent Documents
        </h2>

        {recentError ? (
          <div className="bg-muted/40 border rounded-xl p-6 text-center text-muted-foreground">
            <p className="mb-2">{recentError}</p>
            <p className="text-sm">Documents will appear here once uploaded.</p>
          </div>
        ) : recentDocuments.length === 0 ? (
          <div className="bg-muted/40 border rounded-xl p-6 text-center text-muted-foreground">
            No documents uploaded yet.
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl divide-y divide-border shadow-md hover:shadow-lg transition-shadow duration-500">
            {recentDocuments.map((doc) => (
              <div
                key={doc.documentId}
                className="p-4 md:p-5 hover:bg-muted/50 transition-colors duration-300 group relative"
              >
                <div className="absolute inset-y-0 left-0 w-1 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="font-medium truncate">{doc.originalFilename}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {new Date(doc.uploadedAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <NewCourseModal
        isOpen={isNewCourseModalOpen}
        onClose={() => setIsNewCourseModalOpen(false)}
      />
    </div>
  );
}