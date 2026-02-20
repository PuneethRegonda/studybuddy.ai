'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';

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

function prepareForTTS(content: string): string {
  // Strip markdown syntax
  let text = content
    .replace(/#{1,6}\s+/g, '')          // headings
    .replace(/\*\*(.*?)\*\*/g, '$1')     // bold
    .replace(/\*(.*?)\*/g, '$1')         // italic
    .replace(/`(.*?)`/g, '$1')           // inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/^[-*+]\s/gm, '')           // list markers
    .replace(/^\d+\.\s/gm, '')           // numbered lists
    .replace(/^>\s/gm, '')               // blockquotes
    .replace(/---+/g, '')                // horizontal rules
    .replace(/\n{3,}/g, '\n\n');         // excess newlines

  // Remove duplicate consecutive sentences
  const sentences = text.split(/(?<=[.!?])\s+/);
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const s of sentences) {
    const normalized = s.trim().toLowerCase();
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      unique.push(s.trim());
    }
  }

  return unique.join(' ').replace(/\s+/g, ' ').trim();
}

export default function TextContent({ data }: TextContentProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleSpeak = () => {
    const text = prepareForTTS(data.content);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;

    // Try to use a natural-sounding voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.name.includes('Samantha') || v.name.includes('Google') ||
      v.name.includes('Natural') || v.name.includes('Enhanced')
    );
    if (preferred) utterance.voice = preferred;

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setProgress(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setIsPaused(false);

    // Track progress
    const totalLength = text.length;
    let elapsed = 0;
    intervalRef.current = setInterval(() => {
      elapsed += 100;
      // Rough estimate: ~150 words/min at 0.95 rate, avg 5 chars/word
      const charsPerMs = (150 * 5) / 60000 * 0.95;
      const estimatedPos = elapsed * charsPerMs;
      setProgress(Math.min((estimatedPos / totalLength) * 100, 99));
    }, 100);
  };

  const handlePause = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  return (
    <div className="w-full h-full max-w-3xl mx-auto overflow-auto">
      <div className="px-8 py-6">
        {/* Header */}
        {data.title && (
          <h1 className="text-2xl font-bold dark:text-gray-100 mb-2">
            {data.title}
          </h1>
        )}

        {/* TTS controls */}
        <div className="flex items-center gap-2 mb-6 pb-4 border-b dark:border-gray-700">
          {!isSpeaking ? (
            <button
              onClick={handleSpeak}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"
            >
              <Volume2 className="h-4 w-4" />
              Read aloud
            </button>
          ) : (
            <>
              <button
                onClick={handlePause}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 transition"
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={handleStop}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                <VolumeX className="h-4 w-4" />
                Stop
              </button>
              {/* Progress bar */}
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1 ml-2">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          )}
        </div>

        {/* Content — clean readable typography */}
        <article className="prose prose-gray dark:prose-invert max-w-none
          prose-headings:font-semibold prose-headings:tracking-tight
          prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-h2:text-gray-900 dark:prose-h2:text-gray-100
          prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2
          prose-p:text-base prose-p:leading-7 prose-p:text-gray-700 dark:prose-p:text-gray-300
          prose-li:text-base prose-li:leading-7 prose-li:text-gray-700 dark:prose-li:text-gray-300
          prose-strong:text-gray-900 dark:prose-strong:text-gray-100
          prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
          prose-code:text-sm prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
          prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50/50 dark:prose-blockquote:bg-blue-900/10 prose-blockquote:rounded-r-lg prose-blockquote:py-1
        ">
          <ReactMarkdown>{cleanMarkdown(data.content)}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
