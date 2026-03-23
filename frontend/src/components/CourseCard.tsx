import { useRef } from 'react';
import { Clock, FileText, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Course } from '../lib/mockData';

interface CourseCardProps {
  course: Course;
  index?: number;
}

const colorMap = {
  indigo: { bar: '#6366f1', barBg: 'rgba(99,102,241,0.15)',  glow: 'rgba(99,102,241,0.25)' },
  teal:   { bar: '#14b8a6', barBg: 'rgba(20,184,166,0.15)',  glow: 'rgba(20,184,166,0.25)' },
  blue:   { bar: '#3b82f6', barBg: 'rgba(59,130,246,0.15)',  glow: 'rgba(59,130,246,0.25)' },
  purple: { bar: '#a855f7', barBg: 'rgba(168,85,247,0.15)', glow: 'rgba(168,85,247,0.25)' },
};

export function CourseCard({ course, index = 0 }: CourseCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const colors = colorMap[course.color as keyof typeof colorMap] ?? colorMap.indigo;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / rect.height) * -12;
    const rotateY = ((x - rect.width  / 2) / rect.width)  *  12;
    card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    card.style.boxShadow = `0 20px 48px ${colors.glow}`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg) scale(1)';
    card.style.boxShadow = '0 1px 4px rgba(0,0,0,0.12)';
  };

  const pct = Math.min(100, Math.max(0, course.progress ?? 0));

  return (
    <>
      <style>{`
        @keyframes cardEntrance {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)     scale(1);    }
        }
        @keyframes growWidth {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>

      <Link
        to={`/course/${course.id}`}
        className="block h-full"
        style={{
          animation: 'cardEntrance 0.4s ease both',
          animationDelay: `${index * 70}ms`,
        }}
      >
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '0.75rem',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
            willChange: 'transform',
          }}
        >
          {/* Top accent bar that reflects actual progress*/}
          <div style={{
            height: '4px',
            borderRadius: '9999px',
            backgroundColor: colors.barBg,
            marginBottom: '1.25rem',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${pct}%`,
              borderRadius: '9999px',
              backgroundColor: colors.bar,
              transformOrigin: 'left center',
              animation: 'growWidth 0.7s cubic-bezier(0.4,0,0.2,1) both',
              animationDelay: `${index * 70 + 200}ms`,
            }} />
          </div>

          {/* Course name */}
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 600,
            marginBottom: '1rem',
            color: 'var(--foreground)',
            lineHeight: 1.4,
          }}>
            {course.name}
          </h3>

          {/* Stats */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            fontSize: '0.875rem',
            color: 'var(--muted-foreground, #6b7280)',
            flex: 1,
            marginBottom: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText style={{ width: '1rem', height: '1rem', flexShrink: 0 }} />
              <span>{course.materialsCount} materials</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 style={{ width: '1rem', height: '1rem', flexShrink: 0 }} />
              <span>Completed {course.completedCount} tasks</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock style={{ width: '1rem', height: '1rem', flexShrink: 0 }} />
              <span>Updated {course.lastUpdated}</span>
            </div>
          </div>

          {/* Progress footer */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <div style={{
              fontSize: '0.75rem',
              color: 'var(--muted-foreground, #6b7280)',
              marginBottom: '0.5rem',
            }}>
              Progress
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                flex: 1,
                height: '6px',
                borderRadius: '9999px',
                backgroundColor: colors.barBg,
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${pct}%`,
                  borderRadius: '9999px',
                  backgroundColor: colors.bar,
                  transformOrigin: 'left center',
                  animation: 'growWidth 0.7s cubic-bezier(0.4,0,0.2,1) both',
                  animationDelay: `${index * 70 + 300}ms`,
                }} />
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, minWidth: '2.5rem', textAlign: 'right' }}>
                {pct}%
              </span>
            </div>
          </div>
        </div>
      </Link>
    </>
  );
}