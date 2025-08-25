import React from 'react';
import VideoStream from './video-stream';
import AttentionChart from './attention-chart';
import AttentionLevelTracker from './attention-level-display';

export interface StudioPanelProps {
  onAttentionChange?: (attentionData: {
    attentionLevel: number;
    shouldSwitchContent: boolean;
    suggestBreak?: boolean;
    suggestedContentType?: string;
    generatedContent?: any;
  }) => void;
  isContentLoaded?: boolean;
  currentContentType?: string;
  currentSummaryText?: string;
}

export default function StudioPanel({
  onAttentionChange,
  isContentLoaded,
  currentContentType,
  currentSummaryText,
  
}: StudioPanelProps) {
  return (
    <div className="w-[320px] bg-white border-l flex-shrink-0 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Studio Panel</h2>
        <div className="space-y-4">
          <AttentionLevelTracker
            onAttentionChange={onAttentionChange}
            isContentLoaded={isContentLoaded}
            currentContentType={currentContentType}
            currentSummaryText={currentSummaryText}
          />
          <AttentionChart />
          <VideoStream />
        </div>
      </div>
    </div>
  );
}
