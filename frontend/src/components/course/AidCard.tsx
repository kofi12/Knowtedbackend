import React from 'react';
import { BookOpen, Brain, Calendar, ClipboardList, Play } from 'lucide-react';
import { Aid } from '../../lib/mockData';

interface AidCardProps {
  aid: Aid;
  onClick?: (aid: Aid) => void;
}

export function AidCard({ aid, onClick }: AidCardProps) {
  const aidIcons = {
    quiz: ClipboardList,
    flashcards: Brain,
    guide: BookOpen,
    schedule: Calendar,
  };

  const Icon = aidIcons[aid.type];

  return (
    <div
      className="p-5 bg-card border border-border rounded-xl hover:shadow-md transition-all group cursor-pointer"
      onClick={() => onClick?.(aid)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-muted rounded-lg">
          <Play className="w-4 h-4" />
        </button>
      </div>
      <h4 className="font-medium mb-1">{aid.name}</h4>
      <p className="text-sm text-muted-foreground capitalize">
        {aid.type} • {aid.createdAt}
      </p>
    </div>
  );
}