'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import Sidebar, { SavedSource } from '@/app/ui/sidebar/sidebar';
import StudioPanel from '@/app/ui/studio-panel/studio-panel';
import UploadSourcesModal from '@/app/ui/modal/upload-source-modal';
import MainDisplay from '@/app/ui/main-display/main-display';
import { sendFile } from '@/app/services/send-file';
import { BACKEND_API_URL } from '@/app/lib/constants';
import { useAdaptiveEngine } from '@/app/lib/adaptive-engine';
import type { TransitionEvent } from '@/app/lib/adaptive-engine';
import {
  generateFlashcards,
  generateQuiz,
  generateMindmap,
  generateMiniGame,
} from '@/app/services/contentService';
import {
  createDocument,
  createSession,
  recordFocusEvents,
  recordDistraction,
  listDocuments,
  getLatestDocument,
  getLatestSession,
} from '@/app/services/sessionService';
import AgentChat from '@/app/ui/agent/agent-chat';
import SessionReport from '@/app/ui/session/session-report';

interface ContentData {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  timestamp?: number;
}

export default function Dashboard() {
  const [showModal, setShowModal] = useState(false);
  const [sources, setSources] = useState<SavedSource[]>([]);
  const [currentData, setCurrentData] = useState<ContentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [currentSummaryText, setCurrentSummaryText] = useState('');
  const [focusScore, setFocusScore] = useState(0);
  const [isAbsent, setIsAbsent] = useState(false);
  const [showStudio, setShowStudio] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [absenceReturnData, setAbsenceReturnData] = useState<{ duration: number } | null>(null);
  const [isOnBreak, setIsOnBreak] = useState(false);

  const [documentId, setDocumentId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const [distractionCount, setDistractionCount] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [sessionReport, setSessionReport] = useState<any>(null);
  const [knowledgeGraph, setKnowledgeGraph] = useState<any>(null);

  const summaryTextRef = useRef('');
  const focusBatchRef = useRef<{ score: number; contentType: string }[]>([]);

  // Load saved sources from DB on mount
  useEffect(() => {
    listDocuments().then(res => {
      if (res.documents && res.documents.length > 0) {
        setSources(res.documents.map((d: any) => ({
          id: d.id,
          filename: d.filename,
          isActive: false,
        })));
      }
    }).catch(() => {});
  }, []);

  // Load a document from DB by ID
  const loadDocument = useCallback(async (docId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND_API_URL}/api/documents/${docId}/graph`);
      const data = await res.json();

      // Also get the full doc with summary
      const docRes = await fetch(`${BACKEND_API_URL}/api/documents/latest`);
      const doc = await docRes.json();

      if (!doc.found || !doc.summary) {
        setIsLoading(false);
        return;
      }

      const summary = doc.summary;
      setCurrentSummaryText(summary);
      summaryTextRef.current = summary;
      setDocumentTitle(doc.filename || '');
      setDocumentId(doc.id);
      setKnowledgeGraph(doc.knowledge_graph);

      setCurrentData({
        type: 'text',
        data: { title: doc.filename?.replace(/\.[^.]+$/, '') || 'Summary', content: summary },
      });
      setContentLoaded(true);
      setShowStudio(true);

      // Mark as active in sources
      setSources(prev => prev.map(s => ({ ...s, isActive: s.id === docId })));

      // Create or restore session
      const session = await getLatestSession();
      if (session.found && session.document_id === docId) {
        setSessionId(session.id);
        setDistractionCount(session.distraction_count || 0);
        setSessionStartTime(new Date(session.started_at).getTime());
      } else {
        const newSession = await createSession(docId);
        setSessionId(newSession.id);
        setSessionStartTime(Date.now());
        setDistractionCount(0);
      }
    } catch (err) {
      console.error('Failed to load document:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Upload a new file
  const handleFileUpload = useCallback(async (files: File[]) => {
    const file = files[files.length - 1];
    if (!file) return;

    setIsLoading(true);
    setContentLoaded(false);

    try {
      const response = await sendFile(file, `${BACKEND_API_URL}/upload`);
      const result = await response.json();

      const summary = result.data?.content || '';
      if (!summary) {
        console.warn('No summary returned');
        setIsLoading(false);
        return;
      }

      setCurrentSummaryText(summary);
      summaryTextRef.current = summary;
      setDocumentTitle(result.data?.title || file.name);

      setCurrentData({
        type: result.type,
        data: result.data,
      });
      setContentLoaded(true);
      setShowStudio(true);

      // Save document + extract knowledge graph
      const docId = result.id || `doc-${Date.now()}`;
      setDocumentId(docId);

      createDocument(docId, file.name, summary).then(res => {
        if (res.knowledge_graph) setKnowledgeGraph(res.knowledge_graph);
      }).catch(err => console.warn('KG extraction:', err));

      // Add to sources list
      setSources(prev => {
        const exists = prev.find(s => s.filename === file.name);
        if (exists) return prev.map(s => ({ ...s, isActive: s.filename === file.name }));
        return [{ id: docId, filename: file.name, isActive: true }, ...prev.map(s => ({ ...s, isActive: false }))];
      });

      // Start session
      createSession(docId).then(res => {
        setSessionId(res.id);
        setSessionStartTime(Date.now());
        setDistractionCount(0);
      }).catch(err => console.warn('Session creation:', err));

    } catch (error) {
      console.error('Error uploading:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Adaptive engine
  const isGeneratingRef = useRef(false);
  const handleTransition = useCallback(async (event: TransitionEvent) => {
    if (!summaryTextRef.current || isGeneratingRef.current) return;

    const { toState, contentType, reason } = event;
    console.log(`[Adaptive] ${event.fromState} -> ${toState} (${reason})`);

    if (toState === 'READING') {
      setCurrentData(prev => prev ? {
        type: 'text',
        data: { title: prev.data?.title || 'Summary', content: summaryTextRef.current },
        timestamp: Date.now(),
      } : null);
      return;
    }

    if (toState === 'BREAK' || toState === 'RECOVERY') return;

    isGeneratingRef.current = true;
    setIsGeneratingContent(true);

    try {
      let generated = null;
      switch (contentType) {
        case 'flipcard': generated = await generateFlashcards(summaryTextRef.current, documentId); break;
        case 'quiz': generated = await generateQuiz(summaryTextRef.current, documentId); break;
        case 'mindmap': generated = await generateMindmap(summaryTextRef.current, documentId); break;
        case 'mini-game': generated = await generateMiniGame(summaryTextRef.current, documentId); break;
      }

      if (generated) {
        setCurrentData({ type: generated.type || contentType, data: generated.data, timestamp: Date.now() });
      }
    } catch (err) {
      console.error('[Adaptive] Content generation failed:', err);
    } finally {
      isGeneratingRef.current = false;
      setIsGeneratingContent(false);
    }
  }, []);

  const {
    currentState,
    currentContentType,
    updateFocus,
    handleDistractionReturn,
    endBreak,
  } = useAdaptiveEngine({}, handleTransition);

  // Focus updates
  const handleFocusUpdate = useCallback((score: number) => {
    setFocusScore(score);
    if (contentLoaded) {
      updateFocus(score);
      focusBatchRef.current.push({ score, contentType: currentContentType });
      if (focusBatchRef.current.length >= 30 && sessionId) {
        const batch = [...focusBatchRef.current];
        focusBatchRef.current = [];
        recordFocusEvents(sessionId, batch).catch(() => {});
      }
    }
  }, [contentLoaded, updateFocus, currentContentType, sessionId]);

  // Manual content type switch from tabs
  const handleContentTypeRequest = useCallback(async (type: string) => {
    if (!summaryTextRef.current || isGeneratingRef.current) return;

    // Text is instant — just swap data
    if (type === 'text') {
      setCurrentData(prev => prev ? {
        type: 'text',
        data: { title: prev.data?.title || 'Summary', content: summaryTextRef.current },
        timestamp: Date.now(),
      } : null);
      return;
    }

    // Generate content for the requested type
    isGeneratingRef.current = true;
    setIsGeneratingContent(true);

    try {
      let generated = null;
      switch (type) {
        case 'flipcard': generated = await generateFlashcards(summaryTextRef.current, documentId); break;
        case 'quiz': generated = await generateQuiz(summaryTextRef.current, documentId); break;
        case 'mindmap': generated = await generateMindmap(summaryTextRef.current, documentId); break;
        case 'mini-game': generated = await generateMiniGame(summaryTextRef.current, documentId); break;
      }

      if (generated) {
        setCurrentData({ type: generated.type || type, data: generated.data, timestamp: Date.now() });
      }
    } catch (err) {
      console.error('Content generation failed:', err);
    } finally {
      isGeneratingRef.current = false;
      setIsGeneratingContent(false);
    }
  }, []);

  // Absence
  const handleAbsenceStart = useCallback(() => setIsAbsent(true), []);

  const handleAbsenceEnd = useCallback((duration: number) => {
    setIsAbsent(false);
    setAbsenceReturnData({ duration });
    setDistractionCount(prev => prev + 1);
    handleDistractionReturn();
    setTimeout(() => setAbsenceReturnData(null), 30000);
    if (sessionId) recordDistraction(sessionId, duration / 1000).catch(() => {});
  }, [handleDistractionReturn, sessionId]);

  const handleDismissReturn = useCallback(() => {
    setAbsenceReturnData(null);
    endBreak();
  }, [endBreak]);

  // Source click in sidebar
  const handleSourceClick = useCallback((id: string) => {
    loadDocument(id);
  }, [loadDocument]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar
        onAddClick={() => setShowModal(true)}
        sources={sources}
        onSourceClick={handleSourceClick}
      />

      <div className="flex-1 flex flex-col relative">
        <MainDisplay
          isLoading={isLoading || isGeneratingContent}
          contentData={currentData}
          onUpload={() => setShowModal(true)}
          onContentTypeRequest={handleContentTypeRequest}
        />

        {/* Absence bar — slides in when face disappears */}
        {isAbsent && contentLoaded && !isOnBreak && (
          <div className="absolute bottom-0 left-0 right-0 bg-gray-800/90 backdrop-blur-sm text-white px-6 py-3 flex items-center justify-between z-50">
            <span className="text-sm">Still there?</span>
            <div className="flex gap-3">
              <button
                onClick={() => setIsAbsent(false)}
                className="px-4 py-1.5 text-sm bg-white/20 hover:bg-white/30 rounded-full transition"
              >
                I&apos;m here
              </button>
              <button
                onClick={() => { setIsAbsent(false); setIsOnBreak(true); }}
                className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 rounded-full transition"
              >
                Taking a break
              </button>
            </div>
          </div>
        )}

        {/* Break screen — calm, no pressure */}
        {isOnBreak && (
          <div className="absolute inset-0 bg-gray-950/95 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="max-w-sm text-center">
              <div className="text-4xl mb-4">&#9749;</div>
              <h2 className="text-xl font-medium text-white mb-2">Enjoy your break</h2>
              <p className="text-gray-400 text-sm mb-8">Take your time. Your session is paused.</p>
              <button
                onClick={() => { setIsOnBreak(false); setAbsenceReturnData({ duration: 0 }); }}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
              >
                I&apos;m back
              </button>
            </div>
          </div>
        )}

        {/* Return recap — shown after coming back */}
        {absenceReturnData && currentData && !isOnBreak && (
          <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="max-w-md text-center p-8">
              <p className="text-gray-500 dark:text-gray-400 mb-3 text-sm">Welcome back</p>
              <p className="text-lg font-medium mb-2 dark:text-gray-100">
                {currentData.data?.title || 'Your material'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Pick up where you left off
              </p>
              <button
                onClick={handleDismissReturn}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Studio Panel */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showStudio ? 'w-[320px] opacity-100' : 'w-0 opacity-0'}`}>
        {showStudio && (
          <StudioPanel
            onFocusUpdate={handleFocusUpdate}
            onAbsenceStart={handleAbsenceStart}
            onAbsenceEnd={handleAbsenceEnd}
            isContentLoaded={contentLoaded}
            currentSummaryText={currentSummaryText}
          />
        )}
      </div>

      {showModal && (
        <UploadSourcesModal
          onClose={() => setShowModal(false)}
          handleFileUpload={handleFileUpload}
        />
      )}

      {/* Agent */}
      <AgentChat
        isVisible={contentLoaded}
        sessionId={sessionId}
        context={{
          documentTitle,
          summaryText: currentSummaryText,
          focusScore,
          contentType: currentContentType,
          distractionCount,
          sessionDurationMin: sessionStartTime ? Math.round((Date.now() - sessionStartTime) / 60000) : 0,
          knowledgeGraph,
        }}
      />

      {sessionReport && (
        <SessionReport report={sessionReport} onClose={() => setSessionReport(null)} />
      )}
    </div>
  );
}
