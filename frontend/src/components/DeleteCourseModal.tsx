import { Modal, ModalFooter } from './ui/Modal';
import { Button } from './ui/button';
import { Course } from '../lib/mockData';

interface DeleteCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  onConfirmDelete: (courseId: string) => void;
  isDeleting?: boolean;
}

export function DeleteCourseModal({ isOpen, onClose, course, onConfirmDelete, isDeleting = false }: DeleteCourseModalProps) {
  if (!course) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Course">
      <div className="space-y-4">
        <p>
          Are you sure you want to delete <strong>{course.name}</strong>?
        </p>
        <p className="text-sm text-muted-foreground">
          All materials and study aids in this course will also be removed. This action cannot be undone.
        </p>
      </div>
      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={() => onConfirmDelete(course.id)}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete Course'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
