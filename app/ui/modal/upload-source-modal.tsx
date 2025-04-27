'use client';

import { useEffect } from 'react';
import ModalHeader from '@/app/ui/modal/modal-header';
import DiscoverSourcesButton from '@/app/ui/modal/discover-sources-button';
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
  // Add event listener for Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onClose) {
        onClose();
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Clean up
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Disable body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Handle file selection from UploadArea
  const handleFilesSelected = (files: File[]) => {
    console.log('Files selected in parent:', files);
    // Here you would handle the files, perhaps upload them to a server
    if (handleFileUpload) {
      handleFileUpload(files);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white text-black rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-slideUp">
        <div className="p-7 h-full flex flex-col">
          {/* Modal Header */}
          <ModalHeader title="Upload sources" onClose={onClose} />

          {/* Content Area - make this scrollable if needed, not the entire modal */}
          <div className="flex-1 overflow-y-auto pr-1">
            {/* Discover sources button */}
            <div className="mt-5">
              <DiscoverSourcesButton />
            </div>

            {/* Upload Area */}
            <UploadArea
              onFilesSelected={handleFilesSelected}
              onUploadComplete={onClose}
            />

            {/* Source Options */}
            <div className="mt-6 mb-4">
              <SourceOptions />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
