import { useState } from 'react';
import { Sparkles, FileText, ListChecks, Lightbulb } from 'lucide-react';
import { Modal, ModalFooter } from './ui/Modal';
import { Input } from './ui/InputField';
import { Button } from './ui/button';
import { Material, mockMaterials } from '../lib/mockData';

interface GenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  type: 'quiz' | 'flashcards' | 'guide' | 'schedule';
  materials?: Material[];
}

const typeLabels = {
  quiz: 'Quiz',
  flashcards: 'Flashcards',
  guide: 'Study Guide',
  schedule: 'Study Schedule',
};

export function GenerateModal({ isOpen, onClose, courseId, type, materials }: GenerateModalProps) {
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState('20');

  const courseMaterials = materials ?? mockMaterials.filter(m => m.courseId === courseId);

  const handleToggleMaterial = (materialId: string) => {
    setSelectedMaterials(prev =>
      prev.includes(materialId)
        ? prev.filter(id => id !== materialId)
        : [...prev, materialId]
    );
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Generating:', { type, selectedMaterials, difficulty, questionCount });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Generate ${typeLabels[type]}`} size="lg">
      <form onSubmit={handleGenerate} className="space-y-6">
        {/* Select Materials */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">
            Select Materials
          </label>
          <div className="space-y-1 max-h-56 overflow-y-auto border border-input rounded-lg bg-background/60 backdrop-blur-sm p-3">
            {courseMaterials.length > 0 ? (
              courseMaterials.map(material => (
                <label
                  key={material.id}
                  className="group flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors hover:bg-muted/70 data-[checked=true]:bg-muted/50"
                  data-checked={selectedMaterials.includes(material.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedMaterials.includes(material.id)}
                    onChange={() => handleToggleMaterial(material.id)}
                    className="w-4 h-4 rounded border-input accent-primary ring-offset-background focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  />
                  <FileText className="w-4 h-4 text-muted-foreground group-hover:text-foreground/80 transition-colors" />
                  <span className="flex-1 text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors">
                    {material.name}
                  </span>
                </label>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6 italic">
                No materials available. Upload materials first.
              </p>
            )}
          </div>
        </div>

        {/* Difficulty */}
        {(type === 'quiz' || type === 'flashcards') && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['easy', 'medium', 'hard'] as const).map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  className={`
                    px-4 py-2.5 rounded-lg border text-sm font-medium capitalize transition-all
                    ${difficulty === level
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-background border-input text-muted-foreground hover:bg-muted hover:text-foreground hover:border-muted-foreground/70'
                    }
                  `}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Question Count */}
        {(type === 'quiz' || type === 'flashcards') && (
          <Input
            id="questionCount"
            label={`Number of ${type === 'quiz' ? 'Questions' : 'Cards'}`}
            type="number"
            value={questionCount}
            onChange={(e) => setQuestionCount(e.target.value)}
            min="5"
            max="100"
            className="max-w-[180px]"
          />
        )}

        {/* Actions */}
        <ModalFooter className="border-t border-border pt-5">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={selectedMaterials.length === 0}
            className="disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-primary/60"
          >
            Generate
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}