import React, { useState } from 'react';
import { useParams } from 'react-router';
import { BookOpen, Brain, Calendar, ClipboardList } from 'lucide-react';
import { mockCourses, mockMaterials, mockAids } from '../lib/mockData';
import { GenerateModal } from '../components/GenerateModal';
import { FlashcardViewer } from '../components/FlashcardViewer';
import { Tabs } from '../components/ui/TabsWrapper';
import { MaterialItem } from '../components/course/MaterialItem';
import { AidCard } from '../components/course/AidCard';
import { GenerateAidButton } from '../components/course/GenerateAidButton';
import { UploadArea } from '../components/course/UploadArea';

type AidType = 'quiz' | 'flashcards' | 'guide' | 'schedule';

export function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const [activeTab, setActiveTab] = useState<'materials' | 'aids'>('materials');
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [generateType, setGenerateType] = useState<AidType>('quiz');
  const [flashcardViewerOpen, setFlashcardViewerOpen] = useState(false);

  const course = mockCourses.find(c => c.id === courseId);
  const materials = mockMaterials.filter(m => m.courseId === courseId);
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

  const tabs = [
    {
      id: 'materials',
      label: 'Course Materials',
      content: (
        <div className="space-y-6">
          <UploadArea onUpload={() => console.log('Upload clicked')} />

          {materials.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Uploaded Materials</h3>
              <div className="space-y-2">
                {materials.map(material => (
                  <MaterialItem 
                    key={material.id} 
                    material={material}
                    onView={(m) => console.log('View material:', m)}
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
          {/* Generate buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <GenerateAidButton
              icon={ClipboardList}
              title="Generate Quiz"
              description="Practice with custom questions"
              color="indigo"
              onClick={() => handleGenerate('quiz')}
            />
            <GenerateAidButton
              icon={Brain}
              title="Generate Flashcards"
              description="Review key concepts"
              color="teal"
              onClick={() => handleGenerate('flashcards')}
            />
            <GenerateAidButton
              icon={BookOpen}
              title="Generate Study Guide"
              description="Comprehensive overview"
              color="blue"
              onClick={() => handleGenerate('guide')}
            />
            <GenerateAidButton
              icon={Calendar}
              title="Generate Schedule"
              description="Plan your study time"
              color="purple"
              onClick={() => handleGenerate('schedule')}
            />
          </div>

          {/* Existing aids */}
          {aids.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Your Study Aids</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aids.map(aid => (
                  <AidCard 
                    key={aid.id} 
                    aid={aid}
                    onClick={handleAidClick}
                  />
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
      {/* Course header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{course.name}</h1>
        <div className="flex flex-wrap gap-3 md:gap-6 text-xs md:text-sm text-muted-foreground">
          <span>{course.semester} {course.year}</span>
          <span>{course.materialsCount} materials</span>
          <span>{course.aidsCount} study aids</span>
          <span className="hidden sm:inline">Updated {course.lastUpdated}</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={(tabId) => setActiveTab(tabId as 'materials' | 'aids')}
      />

      {/* Modals */}
      <GenerateModal
        isOpen={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        courseId={courseId!}
        type={generateType}
      />

      <FlashcardViewer
        isOpen={flashcardViewerOpen}
        onClose={() => setFlashcardViewerOpen(false)}
      />
    </div>
  );
}