import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { BookOpen, Brain, Calendar, ClipboardList, FileText, Upload, Pencil, Trash2 } from 'lucide-react';
import { mockMaterials, mockAids, Material, Course } from '../lib/mockData';
import { useCourses } from '../lib/CoursesContext';
import { GenerateModal } from '../components/GenerateModal';
import { FlashcardViewer } from '../components/FlashcardViewer';
import { DeleteMaterialModal } from '../components/course/DeleteMaterialModal';
import { EditCourseModal } from '../components/EditCourseModal';
import { DeleteCourseModal } from '../components/DeleteCourseModal';
import { Tabs } from '../components/ui/TabsWrapper';
import { MaterialItem } from '../components/course/MaterialItem';
import { AidCard } from '../components/course/AidCard';
import { GenerateAidButton } from '../components/course/GenerateAidButton';
import { UploadArea } from '../components/course/UploadArea';
import { Button } from '../components/ui/button';

type AidType = 'quiz' | 'flashcards' | 'guide' | 'schedule';

export function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { courses, updateCourse, deleteCourse } = useCourses();

  const [activeTab, setActiveTab] = useState<'materials' | 'aids'>('materials');
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [generateType, setGenerateType] = useState<AidType>('quiz');
  const [flashcardViewerOpen, setFlashcardViewerOpen] = useState(false);

  // Material delete state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Course edit/delete state
  const [editCourseModalOpen, setEditCourseModalOpen] = useState(false);
  const [deleteCourseModalOpen, setDeleteCourseModalOpen] = useState(false);
  const [isDeletingCourse, setIsDeletingCourse] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFilesPreview, setSelectedFilesPreview] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const course = courses.find(c => c.id === courseId);
  const [courseMaterials, setCourseMaterials] = useState(
    () => mockMaterials.filter(m => m.courseId === courseId)
  );
  const aids = mockAids.filter(a => a.courseId === courseId);

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

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const processFiles = (files: FileList | null) => {
    if (files && files.length > 0) {
      const fileNames = Array.from(files).map(f => f.name);
      setSelectedFilesPreview(fileNames);
      console.log('Files selected (not uploaded):', fileNames);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  const handleGenerate = (type: AidType) => {
    setGenerateType(type);
    setGenerateModalOpen(true);
  };

  const handleAidClick = (aid: typeof aids[0]) => {
    if (aid.type === 'flashcards') {
      setFlashcardViewerOpen(true);
    } else {
      console.log('Opening aid:', aid);
    }
  };

  // Material delete handlers
  const handleDeleteClick = (material: Material) => {
    setMaterialToDelete(material);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (materialId: string) => {
    setIsDeleting(true);
    try {
      // When backend is ready: await deleteDocument(materialId);
      setCourseMaterials(prev => prev.filter(m => m.id !== materialId));
    } catch (error) {
      console.error('Failed to delete material:', error);
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setMaterialToDelete(null);
    }
  };

  // Course edit/delete handlers
  const handleEditCourseSave = (id: string, updates: { name: string; semester: 'Winter' | 'Summer' | 'Fall'; year: number; color: string }) => {
    updateCourse(id, updates);
  };

  const handleConfirmDeleteCourse = async (id: string) => {
    setIsDeletingCourse(true);
    try {
      // When backend is ready: await deleteCourseApi(id);
      deleteCourse(id);
      navigate('/');
    } catch (error) {
      console.error('Failed to delete course:', error);
    } finally {
      setIsDeletingCourse(false);
      setDeleteCourseModalOpen(false);
    }
  };

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
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-primary bg-primary/5'
                : 'border-border hover:bg-muted/50'
            }`}
          >
            <Upload className={`mx-auto h-10 w-10 mb-3 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
            <p className="font-medium">
              {isDragOver ? 'Drop files here' : 'Click or drag & drop to select materials'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              PDF, DOCX supported
            </p>
          </div>

          {selectedFilesPreview.length > 0 && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">Selected files (not saved yet):</p>
              <ul className="text-sm space-y-1">
                {selectedFilesPreview.map((name, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    {name}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground mt-2 italic">
                Upload not implemented yet — files are only selected locally.
              </p>
            </div>
          )}

          {courseMaterials.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Uploaded Materials</h3>
              <div className="space-y-2">
                {courseMaterials.map(material => (
                  <MaterialItem key={material.id} material={material} onView={(m) => console.log('View material:', m)} onDelete={handleDeleteClick} />
                ))}
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
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <GenerateAidButton icon={ClipboardList} title="Generate Quiz" description="Practice with custom questions" color="indigo" onClick={() => handleGenerate('quiz')} />
            <GenerateAidButton icon={Brain} title="Generate Flashcards" description="Review key concepts" color="teal" onClick={() => handleGenerate('flashcards')} />
            <GenerateAidButton icon={BookOpen} title="Generate Study Guide" description="Comprehensive overview" color="blue" onClick={() => handleGenerate('guide')} />
            <GenerateAidButton icon={Calendar} title="Generate Schedule" description="Plan your study time" color="purple" onClick={() => handleGenerate('schedule')} />
          </div>
          {aids.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Your Study Aids</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aids.map(aid => (
                  <AidCard key={aid.id} aid={aid} onClick={handleAidClick} />
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{course.name}</h1>
            <div className="flex flex-wrap gap-3 md:gap-6 text-xs md:text-sm text-muted-foreground">
              <span>{course.semester} {course.year}</span>
              <span>{course.materialsCount} materials</span>
              <span>{course.aidsCount} study aids</span>
              <span className="hidden sm:inline">Updated {course.lastUpdated}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditCourseModalOpen(true)}
            >
              <Pencil className="w-4 h-4 mr-1.5" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => setDeleteCourseModalOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Delete
            </Button>
          </div>
        </div>
      </div>
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={(tabId) => setActiveTab(tabId as 'materials' | 'aids')} />
      <GenerateModal isOpen={generateModalOpen} onClose={() => setGenerateModalOpen(false)} courseId={courseId!} type={generateType} />
      <FlashcardViewer isOpen={flashcardViewerOpen} onClose={() => setFlashcardViewerOpen(false)} />
      <DeleteMaterialModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setMaterialToDelete(null);
        }}
        material={materialToDelete}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={isDeleting}
      />
      <EditCourseModal
        isOpen={editCourseModalOpen}
        onClose={() => setEditCourseModalOpen(false)}
        course={course}
        onSave={handleEditCourseSave}
      />
      <DeleteCourseModal
        isOpen={deleteCourseModalOpen}
        onClose={() => setDeleteCourseModalOpen(false)}
        course={course}
        onConfirmDelete={handleConfirmDeleteCourse}
        isDeleting={isDeletingCourse}
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".pdf,.docx,.txt"
        multiple
        className="hidden"
      />
    </div>
  );
}
