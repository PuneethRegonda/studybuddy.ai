'use client';

import { FileText, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  onAddClick?: () => void;
  uploadedFiles?: File[];
  onFileView?: (file: File) => void;
  selectedFile?: File;
}

export default function Sidebar({
  onAddClick,
  uploadedFiles = [],
  onFileView,
  selectedFile,
}: SidebarProps) {
  const handleViewFile = (file: File) => {
    if (onFileView) {
      onFileView(file);
    }
  };

  return (
    <div className="w-1/5 p-4 border-r bg-white flex flex-col h-full">
      <h1 className="text-xl font-semibold mb-4">Sources</h1>
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full border-blue-500 bg-blue-100 text-blue-500 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          onClick={onAddClick}
        >
          + Add
        </Button>
        <Button variant="outline" className="w-full">
          Discover
        </Button>
      </div>

      {uploadedFiles.length > 0 ? (
        <div className="mt-6 flex-1 overflow-auto">
          <h2 className="text-md font-medium mb-2">Upload Log</h2>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => {
              const isTextFile =
                file.type === 'text/plain' || file.name.endsWith('.txt');

              return (
                <div
                  key={index}
                  className="p-3 bg-gray-50 rounded border border-gray-100 flex items-center justify-between"
                >
                  <div className="flex items-center flex-1 overflow-hidden mr-2">
                    <FileText className="h-4 w-4 mr-2 text-blue-500" />
                    <p className="text-sm font-medium truncate">{file.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isTextFile && onFileView && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewFile(file)}
                        title="View text file"
                        className="h-8 w-8 p-0"
                      >
                        {selectedFile === file ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-10 text-center text-gray-400 text-sm flex-1">
          <p>Saved sources will appear here</p>
          <p className="mt-2">
            Add PDFs, websites, text, videos, or audio files
          </p>
        </div>
      )}
    </div>
  );
}
