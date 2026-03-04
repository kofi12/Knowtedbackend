import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { mockFlashcards, Flashcard } from '../lib/mockData';

interface FlashcardViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FlashcardViewer({ isOpen, onClose }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cards, setCards] = useState<Flashcard[]>(mockFlashcards);

  if (!isOpen) return null;

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleMarkKnown = () => {
    setCards(prev =>
      prev.map((card, idx) =>
        idx === currentIndex ? { ...card, known: !card.known } : card
      )
    );
  };

  const knownCount = cards.filter(c => c.known).length;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-white dark:bg-card border border-border rounded-lg md:rounded-xl shadow-lg max-w-4xl w-full p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-semibold">Flashcards</h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Card {currentIndex + 1} of {cards.length} • {knownCount} marked as known
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary rounded-full h-2 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>

        {/* Flashcard */}
        <div className="relative" style={{ perspective: '1000px' }}>
          <div
            className={`relative bg-gradient-to-br from-background to-muted border-2 border-border rounded-xl md:rounded-2xl shadow-lg transition-all duration-500 cursor-pointer`}
            style={{
              minHeight: '280px',
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
            }}
            onClick={handleFlip}
          >
            {/* Front */}
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center p-6 md:p-8 rounded-xl md:rounded-2xl ${
                isFlipped ? 'invisible' : 'visible'
              }`}
              style={{
                backfaceVisibility: 'hidden',
              }}
            >
              <div className="text-xs font-medium text-accent mb-3 md:mb-4 uppercase tracking-wide">
                Question
              </div>
              <div className="text-lg md:text-2xl text-center font-medium">
                {currentCard.question}
              </div>
              <div className="absolute bottom-4 md:bottom-6 text-xs text-muted-foreground">
                Click to reveal answer
              </div>
            </div>

            {/* Back */}
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center p-6 md:p-8 rounded-xl md:rounded-2xl ${
                isFlipped ? 'visible' : 'invisible'
              }`}
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <div className="text-xs font-medium text-primary mb-3 md:mb-4 uppercase tracking-wide">
                Answer
              </div>
              <div className="text-base md:text-lg text-center leading-relaxed">
                {currentCard.answer}
              </div>
              <div className="absolute bottom-4 md:bottom-6 text-xs text-muted-foreground">
                Click to flip back
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
          {/* Previous */}
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* Center controls */}
          <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
            {/* Flip */}
            <button
              onClick={handleFlip}
              className="flex-1 sm:flex-none px-4 md:px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
            >
              Flip Card
            </button>

            {/* Mark Known */}
            <button
              onClick={handleMarkKnown}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-colors text-sm ${
                currentCard.known
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <Check className="w-4 h-4" />
              <span className="hidden sm:inline">{currentCard.known ? 'Known' : 'Mark Known'}</span>
              <span className="sm:hidden">✓</span>
            </button>
          </div>

          {/* Next */}
          <button
            onClick={handleNext}
            disabled={currentIndex === cards.length - 1}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}