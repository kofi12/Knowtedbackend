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
  onClick 
}: GenerateAidButtonProps) {
  const colorClasses = {
    indigo: 'from-indigo-500/10 to-indigo-500/5 border-indigo-500/20 text-indigo-500',
    teal: 'from-teal-500/10 to-teal-500/5 border-teal-500/20 text-teal-500',
    blue: 'from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-500',
    purple: 'from-purple-500/10 to-purple-500/5 border-purple-500/20 text-purple-500',
  };

  const [gradient, iconColor] = colorClasses[color].split(' text-');

  return (
    <button
      onClick={onClick}
      className={`p-6 bg-gradient-to-br ${gradient} border rounded-xl hover:shadow-md transition-all text-left group`}
    >
      <Icon className={`w-8 h-8 text-${iconColor} mb-3 group-hover:scale-110 transition-transform`} />
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">
        {description}
      </p>
    </button>
  );
}