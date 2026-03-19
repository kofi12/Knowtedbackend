import { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { Modal, ModalFooter } from './ui/Modal';
import { Input } from './ui/InputField';
import { Button } from './ui/button';
import { Material } from '../lib/mockData';
import { generateFlashcards, FlashcardDeckResponseDto, generateQuiz, QuizResponseDto } from '../lib/api';

export type GenerateType = 'quiz' | 'quiz_multi' | 'flashcards' | 'guide' | 'schedule';

interface GenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  type: GenerateType;
  materials?: Material[];
  onFlashcardsGenerated?: (deck: FlashcardDeckResponseDto) => void;
  onQuizGenerated?: (quiz: QuizResponseDto) => void;
}

const typeLabels: Record<GenerateType, string> = {
  quiz: 'Multiple Choice Quiz',
  quiz_multi: 'Multiple Choice Quiz (Difficult)',
  flashcards: 'Flashcards',
  guide: 'Study Guide',
  schedule: 'Study Schedule',
};

export function GenerateModal({ isOpen, onClose, courseId, type, materials, onFlashcardsGenerated, onQuizGenerated }: GenerateModalProps) {
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const courseMaterials = materials ?? [];
  const isSingleSelect = type === 'flashcards' || type === 'quiz' || type === 'quiz_multi';

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selectedMaterials.length === 0) return;
    setIsGenerating(true);

    try {
      const documentId = selectedMaterials[0];

      if (type === 'flashcards') {
        const deck = await generateFlashcards(courseId, documentId, title || undefined);
        onFlashcardsGenerated?.(deck);
      } else if (type === 'quiz' || type === 'quiz_multi') {
        const questionType = type === 'quiz_multi' ? 'MCQ_MULTI' : 'MCQ';
        const quiz = await generateQuiz(courseId, documentId, questionType, title || undefined);
        onQuizGenerated?.(quiz);
      }

      setSelectedMaterials([]);
      setTitle('');
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed.';
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      setError(null);
      setSelectedMaterials([]);
      setTitle('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Generate ${typeLabels[type]}`} size="lg">
      <form onSubmit={handleGenerate} className="space-y-6">
        {/* Title */}
        <Input
          id="aidTitle"
          label="Title"
          type="text"
          placeholder={`e.g. Chapter 3 key concepts`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Select Material */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">
            Select Document
          </label>
          <p className="text-xs text-muted-foreground">
            Select one document to generate from.
          </p>
          <div className="space-y-1 max-h-56 overflow-y-auto border border-input rounded-lg bg-background/60 backdrop-blur-sm p-3">
            {courseMaterials.length > 0 ? (
              courseMaterials.map(material => (
                <label
                  key={material.id}
                  className="group flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors hover:bg-muted/70 data-[checked=true]:bg-muted/50"
                  data-checked={selectedMaterials.includes(material.id)}
                >
                  <input
                    type="radio"
                    name="generate-material"
                    checked={selectedMaterials.includes(material.id)}
                    onChange={() => setSelectedMaterials([material.id])}
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

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {/* Actions */}
        <ModalFooter className="border-t border-border pt-5">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isGenerating}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={selectedMaterials.length === 0 || isGenerating}
            className="disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-primary/60"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate'
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
