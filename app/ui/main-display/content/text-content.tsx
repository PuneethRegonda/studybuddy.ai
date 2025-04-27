'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface TextContentProps {
  data: {
    title?: string;
    content: string;
  };
}


function cleanMarkdown(content: string): string {
  if (!content) return '';

  return content
    .replace(/^```markdown\s*/, '') // remove ```markdown
    .replace(/^```/, '')             // remove just triple backticks
    .replace(/```$/, '')             // remove ending triple backticks
    .trim();
}

export default function TextContent({ data }: TextContentProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(cleanMarkdown(data.content));

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="w-full h-full max-w-3xl mx-auto p-6 overflow-auto">
      {data.title && (
        <h1 className="text-2xl font-bold mb-6 text-center">{data.title}</h1>
      )}

      {/* Voice button section */}
      <div className="flex justify-center mb-6">
        {!isSpeaking ? (
          <button
            onClick={handleSpeak}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
          >
            🔈 Read Aloud
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full"
          >
            ⏹️ Stop Reading
          </button>
        )}
      </div>

      <div className="prose prose-blue max-w-none">
        {/* Always use cleanMarkdown */}
        <ReactMarkdown>{cleanMarkdown(data.content)}</ReactMarkdown>
      </div>
    </div>
  );
}
