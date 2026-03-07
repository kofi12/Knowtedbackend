import React, { useState } from 'react';
import { Home, Book, Plus, ChevronDown, ChevronRight, Moon, Sun, LogOut, User, X } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { useTheme } from './ThemeProvider';
import { mockCourses } from '../lib/mockData';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onNewCourse: () => void;
  mobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
}

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  onNewCourse,
  mobileMenuOpen = false,
  onMobileMenuClose,
}: SidebarProps) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [coursesExpanded, setCoursesExpanded] = useState(true);

  const isActive = (path: string) => location.pathname === path;

  const handleLinkClick = () => {
    if (onMobileMenuClose) onMobileMenuClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm lg:hidden z-40 transition-opacity duration-300"
          onClick={onMobileMenuClose}
        />
      )}

      <aside
        className={`
          fixed left-2 md:left-4 top-2 md:top-4
          h-[calc(100vh-1rem)] md:h-[calc(100vh-2rem)]
          bg-card border border-border rounded-lg md:rounded-xl
          shadow-sm flex flex-col z-50 overflow-hidden
          transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${isCollapsed ? 'w-16' : 'w-64'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          backgroundColor: theme === 'dark' ? 'hsl(217.2 32.6% 17.5%)' : 'hsl(0 0% 100%)',
        }}
        onMouseEnter={() => !mobileMenuOpen && isCollapsed && onToggleCollapse()}
        onMouseLeave={() => !mobileMenuOpen && !isCollapsed && onToggleCollapse()}
      >
        {/* Mobile close button */}
        {mobileMenuOpen && (
          <button
            onClick={onMobileMenuClose}
            className="absolute top-4 right-4 lg:hidden p-2 hover:bg-muted rounded-lg transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Logo */}
        <div className="h-14 md:h-16 flex items-center px-4 md:px-6 border-b border-border shrink-0 relative">
          <div
            className={`absolute inset-x-4 flex flex-col transition-all duration-300 ${
              isCollapsed ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
            }`}
          >
            <div className="font-bold text-base md:text-lg">Know-ted</div>
            <div className="text-xs text-muted-foreground">Optimize your learning</div>
          </div>

          <div
            className={`mx-auto font-bold text-base md:text-lg transition-all duration-300 ${
              isCollapsed ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
            }`}
          >
            K
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 md:py-6 space-y-1.5 overflow-y-auto">
          {/* Dashboard */}
          <Link
            to="/"
            onClick={handleLinkClick}
            className={`
              group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
              ${isActive('/')
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted hover:scale-[1.02] hover:translate-x-0.5'}
            `}
          >
            <Home className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
            {!isCollapsed && <span className="transition-opacity duration-200">Dashboard</span>}
          </Link>

          {/* Courses */}
          <div>
            <button
              onClick={() => setCoursesExpanded(!coursesExpanded)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                text-muted-foreground hover:text-foreground hover:bg-muted hover:scale-[1.02] hover:translate-x-0.5
              `}
            >
              <Book className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">Courses</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${coursesExpanded ? 'rotate-180' : 'rotate-0'}`}
                  />
                </>
              )}
            </button>

            {/* Animated course list */}
            <div
              className={`
                overflow-hidden transition-all duration-400 ease-out
                ${!isCollapsed && coursesExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
              `}
            >
              <div className="ml-8 mt-2 space-y-1 pb-2">
                {mockCourses.map((course, i) => (
                  <Link
                    key={course.id}
                    to={`/course/${course.id}`}
                    onClick={handleLinkClick}
                    className={`
                      block px-3 py-1.5 text-sm rounded-lg transition-all duration-200
                      ${location.pathname === `/course/${course.id}`
                        ? 'bg-secondary text-secondary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted hover:translate-x-1'}
                    `}
                    style={{
                      transitionDelay: `${i * 30}ms`,
                      opacity: !isCollapsed && coursesExpanded ? 1 : 0,
                      transform: !isCollapsed && coursesExpanded ? 'translateX(0)' : 'translateX(-8px)',
                    }}
                  >
                    {course.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* New Course */}
          <button
            onClick={() => {
              onNewCourse();
              handleLinkClick();
            }}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium
              bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-200
              hover:scale-[1.03] active:scale-95
            `}
          >
            <Plus className="w-5 h-5 shrink-0 transition-transform duration-200 hover:rotate-90" />
            {!isCollapsed && <span>New Course</span>}
          </button>
        </nav>

        {/* User / Footer */}
        <div className="border-t border-border p-3 space-y-1.5 shrink-0">
          <Link
            to="/profile"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-muted hover:scale-[1.02] ${isCollapsed ? 'justify-center' : ''}`}
          >
            <User className="w-5 h-5 shrink-0" />
            {!isCollapsed && (
              <div className="flex-1 min-w-0 transition-opacity duration-300">
                <div className="text-sm font-medium truncate">Alex Student</div>
              </div>
            )}
          </Link>

          <button
            onClick={toggleTheme}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
              text-muted-foreground hover:text-foreground hover:bg-muted hover:scale-[1.02]
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 shrink-0" />
            ) : (
              <Sun className="w-5 h-5 shrink-0" />
            )}
            {!isCollapsed && <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
          </button>

          {/* Logout - more visible: filled red, white text, stronger hover */}
          <button
            className={`
              group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200
              bg-red-600 hover:bg-red-700 active:bg-red-800
              text-white
              shadow-sm hover:shadow-md
              hover:scale-[1.03] active:scale-[0.98]
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            <LogOut className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}