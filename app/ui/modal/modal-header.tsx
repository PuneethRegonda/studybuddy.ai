'use client';

import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ModalHeaderProps {
  title: string;
  onClose?: () => void;
}

export default function ModalHeader({ title, onClose }: ModalHeaderProps) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between py-4 border-b border-gray-200">
        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <Button
          onClick={onClose}
          variant="ghost"
          className="rounded-sm p-2 h-auto hover:bg-gray-100 transition-colors bg-gray-50"
          aria-label="Close"
        >
          <X size={18} />
        </Button>
      </div>
    </>
  );
}
