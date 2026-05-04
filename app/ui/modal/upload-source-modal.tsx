'use client';

import { useEffect } from 'react';
import ModalHeader from '@/app/ui/modal/modal-header';
import UploadArea from '@/app/ui/modal/upload-area';
import SourceOptions from '@/app/ui/modal/source-options';

interface UploadSourcesModalProps {
  onClose?: () => void;
  handleFileUpload?: (files: File[]) => void;
}

export default function UploadSourcesModal({
  onClose,
  handleFileUpload,
}: UploadSourcesModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onClose) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleFilesSelected = (files: File[]) => {
    if (handleFileUpload) {
      handleFileUpload(files);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 dark:text-gray-100 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="p-7 h-full flex flex-col">
          <ModalHeader title="Upload study material" onClose={onClose} />

          <div className="flex-1 overflow-y-auto pr-1 mt-4">
            <UploadArea
              onFilesSelected={handleFilesSelected}
              onUploadComplete={onClose}
            />

            <div className="mt-4 mb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Supported formats</p>
              <SourceOptions />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
