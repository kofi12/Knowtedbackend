import { useState } from 'react';
import { Modal, ModalFooter } from './ui/Modal';
import { Input } from './ui/InputField';
import { Select } from './ui/SelectField';
import { Textarea } from './ui/TextareaField';
import { Button } from './ui/button';

interface NewCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewCourseModal({ isOpen, onClose }: NewCourseModalProps) {
  const [courseName, setCourseName] = useState('');
  const [semester, setSemester] = useState<'Winter' | 'Summer' | 'Fall'>('Fall');
  const [year, setYear] = useState(new Date().getFullYear());
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle course creation (e.g. call API, dispatch action, etc.)
    console.log('Creating course:', { courseName, semester, year, description });
    onClose();

    // Reset form
    setCourseName('');
    setSemester('Fall');
    setYear(new Date().getFullYear());
    setDescription('');
  };

  const semesterOptions = [
    { value: 'Winter', label: 'Winter' },
    { value: 'Summer', label: 'Summer' },
    { value: 'Fall', label: 'Fall' },
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: currentYear + i,
    label: (currentYear + i).toString(),
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Course"
      // Optional: ensure modal has proper background/foreground
      className="bg-background text-foreground max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          id="courseName"
          label="Course Name"
          type="text"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          placeholder="e.g., Introduction to Computer Science"
          required
          // shadcn Input usually already handles bg-background/foreground via css vars
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            id="semester"
            label="Semester"
            value={semester}
            onChange={(e) => setSemester(e.target.value as 'Winter' | 'Summer' | 'Fall')}
            options={semesterOptions}
            required
          />

          <Select
            id="year"
            label="Year"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            options={yearOptions}
            required
          />
        </div>

        <Textarea
          id="description"
          label="Description (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a brief description..."
          rows={4}
        />

        <ModalFooter>
          <Button
            type="button"
            variant="outline"  // or "secondary" — outline usually looks better in modals
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            // Primary button usually gets bg-primary text-primary-foreground automatically
          >
            Create Course
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}