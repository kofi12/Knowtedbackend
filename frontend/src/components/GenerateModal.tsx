import { useState } from 'react';
import { Sparkles, FileText, ListChecks, Lightbulb } from 'lucide-react';
import { Modal, ModalFooter } from './ui/Modal';
import { Input } from './ui/InputField';
import { Button } from './ui/button';
import { mockMaterials } from '../lib/mockData';

interface GenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  type: 'quiz' | 'flashcards' | 'guide' | 'schedule';
}

const typeLabels = {
  quiz: 'Quiz',
  flashcards: 'Flashcards',
  guide: 'Study Guide',
  schedule: 'Study Schedule',
};

export function GenerateModal({ isOpen, onClose, courseId, type }: GenerateModalProps) {
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState('20');

  const courseMaterials = mockMaterials.filter(m => m.courseId === courseId);

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
          <label className="block text-sm font-medium">Select Materials</label>
          <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-lg p-3">
            {courseMaterials.length > 0 ? (
              courseMaterials.map(material => (
                <label
                  key={material.id}
                  className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedMaterials.includes(material.id)}
                    onChange={() => handleToggleMaterial(material.id)}
                    className="w-4 h-4 rounded border-input accent-primary"
                  />
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="flex-1 text-sm">{material.name}</span>
                </label>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No materials available. Upload materials first.
              </p>
            )}
          </div>
        </div>

        {/* Difficulty */}
        {(type === 'quiz' || type === 'flashcards') && (
          <div className="space-y-3">
            <label className="block text-sm font-medium">Difficulty Level</label>
            <div className="flex gap-3">
              {(['easy', 'medium', 'hard'] as const).map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-colors capitalize ${
                    difficulty === level
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-input hover:bg-muted'
                  }`}
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
          />
        )}

        {/* Actions */}
        <ModalFooter className="border-t border-border">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={selectedMaterials.length === 0}
            className="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}