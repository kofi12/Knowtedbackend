import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Brain, Calendar, ClipboardList, FileText, Upload, Pencil, Trash2, Loader2, Library, ShieldAlert } from 'lucide-react';
import { Material } from '../lib/mockData';
import { useCourses } from '../lib/CoursesContext';
import { GenerateModal, GenerateType } from '../components/GenerateModal';
import { FlashcardViewer } from '../components/FlashcardViewer';
import { QuizViewer } from '../components/QuizViewer';
import { EditCourseModal } from '../components/EditCourseModal';
import { DeleteCourseModal } from '../components/DeleteCourseModal';
import { DeleteMaterialModal } from '../components/course/DeleteMaterialModal';
import { Tabs } from '../components/ui/TabsWrapper';
import { MaterialItem } from '../components/course/MaterialItem';
import { GenerateAidButton } from '../components/course/GenerateAidButton';
import { Button } from '../components/ui/button';
import {
  CourseDocumentResponseDto,
  FlashcardDeckResponseDto,
  QuizResponseDto,
  deleteDocument,
  fetchCourseDocuments,
  getDocumentPresignedUrl,
  uploadCourseDocument,
  listFlashcardDecks,
  getFlashcardDeck,
  deleteFlashcardDeck,
  listQuizzes,
  getQuiz,
  deleteQuiz,
} from '../lib/api';

