import React, { useState } from 'react';
import { Home, Book, FileText, Plus, ChevronDown, ChevronRight, Moon, Sun, LogOut, User, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useTheme } from './ThemeProvider';
import { useCourses } from '../lib/CoursesContext';
import { logout } from '../lib/api';

interface SidebarProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
  onNewCourse: () => void
  mobileMenuOpen?: boolean
  onMobileMenuClose?: () => void
}

function AnimatedButton({
  children,
  className = "",
  glowColor = "bg-primary/30",
  onClick,
}: any) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = -(y - centerY) / 12
    const rotateY = (x - centerX) / 12

    setPos({ x, y })
    setTilt({ x: rotateX, y: rotateY })
  }

  const handleMouseEnter = () => setHovered(true)

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
    setHovered(false)
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative overflow-hidden ${className}`}
      style={{
        transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1), background-color 0.2s ease, color 0.2s ease'
      }}
    >
      {/* Dynamic Glow */}
      <span
        className={`absolute pointer-events-none w-36 h-36 rounded-full blur-2xl ${glowColor} transition-opacity duration-200`}
        style={{
          transform: `translate(${pos.x - 72}px, ${pos.y - 72}px)`,
          opacity: hovered ? 1 : 0,
        }}
      />

      <div className="relative z-10 flex items-center gap-3 w-full">
        {children}
      </div>
    </div>
  )
}

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  onNewCourse,
  mobileMenuOpen = false,
  onMobileMenuClose,
}: SidebarProps) {

  const location = useLocation()
  const pathname = location.pathname
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { courses } = useCourses()
  const [coursesExpanded, setCoursesExpanded] = useState(true)

  const isLight = theme === 'light'

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
  }, [mobileMenuOpen])

  const isActive = (path: string) => pathname.startsWith(path)

  const handleLinkClick = () => {
    if (onMobileMenuClose) onMobileMenuClose()
  }

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      handleLinkClick()
      navigate('/login?reason=logged-out', { replace: true })
    }
  }

  const baseBtn =
    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.03] active:scale-95 will-change-transform cursor-pointer"

  return (
    <>
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm lg:hidden z-40"
          onClick={onMobileMenuClose}
        />
      )}

      <aside
        className={`
          fixed left-2 md:left-4 top-2 md:top-4
          h-[calc(100vh-1rem)] md:h-[calc(100vh-2rem)]
          bg-gradient-to-b from-card to-muted/20
          border border-border rounded-xl
          shadow-sm flex flex-col z-50
          transition-all duration-500
          ${isCollapsed ? 'w-16' : 'w-64'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        `}
      >

        {mobileMenuOpen && (
          <button
            onClick={onMobileMenuClose}
            className="absolute top-4 right-4 lg:hidden p-2 hover:bg-muted rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="min-h-24 flex items-center px-4 border-b border-border shrink-0">
          {!isCollapsed ? (
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-lg md:text-xl">Know-ted</span>
              <span className="text-xs text-muted-foreground">Optimize your learning</span>
            </div>
          ) : (
            <div className="mx-auto font-bold text-xl">K</div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">

          <AnimatedButton className={`${baseBtn} text-muted-foreground hover:text-foreground`}>
            <Link
              to="/"
              onClick={handleLinkClick}
              className={`flex items-center gap-3 w-full ${isActive('/') ? 'text-primary' : ''}`}
            >
              <Home className="w-5 h-5" />
              {!isCollapsed && <span>Dashboard</span>}
            </Link>
          </AnimatedButton>

          {/* Document Bank */}
          <Link
            to="/documents"
            onClick={handleLinkClick}
            className={`
              group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
              ${isActive('/documents')
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted hover:scale-[1.02] hover:translate-x-0.5'}
            `}
          >
            <FileText className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
            {!isCollapsed && <span className="transition-opacity duration-200">Document Bank</span>}
          </Link>

          {/* Courses */}
          <AnimatedButton
            className={`${baseBtn} text-muted-foreground hover:text-foreground`}
            onClick={() => setCoursesExpanded(!coursesExpanded)}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <Book className="w-5 h-5" />
                {!isCollapsed && <span>Courses</span>}
              </div>
              {!isCollapsed && (
                <ChevronDown className={`w-4 h-4 transition-transform ${coursesExpanded ? 'rotate-180' : ''}`} />
              )}
            </div>
          </AnimatedButton>

          <div
            className="overflow-hidden transition-all duration-300"
            style={{
              maxHeight: !isCollapsed && coursesExpanded ? '400px' : '0px'
            }}
          >
            <div className="ml-8 mt-2 space-y-1 pb-2">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  to={`/course/${course.id}`}
                  onClick={handleLinkClick}
                  className={`block px-3 py-1.5 text-sm rounded-lg transition-all ${
                    pathname.startsWith(`/course/${course.id}`)
                      ? 'bg-secondary text-secondary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted hover:translate-x-1'
                  }`}
                >
                  {course.name}
                </Link>
              ))}
            </div>
          </div>

          {/* New Course */}
          <AnimatedButton
            className={`${baseBtn} bg-accent text-accent-foreground`}
            onClick={() => { onNewCourse(); handleLinkClick() }}
          >
            <div className="flex items-center gap-3 w-full">
              <Plus className="w-5 h-5" />
              {!isCollapsed && <span>New Course</span>}
            </div>
          </AnimatedButton>

        </nav>

        {/* Bottom */}
        <div className="border-t border-border p-3 space-y-2 shrink-0">

          <AnimatedButton className={`${baseBtn} text-muted-foreground hover:text-foreground`}>
            <Link to="/profile" className="flex items-center gap-3 w-full">
              <User className="w-5 h-5" />
              {!isCollapsed && <span className="text-sm">Profile</span>}
            </Link>
          </AnimatedButton>

          {/* THEME BUTTON */}
          <AnimatedButton
            glowColor={isLight ? "bg-black/40" : "bg-white/40"}
            className={`${baseBtn} text-muted-foreground ${
              isLight
                ? 'hover:bg-neutral-900 hover:text-white'
                : 'hover:bg-white hover:text-black'
            }`}
            onClick={toggleTheme}
          >
            {isLight ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            {!isCollapsed && <span>{isLight ? 'Dark Mode' : 'Light Mode'}</span>}
          </AnimatedButton>

          {/* LOGOUT BUTTON */}
          <AnimatedButton
            glowColor="bg-red-500/50"
            className={`${baseBtn} text-red-400 hover:bg-red-500 hover:text-white`}
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span>Logout</span>}
          </AnimatedButton>

        </div>

      </aside>
    </>
  )
}