'use client';

import { FileText, Sun, Moon, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export interface SavedSource {
  id: string;
  filename: string;
  isActive: boolean;
}

interface SidebarProps {
  onAddClick?: () => void;
  sources?: SavedSource[];
  onSourceClick?: (id: string) => void;
}

export default function Sidebar({
  onAddClick,
  sources = [],
  onSourceClick,
}: SidebarProps) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      setIsDark(false);
    } else {
      html.classList.add('dark');
      setIsDark(true);
    }
  };

  return (
    <div className="w-1/5 p-4 border-r bg-white dark:bg-gray-900 dark:border-gray-800 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold dark:text-gray-100">Sources</h1>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleTheme}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>

      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full border-blue-500 bg-blue-100 dark:bg-blue-900/30 text-blue-500 hover:bg-blue-200 dark:hover:bg-blue-900/50"
          onClick={onAddClick}
        >
          + Add Source
        </Button>
      </div>

      {sources.length > 0 ? (
        <div className="mt-6 flex-1 overflow-auto">
          <h2 className="text-sm font-medium mb-2 text-gray-500 dark:text-gray-400">
            Your materials
          </h2>
          <div className="space-y-2">
            {sources.map((source) => (
              <button
                key={source.id}
                onClick={() => onSourceClick?.(source.id)}
                className={`w-full p-3 rounded border flex items-center gap-2 text-left transition ${
                  source.isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750'
                }`}
              >
                <FileText className={`h-4 w-4 flex-shrink-0 ${source.isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                <span className="text-sm font-medium truncate dark:text-gray-200">
                  {source.filename.replace(/\.[^.]+$/, '')}
                </span>
                {source.isActive && (
                  <CheckCircle className="h-3.5 w-3.5 text-blue-500 ml-auto flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-10 text-center text-gray-400 dark:text-gray-500 text-sm flex-1">
          <p>No sources yet</p>
          <p className="mt-2">Upload a PDF, text file, or markdown</p>
        </div>
      )}
    </div>
  );
}
