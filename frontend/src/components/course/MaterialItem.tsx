import { FileText, Download, Eye, Film, Trash2 } from 'lucide-react';
import { Material } from '../../lib/mockData';
import { Button } from '../ui/button';

interface MaterialItemProps {
  material: Material;
  onView?: (material: Material) => void;
  onDelete?: (material: Material) => void;
}

export function MaterialItem({ material, onView, onDelete }: MaterialItemProps) {
  const materialIcons = {
    pdf: FileText,
    video: Film,
    doc: Eye,
    slides: Download,
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
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onView?.(material)}
        >
          View
        </Button>
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(material)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
