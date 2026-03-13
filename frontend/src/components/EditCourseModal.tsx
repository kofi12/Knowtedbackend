import { useState, useEffect } from 'react';
import { Modal, ModalFooter } from './ui/Modal';
import { Input } from './ui/InputField';
import { Select } from './ui/SelectField';
import { Button } from './ui/button';
import { Course } from '../lib/mockData';

interface EditCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  onSave: (id: string, updates: { name: string; semester: 'Winter' | 'Summer' | 'Fall'; year: number; color: string }) => void;
}

export function EditCourseModal({ isOpen, onClose, course, onSave }: EditCourseModalProps) {
  const [courseName, setCourseName] = useState('');
  const [semester, setSemester] = useState<'Winter' | 'Summer' | 'Fall'>('Fall');
  const [year, setYear] = useState(new Date().getFullYear());
  const [color, setColor] = useState('indigo');

  useEffect(() => {
    if (course) {
      setCourseName(course.name);
      setSemester(course.semester);
      setYear(course.year);
      setColor(course.color);
    }
  }, [course]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;
    onSave(course.id, { name: courseName, semester, year, color });
    onClose();
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

  const colorOptions = [
    { value: 'indigo', label: 'Indigo' },
    { value: 'teal', label: 'Teal' },
    { value: 'blue', label: 'Blue' },
    { value: 'purple', label: 'Purple' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Course">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          id="editCourseName"
          label="Course Name"
          type="text"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          placeholder="e.g., Introduction to Computer Science"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            id="editSemester"
            label="Semester"
            value={semester}
            onChange={(e) => setSemester(e.target.value as 'Winter' | 'Summer' | 'Fall')}
            options={semesterOptions}
            required
          />
          <Select
            id="editYear"
            label="Year"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            options={yearOptions}
            required
          />
        </div>

        <Select
          id="editColor"
          label="Color Theme"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          options={colorOptions}
        />

        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Save Changes
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
