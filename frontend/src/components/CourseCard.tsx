import { useRef, useState, useEffect } from 'react';
import { Clock, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Course } from '../lib/mockData';

interface CourseCardProps {
  course: Course;
  index?: number;
}

const colorMap = {
  indigo: {
    bar: '#6366f1',
    glowBase: 'rgba(99,102,241,0.18)',
    glowHover: 'rgba(99,102,241,0.58)',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
  },
  teal: {
    bar: '#14b8a6',
    glowBase: 'rgba(20,184,166,0.18)',
    glowHover: 'rgba(20,184,166,0.58)',
    gradient: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
  },
  blue: {
    bar: '#3b82f6',
    glowBase: 'rgba(59,130,246,0.18)',
    glowHover: 'rgba(59,130,246,0.58)',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
  },
  purple: {
    bar: '#a855f7',
    glowBase: 'rgba(168,85,247,0.18)',
    glowHover: 'rgba(168,85,247,0.58)',
    gradient: 'linear-gradient(135deg, #a855f7 0%, #c084fc 100%)',
  },
};

export function CourseCard({ course, index = 0 }: CourseCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [hovered, setHovered] = useState(false);

  const colors =
    colorMap[course.color as keyof typeof colorMap] ?? colorMap.indigo;

  const pct = Math.min(100, Math.max(0, course.progress ?? 0));

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const parent = el.parentElement;
    if (!parent) return;

    const resize = () => {
      const parentWidth = parent.offsetWidth;
      const textWidth = el.scrollWidth;
      const scale = Math.min(1, parentWidth / textWidth);
      el.style.transform = `scale(${scale})`;
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(parent);

    return () => observer.disconnect();
  }, [course.name]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateX = ((y - rect.height / 2) / rect.height) * -14;
    const rotateY = ((x - rect.width / 2) / rect.width) * 14;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.035)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;

    card.style.transform =
      'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
  };

  return (
    <Link
      to={`/course/${course.id}`}
      className="group block h-full rounded-xl focus:outline-none"
      style={{
        animation: 'cardEntrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        animationDelay: `${index * 80}ms`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative h-full rounded-xl border bg-gradient-to-b from-card to-card/95 backdrop-blur-sm transition-all duration-400 overflow-hidden"
        style={{
          borderColor: hovered ? `${colors.bar}66` : `${colors.bar}30`,
          boxShadow: hovered
            ? `
              0 0 0 1px ${colors.bar}55 inset,
              0 10px 30px -10px ${colors.glowHover},
              0 20px 80px -20px ${colors.glowHover}
            `
            : `
              0 0 0 1px ${colors.bar}25 inset,
              0 8px 25px -10px ${colors.glowBase}
            `,
        }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 transition-all duration-500"
          style={{
            opacity: hovered ? 1 : 0.5,
            background: `radial-gradient(circle at 50% 100%, ${colors.glowHover}, transparent 70%)`,
          }}
        />

        <div className="relative h-2 w-full overflow-hidden">
          <div
            className="h-full origin-left transition-transform duration-700"
            style={{
              transform: `scaleX(${pct / 100})`,
              background: colors.gradient,
            }}
          />
        </div>

        <div className="p-6 pb-7 flex flex-col h-full">
          <h3
            ref={titleRef}
            className="origin-left whitespace-nowrap text-lg font-semibold tracking-tight transition-all duration-300 mb-2"
            style={{
              opacity: hovered ? 0.5 : 1,
            }}
          >
            {course.name}
          </h3>

          <div
            className="flex items-center justify-end mb-6 h-5 transition-all duration-300"
            style={{
              opacity: hovered ? 1 : 0,
              transform: hovered ? 'translateY(0)' : 'translateY(-6px)',
              color: colors.bar,
            }}
          >
            <div className="flex items-center gap-1.5 text-sm font-semibold">
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: colors.gradient }}
              >
                Continue
              </span>
              <ArrowRight className="w-4 h-4 stroke-[2.8]" />
            </div>
          </div>

          <div className="space-y-3 mb-6 flex-1 text-sm text-muted-foreground/90">
            {[
              { icon: FileText, text: `${course.materialsCount ?? 0} materials` },
              { icon: CheckCircle2, text: `Completed ${course.completedCount ?? 0} tasks` },
              { icon: Clock, text: `Updated ${course.lastUpdated}` },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <item.icon
                  className="w-4 h-4"
                  style={{ color: hovered ? colors.bar : 'currentColor' }}
                />
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-border/50">
            <div className="flex items-center justify-between mb-2 text-xs">
              <span>Progress</span>
              <span style={{ color: hovered ? colors.bar : 'inherit' }}>
                {pct}%
              </span>
            </div>

            <div className="h-2.5 bg-muted/25 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: colors.gradient,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}