export function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { courses, updateCourse, deleteCourse } = useCourses();

  const [activeTab, setActiveTab] = useState<'materials' | 'aids'>('materials');
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [generateType, setGenerateType] = useState<GenerateType>('quiz');
  const [flashcardViewerOpen, setFlashcardViewerOpen] = useState(false);
  const [viewingDeck, setViewingDeck] = useState<FlashcardDeckResponseDto | null>(null);
  const [quizViewerOpen, setQuizViewerOpen] = useState(false);
  const [viewingQuiz, setViewingQuiz] = useState<QuizResponseDto | null>(null);

  const [editCourseModalOpen, setEditCourseModalOpen] = useState(false);
  const [deleteCourseModalOpen, setDeleteCourseModalOpen] = useState(false);
  const [isDeletingCourse, setIsDeletingCourse] = useState(false);

  const [deleteMaterialModalOpen, setDeleteMaterialModalOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);
  const [isDeletingMaterial, setIsDeletingMaterial] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFilesPreview, setSelectedFilesPreview] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [materialError, setMaterialError] = useState<string | null>(null);

  // Flashcard deck state
  const [flashcardDecks, setFlashcardDecks] = useState<FlashcardDeckResponseDto[]>([]);
  const [loadingDecks, setLoadingDecks] = useState(false);
  const [decksError, setDecksError] = useState<string | null>(null);
  const [deletingDeckId, setDeletingDeckId] = useState<string | null>(null);

  // Quiz state
  const [quizzesMCQ, setQuizzesMCQ] = useState<QuizResponseDto[]>([]);
  const [quizzesMulti, setQuizzesMulti] = useState<QuizResponseDto[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null);

  const course = courses.find(c => c.id === courseId);
  const [courseMaterials, setCourseMaterials] = useState<Material[]>([]);

  const inferMaterialType = (contentType: string, fileName: string): Material['type'] => {
    const lowerType = (contentType || '').toLowerCase();
    const lowerName = fileName.toLowerCase();
    if (lowerType.includes('pdf') || lowerName.endsWith('.pdf')) return 'pdf';
    if (lowerType.startsWith('video/')) return 'video';
    if (lowerType.includes('word') || lowerType.includes('document') || lowerName.endsWith('.doc') || lowerName.endsWith('.docx')) {
      return 'doc';
    }
    return 'slides';
  };

  const formatUploadedAt = (isoDate: string): string => {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return 'Unknown date';
    return date.toLocaleDateString();
  };

  const mapDocumentToMaterial = (document: CourseDocumentResponseDto): Material => ({
    id: document.documentId,
    courseId: document.courseId,
    name: document.originalFilename,
    type: inferMaterialType(document.contentType, document.originalFilename),
    uploadedAt: formatUploadedAt(document.uploadedAt),
  });

  const loadCourseMaterials = async () => {
    if (!courseId) return;
    setLoadingMaterials(true);
    setMaterialError(null);
    try {
      const documents = await fetchCourseDocuments(courseId);
      setCourseMaterials(documents.map(mapDocumentToMaterial));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load course documents.';
      setMaterialError(message);
      setCourseMaterials([]);
    } finally {
      setLoadingMaterials(false);
    }
  };

  const loadFlashcardDecks = async () => {
    if (!courseId) return;
    setLoadingDecks(true);
    setDecksError(null);
    try {
      const decks = await listFlashcardDecks(courseId);
      setFlashcardDecks(decks);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load flashcard decks.';
      setDecksError(message);
      setFlashcardDecks([]);
    } finally {
      setLoadingDecks(false);
    }
  };

  const loadQuizzes = async () => {
    if (!courseId) return;
    setLoadingQuizzes(true);
    setQuizError(null);
    try {
      const all = await listQuizzes(courseId);
      setQuizzesMCQ(all.filter(q => q.questionType === 'MCQ'));
      setQuizzesMulti(all.filter(q => q.questionType === 'MCQ_MULTI'));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load quizzes.';
      setQuizError(message);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  useEffect(() => {
    loadCourseMaterials();
    loadFlashcardDecks();
    loadQuizzes();
  }, [courseId]);

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Course not found</h2>
          <p className="text-muted-foreground">The course you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const openFileDialog = () => { fileInputRef.current?.click(); };

  const processFiles = async (files: FileList | null) => {
    if (!courseId || !files || files.length === 0) return;
    const selectedFiles = Array.from(files);
    setSelectedFilesPreview(selectedFiles.map((file) => file.name));
    setIsUploading(true);
    setMaterialError(null);
    try {
      await Promise.all(selectedFiles.map((file) => uploadCourseDocument(courseId, file)));
      await loadCourseMaterials();
      setSelectedFilesPreview([]);
    } catch (err) {
      setMaterialError(err instanceof Error ? err.message : 'Failed to upload one or more files.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await processFiles(e.target.files);
    e.target.value = '';
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); };
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); await processFiles(e.dataTransfer.files); };

  const handleGenerate = (type: GenerateType) => {
    setGenerateType(type);
    setGenerateModalOpen(true);
  };

  const handleFlashcardsGenerated = (deck: FlashcardDeckResponseDto) => {
    setFlashcardDecks(prev => [deck, ...prev]);
    setViewingDeck(deck);
    setFlashcardViewerOpen(true);
  };

  const handleQuizGenerated = (quiz: QuizResponseDto) => {
    if (quiz.questionType === 'MCQ_MULTI') {
      setQuizzesMulti(prev => [quiz, ...prev]);
    } else {
      setQuizzesMCQ(prev => [quiz, ...prev]);
    }
    setViewingQuiz(quiz);
    setQuizViewerOpen(true);
  };

  const handleOpenDeck = async (deckId: string) => {
    try {
      const fullDeck = await getFlashcardDeck(deckId);
      setViewingDeck(fullDeck);
      setFlashcardViewerOpen(true);
    } catch (err) {
      setDecksError(err instanceof Error ? err.message : 'Failed to load flashcard deck.');
    }
  };

  const handleOpenQuiz = async (quizId: string) => {
    try {
      const fullQuiz = await getQuiz(quizId);
      setViewingQuiz(fullQuiz);
      setQuizViewerOpen(true);
    } catch (err) {
      setQuizError(err instanceof Error ? err.message : 'Failed to load quiz.');
    }
  };

  const handleDeleteDeck = async (deckId: string) => {
    setDeletingDeckId(deckId);
    try {
      await deleteFlashcardDeck(deckId);
      setFlashcardDecks(prev => prev.filter(d => d.deckId !== deckId));
    } catch (err) {
      setDecksError(err instanceof Error ? err.message : 'Failed to delete flashcard deck.');
    } finally {
      setDeletingDeckId(null);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    setDeletingQuizId(quizId);
    try {
      await deleteQuiz(quizId);
      setQuizzesMCQ(prev => prev.filter(q => q.quizId !== quizId));
      setQuizzesMulti(prev => prev.filter(q => q.quizId !== quizId));
    } catch (err) {
      setQuizError(err instanceof Error ? err.message : 'Failed to delete quiz.');
    } finally {
      setDeletingQuizId(null);
    }
  };

  const handleEditCourseSave = async (id: string, updates: { name: string; semester: 'Winter' | 'Summer' | 'Fall'; year: number; color: string }) => {
    try { await updateCourse(id, updates); } catch (err) { alert(err instanceof Error ? err.message : 'Failed to update course.'); }
  };
  const handleConfirmDeleteCourse = async (id: string) => {
    setIsDeletingCourse(true);
    try { await deleteCourse(id); navigate('/'); } catch (err) { alert(err instanceof Error ? err.message : 'Failed to delete course.'); } finally { setIsDeletingCourse(false); }
  };
  const handleDeleteMaterial = (material: Material) => { setMaterialToDelete(material); setDeleteMaterialModalOpen(true); };
  const handleViewMaterial = async (material: Material) => {
    try { const url = await getDocumentPresignedUrl(material.id); window.open(url.presignedUrl, '_blank', 'noopener,noreferrer'); } catch (err) { setMaterialError(err instanceof Error ? err.message : 'Failed to open document.'); }
  };
  const handleConfirmDeleteMaterial = async (materialId: string) => {
    setIsDeletingMaterial(true);
    try { await deleteDocument(materialId); setCourseMaterials(prev => prev.filter(m => m.id !== materialId)); setDeleteMaterialModalOpen(false); setMaterialToDelete(null); } catch (err) { setMaterialError(err instanceof Error ? err.message : 'Failed to delete document.'); } finally { setIsDeletingMaterial(false); }
  };

  // ── Render quiz bank section ──
  const renderQuizBank = (title: string, quizzes: QuizResponseDto[], color: string, icon: React.ReactNode, emptyGenType: GenerateType) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg bg-${color}-500/10 flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground">
            {quizzes.length} {quizzes.length === 1 ? 'quiz' : 'quizzes'} saved
          </p>
        </div>
      </div>

      {!loadingQuizzes && quizzes.length === 0 && (
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
          <ClipboardList className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium mb-1">No quizzes yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Generate a quiz from your course documents.
          </p>
          <Button variant="outline" size="sm" onClick={() => handleGenerate(emptyGenType)}>
            Generate Quiz
          </Button>
        </div>
      )}

      {!loadingQuizzes && quizzes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map(quiz => (
            <div
              key={quiz.quizId}
              className={`p-5 bg-card border border-border rounded-xl hover:shadow-md hover:border-${color}-500/30 transition-all group cursor-pointer`}
              onClick={() => handleOpenQuiz(quiz.quizId)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg bg-${color}-500/10 flex items-center justify-center`}>
                  {icon}
                </div>
                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-destructive/10 rounded-lg text-destructive"
                  onClick={(e) => { e.stopPropagation(); handleDeleteQuiz(quiz.quizId); }}
                  disabled={deletingQuizId === quiz.quizId}
                >
                  {deletingQuizId === quiz.quizId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
              <h4 className="font-medium mb-1">{quiz.title}</h4>
              <p className="text-sm text-muted-foreground">{quiz.questions.length} questions</p>
              <p className="text-xs text-muted-foreground mt-1">{new Date(quiz.createdAt).toLocaleDateString()}</p>
              <div className="mt-3 pt-3 border-t border-border">
                <span className={`text-xs font-medium text-${color}-600 dark:text-${color}-400 group-hover:underline`}>
                  Click to attempt
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const tabs = [
    {
      id: 'materials',
      label: 'Course Materials',
      content: (
        <div className="space-y-6">
          <div
            onClick={openFileDialog}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}
          >
            <Upload className={`mx-auto h-10 w-10 mb-3 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
            <p className="font-medium">{isDragOver ? 'Drop files here' : 'Click or drag & drop to select materials'}</p>
            <p className="text-sm text-muted-foreground mt-1">PDF, DOCX supported</p>
          </div>
          {selectedFilesPreview.length > 0 && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">Selected files:</p>
              <ul className="text-sm space-y-1">
                {selectedFilesPreview.map((name, i) => (<li key={i} className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />{name}</li>))}
              </ul>
              {isUploading && <p className="text-xs text-muted-foreground mt-2 italic">Uploading...</p>}
            </div>
          )}
          {materialError && <p className="text-sm text-destructive">{materialError}</p>}
          {loadingMaterials && <p className="text-sm text-muted-foreground">Loading materials...</p>}
          {courseMaterials.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Uploaded Materials</h3>
              <div className="space-y-2">
                {courseMaterials.map(material => (<MaterialItem key={material.id} material={material} onView={handleViewMaterial} onDelete={handleDeleteMaterial} />))}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'aids',
      label: 'Study Aids',
      content: (
        <div className="space-y-8">
          {/* Generate buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <GenerateAidButton icon={ClipboardList} title="Generate MC Quiz" description="Multiple choice questions" color="indigo" onClick={() => handleGenerate('quiz')} />
            <GenerateAidButton icon={ShieldAlert} title="Generate MC Quiz (Difficult)" description="Multi-select answers" color="indigo" onClick={() => handleGenerate('quiz_multi')} />
            <GenerateAidButton icon={Brain} title="Generate Flashcards" description="Review key concepts" color="teal" onClick={() => handleGenerate('flashcards')} />
            <GenerateAidButton icon={BookOpen} title="Generate Study Guide" description="Comprehensive overview" color="blue" onClick={() => handleGenerate('guide')} />
            <GenerateAidButton icon={Calendar} title="Generate Schedule" description="Plan your study time" color="purple" onClick={() => handleGenerate('schedule')} />
          </div>

          {quizError && <p className="text-sm text-destructive">{quizError}</p>}
          {loadingQuizzes && (
            <div className="flex items-center gap-2 py-4 justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Loading quizzes...</span>
            </div>
          )}

          {/* MC Quiz Bank */}
          {renderQuizBank(
            'Multiple Choice Bank',
            quizzesMCQ,
            'indigo',
            <ClipboardList className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
            'quiz'
          )}

          {/* MC Multi-Select Quiz Bank */}
          {renderQuizBank(
            'Multiple Choice Bank (Difficult)',
            quizzesMulti,
            'orange',
            <ShieldAlert className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
            'quiz_multi'
          )}

          {/* Flashcard Bank */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-500/10 flex items-center justify-center">
                <Library className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Flashcard Bank</h3>
                <p className="text-sm text-muted-foreground">
                  {flashcardDecks.length} {flashcardDecks.length === 1 ? 'deck' : 'decks'} saved
                </p>
              </div>
            </div>

            {decksError && <p className="text-sm text-destructive">{decksError}</p>}

            {loadingDecks && (
              <div className="flex items-center gap-2 py-8 justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Loading flashcard decks...</span>
              </div>
            )}

            {!loadingDecks && flashcardDecks.length === 0 && (
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                <Brain className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium mb-1">No flashcard decks yet</p>
                <p className="text-sm text-muted-foreground mb-4">Click "Generate Flashcards" above to create your first deck.</p>
                <Button variant="outline" size="sm" onClick={() => handleGenerate('flashcards')} className="border-teal-500/30 text-teal-600 hover:bg-teal-500/10">
                  <Brain className="w-4 h-4 mr-2" />Generate Flashcards
                </Button>
              </div>
            )}

            {!loadingDecks && flashcardDecks.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {flashcardDecks.map(deck => (
                  <div key={deck.deckId} className="p-5 bg-card border border-border rounded-xl hover:shadow-md hover:border-teal-500/30 transition-all group cursor-pointer" onClick={() => handleOpenDeck(deck.deckId)}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                        <Brain className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div className="flex items-center gap-1">
                        {deck.generationStatus === 'PENDING' && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                        {deck.generationStatus === 'FAILED' && <span className="text-xs text-destructive font-medium">Failed</span>}
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-destructive/10 rounded-lg text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteDeck(deck.deckId); }} disabled={deletingDeckId === deck.deckId}>
                          {deletingDeckId === deck.deckId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <h4 className="font-medium mb-1">{deck.title}</h4>
                    <p className="text-sm text-muted-foreground">{deck.flashcards.length} cards</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(deck.createdAt).toLocaleDateString()}</p>
                    <div className="mt-3 pt-3 border-t border-border">
                      <span className="text-xs font-medium text-teal-600 dark:text-teal-400 group-hover:underline">Click to practice</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{course.name}</h1>
            <div className="flex flex-wrap gap-3 md:gap-6 text-xs md:text-sm text-muted-foreground">
              <span>{course.semester} {course.year}</span>
              <span>{courseMaterials.length} materials</span>
              <span>{flashcardDecks.length + quizzesMCQ.length + quizzesMulti.length} study aids</span>
              <span className="hidden sm:inline">Updated {course.lastUpdated}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditCourseModalOpen(true)}>
              <Pencil className="h-4 w-4 mr-1" />Edit
            </Button>
            <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => setDeleteCourseModalOpen(true)}>
              <Trash2 className="h-4 w-4 mr-1" />Delete
            </Button>
          </div>
        </div>
      </div>
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={(tabId) => setActiveTab(tabId as 'materials' | 'aids')} />
      <GenerateModal
        isOpen={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        courseId={courseId!}
        type={generateType}
        materials={courseMaterials}
        onFlashcardsGenerated={handleFlashcardsGenerated}
        onQuizGenerated={handleQuizGenerated}
      />
      <FlashcardViewer
        isOpen={flashcardViewerOpen}
        onClose={() => { setFlashcardViewerOpen(false); setViewingDeck(null); }}
        deck={viewingDeck}
      />
      <QuizViewer
        isOpen={quizViewerOpen}
        onClose={() => { setQuizViewerOpen(false); setViewingQuiz(null); }}
        quiz={viewingQuiz}
      />
      <EditCourseModal isOpen={editCourseModalOpen} onClose={() => setEditCourseModalOpen(false)} course={course} onSave={handleEditCourseSave} />
      <DeleteCourseModal isOpen={deleteCourseModalOpen} onClose={() => setDeleteCourseModalOpen(false)} course={course} onConfirmDelete={handleConfirmDeleteCourse} isDeleting={isDeletingCourse} />
      <DeleteMaterialModal isOpen={deleteMaterialModalOpen} onClose={() => { setDeleteMaterialModalOpen(false); setMaterialToDelete(null); }} material={materialToDelete} onConfirmDelete={handleConfirmDeleteMaterial} isDeleting={isDeletingMaterial} />
      <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".pdf,.docx,.txt" multiple className="hidden" />
    </div>
  );
}
