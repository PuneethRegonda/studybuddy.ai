'use client';

import { BACKEND_API_URL } from '@/app/lib/constants';

export interface AgentContext {
  documentTitle: string;
  summaryText: string;
  focusScore: number;
  contentType: string;
  distractionCount: number;
  sessionDurationMin: number;
  knowledgeGraph?: any;
  quizPerformance?: any;
}

export async function chatWithAgent(
  message: string,
  sessionId: string | null,
  context: AgentContext
) {
  const res = await fetch(`${BACKEND_API_URL}/api/agent/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId, context }),
  });
  if (!res.ok) throw new Error('Agent chat failed');
  return res.json();
}

export async function getChatHistory(sessionId: string) {
  const res = await fetch(`${BACKEND_API_URL}/api/agent/history/${sessionId}`);
  if (!res.ok) throw new Error('Failed to load chat history');
  return res.json();
}

export async function getDistractionRecap(
  documentTitle: string,
  summaryText: string,
  contentType: string,
  absenceDurationSec: number,
  lastSection: string = ''
) {
  const res = await fetch(`${BACKEND_API_URL}/api/agent/recap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      documentTitle,
      summaryText,
      contentType,
      absenceDurationSec,
      lastSection,
    }),
  });
  if (!res.ok) throw new Error('Recap generation failed');
  return res.json();
}
