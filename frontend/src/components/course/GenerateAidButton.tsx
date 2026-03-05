import React from 'react';
import { LucideIcon } from 'lucide-react';

interface GenerateAidButtonProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: 'indigo' | 'teal' | 'blue' | 'purple';
  onClick: () => void;
}

export function GenerateAidButton({
  icon: Icon,
  title,
  description,
  color,
  onClick,
}: GenerateAidButtonProps) {
  // Base color classes – slightly adjusted opacity for better glow contrast
  const colorStyles = {
    indigo:
      'from-indigo-500/15 to-indigo-500/5 border-indigo-500/30 text-indigo-600 hover:from-indigo-500/30 hover:to-indigo-500/10 hover:border-indigo-500/50 hover:shadow-[0_0_25px_-5px] hover:shadow-indigo-500/40',
    teal:
      'from-teal-500/15 to-teal-500/5 border-teal-500/30 text-teal-600 hover:from-teal-500/30 hover:to-teal-500/10 hover:border-teal-500/50 hover:shadow-[0_0_25px_-5px] hover:shadow-teal-500/40',
    blue:
      'from-blue-500/15 to-blue-500/5 border-blue-500/30 text-blue-600 hover:from-blue-500/30 hover:to-blue-500/10 hover:border-blue-500/50 hover:shadow-[0_0_25px_-5px] hover:shadow-blue-500/40',
    purple:
      'from-purple-500/15 to-purple-500/5 border-purple-500/30 text-purple-600 hover:from-purple-500/30 hover:to-purple-500/10 hover:border-purple-500/50 hover:shadow-[0_0_25px_-5px] hover:shadow-purple-500/40',
  };

  const style = colorStyles[color];

  return (
    <button
      onClick={onClick}
      className={`
        group relative p-6 rounded-xl border bg-gradient-to-br ${style}
        transition-all duration-300 ease-out
        hover:shadow-lg hover:-translate-y-0.5
        active:scale-[0.98]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-${color}-500/50
      `}
    >
      {/* Optional subtle shine overlay on hover */}
      <div
        className={`
          pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent
          opacity-0 group-hover:opacity-100 transition-opacity duration-500
        `}
      />

      <Icon
        className={`
          w-8 h-8 mb-3 transition-all duration-400 ease-out
          group-hover:scale-110 group-hover:rotate-6
        `}
      />

      <h3 className="font-semibold mb-1 text-base transition-colors group-hover:text-${color}-700">
        {title}
      </h3>

      <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">
        {description}
      </p>
    </button>
  );
}