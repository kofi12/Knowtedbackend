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

export function DeleteMaterialModal({ isOpen, onClose, material, onConfirmDelete, isDeleting = false }: DeleteMaterialModalProps) {
  if (!material) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Material">
      <div className="space-y-4">
        <p>
          Are you sure you want to delete <strong>{material.name}</strong>?
        </p>
        <p className="text-sm text-muted-foreground">
          This action cannot be undone.
        </p>
      </div>
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
    </Modal>
  );
}
