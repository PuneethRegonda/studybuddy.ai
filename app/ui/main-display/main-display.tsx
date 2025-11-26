'use client';

import React, { useState, useEffect } from 'react';
import TextContent from './content/text-content';
import DefaultDisplay from './default-display';
import FlipCardContent from './content/flip-card-content';
import QuizContent from './content/quiz-content';
import MiniGameContent from './content/mini-game-content';
import MindmapContent from './content/mindmap-content';
import { Spinner } from '../dashboard/redirect';

interface MainDisplayProps {
  isLoading?: boolean;
  contentData?: {
    type: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
  } | null;
  onUpload?: () => void;
}

export default function MainDisplay({
  isLoading = false,
  contentData = null,
  onUpload,
}: MainDisplayProps) {
  const [contentType, setContentType] = useState<string>('default');

  useEffect(() => {
    if (contentData?.type) {
      setContentType(contentData.type);
    }
  }, [contentData]);

  const renderContent = () => {
    if (!contentData) {
      return <DefaultDisplay onUpload={onUpload} />;
    }

    switch (contentType) {
      case 'text':
        return <TextContent data={contentData.data} />;
      case 'flipcard':
        return <FlipCardContent data={contentData.data} />;
      case 'mindmap':
        return <MindmapContent data={contentData.data} />;
      case 'quiz':
        return <QuizContent data={contentData.data} />;
      case 'react':
      case 'mini-game':
        return <MiniGameContent data={contentData.data} />;
      default:
        return <TextContent data={contentData.data} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 p-6 overflow-hidden">
        <div className="flex-1 overflow-y-auto border rounded-lg p-8 bg-blue-50 dark:bg-gray-800 border-blue-200 dark:border-gray-700 flex flex-col items-center justify-center">
          <Spinner />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-4">
            Processing your study material
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Summarizing with AI...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 p-6 overflow-hidden">
      {contentData && (
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {contentData.data?.title || 'Study Session'}
          </h1>
        </div>
      )}

      <div className="flex-1 overflow-y-auto border rounded-lg p-4 bg-blue-50 dark:bg-gray-800 border-blue-500 dark:border-gray-700 flex items-center justify-center">
        {renderContent()}
      </div>
    </div>
  );
}
