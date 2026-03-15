import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { BookOpen, Brain, Calendar, ClipboardList, FileText, Upload, Pencil, Trash2 } from 'lucide-react';
import { mockAids, Material } from '../lib/mockData';
import { useCourses } from '../lib/CoursesContext';
import { GenerateModal } from '../components/GenerateModal';
import { FlashcardViewer } from '../components/FlashcardViewer';
import { EditCourseModal } from '../components/EditCourseModal';
import { DeleteCourseModal } from '../components/DeleteCourseModal';
import { DeleteMaterialModal } from '../components/course/DeleteMaterialModal';
import { Tabs } from '../components/ui/TabsWrapper';
import { MaterialItem } from '../components/course/MaterialItem';
import { AidCard } from '../components/course/AidCard';
import { GenerateAidButton } from '../components/course/GenerateAidButton';
import { Button } from '../components/ui/button';
import {
  CourseDocumentResponseDto,
  deleteDocument,
  fetchCourseDocuments,
  getDocumentPresignedUrl,
  uploadCourseDocument,
} from '../lib/api';

type AidType = 'quiz' | 'flashcards' | 'guide' | 'schedule';

export function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { courses, updateCourse, deleteCourse } = useCourses();

  const [activeTab, setActiveTab] = useState<'materials' | 'aids'>('materials');
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [generateType, setGenerateType] = useState<AidType>('quiz');
  const [flashcardViewerOpen, setFlashcardViewerOpen] = useState(false);

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

  const course = courses.find(c => c.id === courseId);
  const [courseMaterials, setCourseMaterials] = useState<Material[]>([]);
  const aids: typeof mockAids = [];

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
    } catch {
      setMaterialError('Failed to load course documents.');
      setCourseMaterials([]);
    } finally {
      setLoadingMaterials(false);
    }
  };

  useEffect(() => {
    loadCourseMaterials();
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

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

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
    } catch {
      setMaterialError('Failed to upload one or more files.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await processFiles(e.target.files);
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

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    await processFiles(e.dataTransfer.files);
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

  const handleEditCourseSave = async (id: string, updates: { name: string; semester: 'Winter' | 'Summer' | 'Fall'; year: number; color: string }) => {
    try {
      await updateCourse(id, updates);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update course.';
      alert(message);
    }
  };

  const handleConfirmDeleteCourse = async (id: string) => {
    setIsDeletingCourse(true);
    try {
      await deleteCourse(id);
      navigate('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete course.';
      alert(message);
    } finally {
      setIsDeletingCourse(false);
    }
  };

  const handleDeleteMaterial = (material: Material) => {
    setMaterialToDelete(material);
    setDeleteMaterialModalOpen(true);
  };

  const handleViewMaterial = async (material: Material) => {
    try {
      const url = await getDocumentPresignedUrl(material.id);
      window.open(url.presignedUrl, '_blank', 'noopener,noreferrer');
    } catch {
      setMaterialError('Failed to open document.');
    }
  };

  const handleConfirmDeleteMaterial = async (materialId: string) => {
    setIsDeletingMaterial(true);
    try {
      await deleteDocument(materialId);
      setCourseMaterials(prev => prev.filter(m => m.id !== materialId));
      setDeleteMaterialModalOpen(false);
      setMaterialToDelete(null);
    } catch {
      setMaterialError('Failed to delete document.');
    } finally {
      setIsDeletingMaterial(false);
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
              <p className="text-sm font-medium mb-2">Selected files:</p>
              <ul className="text-sm space-y-1">
                {selectedFilesPreview.map((name, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    {name}
                  </li>
                ))}
              </ul>
              {isUploading && (
                <p className="text-xs text-muted-foreground mt-2 italic">Uploading...</p>
              )}
            </div>
          )}

          {materialError && (
            <p className="text-sm text-destructive">{materialError}</p>
          )}

          {loadingMaterials && (
            <p className="text-sm text-muted-foreground">Loading materials...</p>
          )}

          {courseMaterials.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Uploaded Materials</h3>
              <div className="space-y-2">
                {courseMaterials.map(material => (
                  <MaterialItem
                    key={material.id}
                    material={material}
                    onView={handleViewMaterial}
                    onDelete={handleDeleteMaterial}
                  />
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
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{course.name}</h1>
            <div className="flex flex-wrap gap-3 md:gap-6 text-xs md:text-sm text-muted-foreground">
              <span>{course.semester} {course.year}</span>
              <span>{course.materialsCount} materials</span>
              <span>{course.aidsCount} study aids</span>
              <span className="hidden sm:inline">Updated {course.lastUpdated}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditCourseModalOpen(true)}>
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => setDeleteCourseModalOpen(true)}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </div>
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={(tabId) => setActiveTab(tabId as 'materials' | 'aids')} />
      <GenerateModal isOpen={generateModalOpen} onClose={() => setGenerateModalOpen(false)} courseId={courseId!} type={generateType} materials={courseMaterials} />
      <FlashcardViewer isOpen={flashcardViewerOpen} onClose={() => setFlashcardViewerOpen(false)} />
      <EditCourseModal isOpen={editCourseModalOpen} onClose={() => setEditCourseModalOpen(false)} course={course} onSave={handleEditCourseSave} />
      <DeleteCourseModal isOpen={deleteCourseModalOpen} onClose={() => setDeleteCourseModalOpen(false)} course={course} onConfirmDelete={handleConfirmDeleteCourse} isDeleting={isDeletingCourse} />
      <DeleteMaterialModal isOpen={deleteMaterialModalOpen} onClose={() => { setDeleteMaterialModalOpen(false); setMaterialToDelete(null); }} material={materialToDelete} onConfirmDelete={handleConfirmDeleteMaterial} isDeleting={isDeletingMaterial} />
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
