'use client';

import { BACKEND_API_URL } from '@/app/lib/constants';

export async function generateFlashcards(text: string) {
  const res = await fetch(`${BACKEND_API_URL}/generate-flashcards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) throw new Error('Failed to generate flashcards');

  return res.json(); // This matches your frontend flipcard format
}

export async function generateQuiz(text: string) {
  const res = await fetch(`${BACKEND_API_URL}/generate-quiz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) throw new Error('Failed to generate quiz');

  return res.json();
}

export async function generateMindmap(text: string) {
  const res = await fetch(`${BACKEND_API_URL}/generate-mindmap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) throw new Error('Failed to generate mindmap');

  return res.json();
}

export async function generateMiniGame(text: string) {
  const res = await fetch(`${BACKEND_API_URL}/generate-mini-game`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) throw new Error('Failed to generate mini game');

  return res.json();
}
