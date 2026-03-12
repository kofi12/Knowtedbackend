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

export function DeleteCourseModal({
  isOpen,
  onClose,
  course,
  onConfirmDelete,
  isDeleting = false,
}: DeleteCourseModalProps) {
  if (!course) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Course" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete{' '}
          <span className="font-medium text-foreground">{course.name}</span>?
          All materials and study aids in this course will also be removed. This action cannot be undone.
        </p>

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
      </div>
    </Modal>
  );
}
