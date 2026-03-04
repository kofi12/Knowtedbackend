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

export function Sidebar({ isCollapsed, onToggleCollapse, onNewCourse, mobileMenuOpen = false, onMobileMenuClose }: SidebarProps) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [coursesExpanded, setCoursesExpanded] = useState(true);

  const isActive = (path: string) => location.pathname === path;

  const handleLinkClick = () => {
    if (onMobileMenuClose) {
      onMobileMenuClose();
    }
  };

  return (
    <aside
      className={`fixed left-2 md:left-4 top-2 md:top-4 h-[calc(100vh-1rem)] md:h-[calc(100vh-2rem)] bg-card border border-border rounded-lg md:rounded-xl shadow-sm transition-all duration-300 flex flex-col z-50 ${
        isCollapsed ? 'w-16' : 'w-64'
      } ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
      style={{
        backgroundColor: theme === 'dark' ? 'hsl(217.2 32.6% 17.5%)' : 'hsl(0 0% 100%)'
      }}
      onMouseEnter={() => isCollapsed && onToggleCollapse()}
      onMouseLeave={() => !isCollapsed && onToggleCollapse()}
    >
      {/* Mobile close button */}
      {mobileMenuOpen && (
        <button
          onClick={onMobileMenuClose}
          className="absolute top-4 right-4 lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Logo */}
      <div className="h-14 md:h-16 flex items-center px-4 md:px-6 border-b border-border">
        {!isCollapsed ? (
          <div>
            <div className="font-bold text-base md:text-lg">Know-ted</div>
            <div className="text-xs text-muted-foreground">Optimize your learning</div>
          </div>
        ) : (
          <div className="font-bold text-base md:text-lg">K</div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 md:py-6 space-y-2 overflow-y-auto">
        {/* Dashboard */}
        <Link
          to="/"
          onClick={handleLinkClick}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            isActive('/')
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          <Home className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>Dashboard</span>}
        </Link>

        {/* Courses */}
        <div>
          <button
            onClick={() => setCoursesExpanded(!coursesExpanded)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <Book className="w-5 h-5 shrink-0" />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left">Courses</span>
                {coursesExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </>
            )}
          </button>

          {/* Course list */}
          {!isCollapsed && coursesExpanded && (
            <div className="ml-8 mt-2 space-y-1">
              {mockCourses.map(course => (
                <Link
                  key={course.id}
                  to={`/course/${course.id}`}
                  onClick={handleLinkClick}
                  className={`block px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    location.pathname === `/course/${course.id}`
                      ? 'bg-secondary text-secondary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {course.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* New Course Button */}
        <button
          onClick={() => {
            onNewCourse();
            handleLinkClick();
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors font-medium"
        >
          <Plus className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>New Course</span>}
        </button>
      </nav>

      {/* User section */}
      <div className="border-t border-border p-3 space-y-2">
        {/* User */}
        <div className={`flex items-center gap-3 px-3 py-2 ${isCollapsed ? 'justify-center' : ''}`}>
          <User className="w-5 h-5 shrink-0 text-muted-foreground" />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">Alex Student</div>
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground ${isCollapsed ? 'justify-center' : ''}`}
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 shrink-0" />
          ) : (
            <Sun className="w-5 h-5 shrink-0" />
          )}
          {!isCollapsed && <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
        </button>

        {/* Logout */}
        <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground ${isCollapsed ? 'justify-center' : ''}`}>
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}