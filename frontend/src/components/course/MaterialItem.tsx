import { useState } from 'react';
import { FileText, Download, Eye, Trash2, MoreVertical } from 'lucide-react';
import { Material } from '../../lib/mockData';
import { Button } from '../ui/button';

interface MaterialItemProps {
  material: Material;
  onView?: (material: Material) => void;
}

export function MaterialItem({ material, onView }: MaterialItemProps) {
  const materialIcons = {
    pdf: FileText,
    video: Download,
    doc: Eye,
    slides: Trash2,
  };

  const Icon = materialIcons[material.type];

  return (
    <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:shadow-md transition-all">
      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{material.name}</div>
        <div className="text-sm text-muted-foreground">
          Uploaded {material.uploadedAt}
        </div>
      </div>
      <Button 
        variant="secondary" 
        size="sm"
        onClick={() => onView?.(material)}
      >
        View
      </Button>
    </div>
  );
}