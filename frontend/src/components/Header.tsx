import { Sparkles, ChevronRight, Plus, Menu, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router';

interface HeaderProps {
  title: string;
  breadcrumb?: string;
  showGenerate?: boolean;
  onGenerate?: () => void;
  onNewCourse?: () => void;
  onMenuToggle?: () => void;
}

export function Header({ breadcrumb, showGenerate = false, onGenerate, onNewCourse, onMenuToggle }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="h-14 md:h-16 border-b border-border flex items-center justify-between px-4 md:px-6 lg:px-8">
      <div className="flex items-center gap-2 md:gap-3">
        {/* Mobile menu button */}
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors -ml-2"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        
        {/* Back button - shows when there's a breadcrumb */}
        {breadcrumb && (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-2 md:px-3 py-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden md:inline text-sm">Back</span>
          </button>
        )}

        {breadcrumb && (
          <>
            <span className="text-sm md:text-base text-muted-foreground">{breadcrumb}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </>
        )}
      </div>

      {/* Right: New Course + Generate */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* New Course Button */}
        {onNewCourse && (
          <Button variant="blue" size="icon" onClick={onNewCourse}>
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
        )}

        {/* Generate Button */}
        {showGenerate && (
          <Button onClick={onGenerate} className="text-sm">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Generate</span>
          </Button>
        )}
      </div>
    </header>
  );
}