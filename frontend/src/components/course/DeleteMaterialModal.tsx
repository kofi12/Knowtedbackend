import { Modal, ModalFooter } from '../ui/Modal';
import { Button } from '../ui/button';
import { Material } from '../../lib/mockData';

interface DeleteMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: Material | null;
  onConfirmDelete: (materialId: string) => void;
  isDeleting?: boolean;
}

export function DeleteMaterialModal({
  isOpen,
  onClose,
  material,
  onConfirmDelete,
  isDeleting = false,
}: DeleteMaterialModalProps) {
  if (!material) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Material" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete{' '}
          <span className="font-medium text-foreground">{material.name}</span>?
          This action cannot be undone.
        </p>

        <ModalFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => onConfirmDelete(material.id)}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}
