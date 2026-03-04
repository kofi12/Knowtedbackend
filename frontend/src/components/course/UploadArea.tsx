import { Upload } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';

interface UploadAreaProps {
  onUpload?: () => void;
}

export function UploadArea({ onUpload }: UploadAreaProps) {
  return (
    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
      <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="font-medium mb-2">Upload Study Materials</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Drag and drop files here or click to browse
      </p>
      <Button onClick={onUpload}>
        Choose Files
      </Button>
    </div>
  );
}