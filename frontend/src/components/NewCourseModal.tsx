import { useState } from 'react';
import { Modal, ModalFooter } from './ui/Modal';
import { Input } from './ui/InputField';
import { SelectField as Select } from './ui/SelectField';
import { Textarea } from './ui/TextareaField';
import { Button } from './ui/button';
import { useCourses } from '../lib/CoursesContext';

interface NewCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewCourseModal({ isOpen, onClose }: NewCourseModalProps) {
  const { addCourse } = useCourses();
  const [courseName, setCourseName] = useState('');
  const [semester, setSemester] = useState<'Winter' | 'Summer' | 'Fall'>('Fall');
  const [year, setYear] = useState(new Date().getFullYear());
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const colors = ['indigo', 'teal', 'blue', 'purple'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await addCourse({
        name: courseName,
        semester,
        year,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
      onClose();

      // Reset form
      setCourseName('');
      setSemester('Fall');
      setYear(new Date().getFullYear());
      setDescription('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create course';
      setError(message);
    }
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
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            id="semester"
            label="Semester"
            value={semester}
            onChange={(value) => setSemester(value as 'Winter' | 'Summer' | 'Fall')}
            options={semesterOptions}
            required
          />

          <Select
            id="year"
            label="Year"
            value={year}
            onChange={(value) => setYear(Number(value))}
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

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button type="submit">
            Create Course
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}