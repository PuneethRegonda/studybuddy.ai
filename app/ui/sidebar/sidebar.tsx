'use client';

import { FileText, Sun, Moon, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import SectionProgressList, { SectionInfo } from './section-progress';
import KnowledgeGraphMini from './knowledge-graph-mini';

export interface SavedSource {
  id: string;
  filename: string;
  isActive: boolean;
}

interface SidebarProps {
  onAddClick?: () => void;
  sources?: SavedSource[];
  onSourceClick?: (id: string) => void;
  sections?: SectionInfo[];
  currentSectionId?: string | null;
  onSectionClick?: (sectionId: string) => void;
  knowledgeGraph?: any;
}

export default function Sidebar({
  onAddClick,
  sources = [],
  onSourceClick,
  sections = [],
  currentSectionId,
  onSectionClick,
  knowledgeGraph,
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
    <div className="w-1/5 min-w-[220px] p-4 border-r bg-white dark:bg-gray-900 dark:border-gray-800 flex flex-col h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold dark:text-gray-100">StudyBuddy</h1>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleTheme}>
          {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </Button>
      </div>

      <Button
        variant="outline"
        className="w-full mb-4 border-blue-500 bg-blue-100 dark:bg-blue-900/30 text-blue-500 hover:bg-blue-200 dark:hover:bg-blue-900/50"
        onClick={onAddClick}
      >
        + Add Source
      </Button>

      {/* Sources */}
      {sources.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Materials</h3>
          <div className="space-y-1">
            {sources.map((source) => (
              <button
                key={source.id}
                onClick={() => onSourceClick?.(source.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition text-sm ${
                  source.isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                <FileText className={`h-3.5 w-3.5 flex-shrink-0 ${source.isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                <span className="truncate text-xs">{source.filename.replace(/\.[^.]+$/, '')}</span>
                {source.isActive && <CheckCircle className="h-3 w-3 text-blue-500 ml-auto flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Section progress — shows when a document is active */}
      {sections.length > 0 && onSectionClick && (
        <SectionProgressList
          sections={sections}
          currentSectionId={currentSectionId}
          onSectionClick={onSectionClick}
        />
      )}

      {/* Knowledge graph concept mastery */}
      {knowledgeGraph?.concepts && sections.length > 0 && (
        <KnowledgeGraphMini
          concepts={knowledgeGraph.concepts}
          sections={sections}
        />
      )}

      {sources.length === 0 && sections.length === 0 && (
        <div className="mt-6 text-center text-gray-400 dark:text-gray-500 text-sm flex-1">
          <p>No sources yet</p>
          <p className="mt-2 text-xs">Upload a PDF to get started</p>
        </div>
      )}
    </div>
  );
}
