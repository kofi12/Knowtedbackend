import React, { useState } from 'react';
import { Outlet, useLocation, useParams } from 'react-router';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { NewCourseModal } from './NewCourseModal';
import { GenerateModal } from './GenerateModal';
import { mockCourses } from '../lib/mockData';

export function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newCourseModalOpen, setNewCourseModalOpen] = useState(false);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const location = useLocation();

  // Determine header props based on route
  const getHeaderProps = () => {
    if (location.pathname === '/') {
      return { title: 'Dashboard' };
    }

    const courseMatch = location.pathname.match(/^\/course\/(.+)$/);
    if (courseMatch) {
      const courseId = courseMatch[1];
      const course = mockCourses.find(c => c.id === courseId);
      return {
        title: course?.name || 'Course',
        breadcrumb: 'Courses',
        showGenerate: true,
        courseId: courseId,
      };
    }

    return { title: 'Know-ted' };
  };

  const headerProps = getHeaderProps();

  const handleGenerate = () => {
    setGenerateModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background p-2 md:p-4">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onNewCourse={() => setNewCourseModalOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        onMobileMenuClose={() => setMobileMenuOpen(false)}
      />

      <div
        className={`transition-all duration-300 lg:ml-20 ${
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-68'
        }`}
      >
        <div className="bg-card rounded-lg md:rounded-xl shadow-sm border border-border min-h-[calc(100vh-1rem)] md:min-h-[calc(100vh-2rem)]">
          <Header 
            {...headerProps} 
            onGenerate={handleGenerate} 
            onNewCourse={() => setNewCourseModalOpen(true)}
            onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          />

          <main className="p-4 md:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>

      <NewCourseModal
        isOpen={newCourseModalOpen}
        onClose={() => setNewCourseModalOpen(false)}
      />

      {headerProps.courseId && (
        <GenerateModal
          isOpen={generateModalOpen}
          onClose={() => setGenerateModalOpen(false)}
          courseId={headerProps.courseId}
          type="quiz"
        />
      )}
    </div>
  );
}