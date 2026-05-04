'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Volume2, VolumeX } from 'lucide-react';

interface TextContentProps {
  data: {
    title?: string;
    content: string;
  };
}

function cleanMarkdown(content: string): string {
  if (!content) return '';
  return content
    .replace(/^```(?:markdown)?\s*/, '')
    .replace(/```$/, '')
    .trim();
}

function stripMarkdownForTTS(content: string): string {
  return content
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[-*+]\s/g, '')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ' ')
    .trim();
}

export default function TextContent({ data }: TextContentProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    const text = stripMarkdownForTTS(data.content);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="w-full h-full max-w-3xl mx-auto p-8 overflow-auto">
      {/* Header with title and TTS */}
      <div className="flex items-center justify-between mb-6">
        {data.title && (
          <h1 className="text-2xl font-bold dark:text-gray-100">{data.title}</h1>
        )}
        <button
          onClick={isSpeaking ? handleStop : handleSpeak}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition ${
            isSpeaking
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          {isSpeaking ? 'Stop' : 'Read aloud'}
        </button>
      </div>

      {/* Content with proper typography */}
      <article className="prose prose-gray dark:prose-invert prose-headings:font-semibold prose-h2:text-xl prose-h3:text-lg prose-p:leading-7 prose-li:leading-7 prose-a:text-blue-600 max-w-none">
        <ReactMarkdown>{cleanMarkdown(data.content)}</ReactMarkdown>
      </article>
    </div>
  );
}
