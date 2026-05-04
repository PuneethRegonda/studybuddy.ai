'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import Sidebar, { SavedSource } from '@/app/ui/sidebar/sidebar';
import { SectionInfo } from '@/app/ui/sidebar/section-progress';
import StudioPanel from '@/app/ui/studio-panel/studio-panel';
import UploadSourcesModal from '@/app/ui/modal/upload-source-modal';
import MainDisplay from '@/app/ui/main-display/main-display';
import AgentCard from '@/app/ui/agent/agent-card';
import BreakScreen from '@/app/ui/break-screen';
import { predictFocus, ActivityTracker } from '@/app/lib/focus-detection';
import { sendFile } from '@/app/services/send-file';
import { BACKEND_API_URL } from '@/app/lib/constants';
import {
  generateFlashcards,
  generateQuiz,
  generateMindmap,
  generateMiniGame,
} from '@/app/services/contentService';
import {
  createSession,
  listDocuments,
  getSections,
  updateSectionProgress,
} from '@/app/services/sessionService';
import {
  agentWelcome,
  agentFocusDrop,
  agentDistractionReturn,
} from '@/app/services/agentService';

interface ContentData {
  type: string;
  data: any;
}

interface AgentMessage {
  message: string;
  buttons: { label: string; action: string; section_id?: string; content_type?: string }[];
}

export default function Dashboard() {
  const [showModal, setShowModal] = useState(false);
  const [sources, setSources] = useState<SavedSource[]>([]);
  const [sections, setSections] = useState<SectionInfo[]>([]);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  const [currentSectionTitle, setCurrentSectionTitle] = useState('');
  const [currentData, setCurrentData] = useState<ContentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [showStudio, setShowStudio] = useState(false);
  const [isAbsent, setIsAbsent] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [studioMinimized, setStudioMinimized] = useState(false);
  const [agentMessage, setAgentMessage] = useState<AgentMessage | null>(null);

  const [documentId, setDocumentId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentContentType, setCurrentContentType] = useState('text');
  const [focusScore, setFocusScore] = useState(0);

  const summaryTextRef = useRef('');
  const sectionsDataRef = useRef<any[]>([]);
  const focusLowSince = useRef<number | null>(null);
  const focusHistoryRef = useRef<{ score: number; timestamp: number }[]>([]);
  const activityTrackerRef = useRef<ActivityTracker | null>(null);
  const [knowledgeGraph, setKnowledgeGraph] = useState<any>(null);

  // Start activity tracker on mount
  useEffect(() => {
    const tracker = new ActivityTracker(60_000);
    tracker.start();
    activityTrackerRef.current = tracker;

    tracker.on((state) => {
      // Tab hidden = treat as absence
      if (!state.isTabVisible && !isAbsent) {
        setIsAbsent(true);
      }
    });

    return () => tracker.stop();
  }, []);

  // Load a document's sections from DB
  const loadDocument = useCallback(async (docId: string) => {
    setIsLoading(true);
    try {
      const res = await getSections(docId);
      const secs = res.sections || [];

      setSections(secs.map((s: any) => ({
        id: s.id, title: s.title, order: s.order,
        status: s.status, quiz_score: s.quiz_score,
      })));
      sectionsDataRef.current = secs;

      setDocumentId(docId);
      setSources(prev => prev.map(s => ({ ...s, isActive: s.id === docId })));
      setContentLoaded(true);
      setShowStudio(true);

      // Load knowledge graph
      try {
        const kgRes = await fetch(`${BACKEND_API_URL}/api/documents/${docId}/graph`);
        const kgData = await kgRes.json();
        if (kgData.knowledge_graph) setKnowledgeGraph(kgData.knowledge_graph);
      } catch { /* KG is optional */ }

      // Create session
      createSession(docId).then(r => setSessionId(r.id)).catch(() => {});

      // Get agent welcome
      const welcome = await agentWelcome(docId);
      setAgentMessage({ message: welcome.message, buttons: welcome.buttons || [] });

      // Load first section or the one agent suggests
      const nextSectionId = welcome.data?.next_section_id;
      if (nextSectionId) {
        loadSection(nextSectionId, secs);
      } else if (secs.length > 0) {
        loadSection(secs[0].id, secs);
      }
    } catch (err) {
      console.error('Failed to load document:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-restore last document on mount
  const hasRestored = useRef(false);
  useEffect(() => {
    if (hasRestored.current) return;
    hasRestored.current = true;

    listDocuments().then(res => {
      if (res.documents?.length > 0) {
        setSources(res.documents.map((d: any) => ({
          id: d.id, filename: d.filename, isActive: false,
        })));
        loadDocument(res.documents[0].id);
      }
    }).catch(() => {});
  }, [loadDocument]);

  // Load a specific section's content
  const loadSection = useCallback((sectionId: string, allSections?: any[]) => {
    const secs = allSections || sectionsDataRef.current;
    const section = secs.find((s: any) => s.id === sectionId);
    if (!section) return;

    setCurrentSectionId(sectionId);
    setCurrentSectionTitle(section.title);
    setCurrentContentType('text');
    setCurrentData({
      type: 'text',
      data: { title: section.title, content: section.content },
    });
    summaryTextRef.current = section.content;

    // Update progress to in_progress
    if (documentId) {
      updateSectionProgress(documentId, sectionId, 'in_progress').catch(() => {});
      setSections(prev => prev.map(s =>
        s.id === sectionId && s.status === 'not_started'
          ? { ...s, status: 'in_progress' }
          : s
      ));
    }
  }, [documentId]);

  // Upload a new file
  const handleFileUpload = useCallback(async (files: File[]) => {
    const file = files[files.length - 1];
    if (!file) return;

    setIsLoading(true);
    setContentLoaded(false);
    setAgentMessage(null);

    try {
      const response = await sendFile(file, `${BACKEND_API_URL}/upload`);
      const result = await response.json();

      if (result.data?.sections) {
        const docId = result.id;
        const secs = result.data.sections;

        setDocumentId(docId);
        setSections(secs.map((s: any) => ({
          id: s.id, title: s.title, order: s.order,
          status: s.status || 'not_started', quiz_score: null,
        })));
        sectionsDataRef.current = secs;
        setSources(prev => [
          { id: docId, filename: file.name, isActive: true },
          ...prev.map(s => ({ ...s, isActive: false })),
        ]);

        setContentLoaded(true);
        setShowStudio(true);

        // Create session
        createSession(docId).then(r => setSessionId(r.id)).catch(() => {});

        // Agent welcome
        const welcome = await agentWelcome(docId);
        setAgentMessage({ message: welcome.message, buttons: welcome.buttons || [] });

        // Load first section
        if (secs.length > 0) {
          loadSection(secs[0].id, secs);
        }
      }
    } catch (error) {
      console.error('Error uploading:', error);
    } finally {
      setIsLoading(false);
    }
  }, [loadSection]);

  // Handle content type switch (from tabs)
  const handleContentTypeRequest = useCallback(async (type: string) => {
    if (!summaryTextRef.current || !currentSectionId) return;

    // If switching away from text, mark section as read
    if (currentContentType === 'text' && type !== 'text' && documentId) {
      updateSectionProgress(documentId, currentSectionId, 'read').catch(() => {});
      setSections(prev => prev.map(s =>
        s.id === currentSectionId && (s.status === 'not_started' || s.status === 'in_progress')
          ? { ...s, status: 'read' }
          : s
      ));
    }

    if (type === 'text') {
      const section = sectionsDataRef.current.find((s: any) => s.id === currentSectionId);
      if (section) {
        setCurrentContentType('text');
        setCurrentData({ type: 'text', data: { title: section.title, content: section.content } });
      }
      return;
    }

    setIsLoading(true);
    setCurrentContentType(type);
    try {
      let generated = null;
      switch (type) {
        case 'flipcard': generated = await generateFlashcards(summaryTextRef.current, documentId, currentSectionId); break;
        case 'quiz': generated = await generateQuiz(summaryTextRef.current, documentId, currentSectionId); break;
        case 'mindmap': generated = await generateMindmap(summaryTextRef.current, documentId, currentSectionId); break;
        case 'mini-game': generated = await generateMiniGame(summaryTextRef.current, documentId, currentSectionId); break;
      }
      if (generated) {
        setCurrentData({ type: generated.type || type, data: generated.data });
      }
    } catch (err) {
      console.error('Content generation failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentSectionId, documentId]);

  // Handle quiz completion → update section progress
  const handleQuizComplete = useCallback((score: number, total: number) => {
    if (!documentId || !currentSectionId) return;
    const pct = total > 0 ? score / total : 0;
    const status = pct >= 0.7 ? 'mastered' : 'tested';

    updateSectionProgress(documentId, currentSectionId, status, pct).catch(() => {});

    // Update sidebar progress
    setSections(prev => prev.map(s =>
      s.id === currentSectionId ? { ...s, status, quiz_score: pct } : s
    ));

    // Agent suggests next step
    if (pct >= 0.7) {
      const currentIdx = sectionsDataRef.current.findIndex((s: any) => s.id === currentSectionId);
      const next = sectionsDataRef.current[currentIdx + 1];
      setAgentMessage({
        message: `${score}/${total} correct! Section mastered. ${next ? `Ready for "${next.title}"?` : 'All sections complete!'}`,
        buttons: next
          ? [{ label: 'Next section', action: 'start_section', section_id: next.id }]
          : [{ label: 'Review from start', action: 'start_section', section_id: sectionsDataRef.current[0]?.id }],
      });
    } else {
      setAgentMessage({
        message: `${score}/${total}. Let's review with flashcards before moving on.`,
        buttons: [
          { label: 'Review with flashcards', action: 'switch_content', content_type: 'flipcard' },
          { label: 'Re-read section', action: 'switch_content', content_type: 'text' },
        ],
      });
    }
  }, [documentId, currentSectionId]);

  // Handle agent card button clicks
  const handleAgentAction = useCallback((action: string, data?: Record<string, string>) => {
    setAgentMessage(null);

    switch (action) {
      case 'start_section':
        if (data?.section_id) loadSection(data.section_id);
        break;
      case 'next_section': {
        const currentIdx = sectionsDataRef.current.findIndex((s: any) => s.id === currentSectionId);
        const next = sectionsDataRef.current[currentIdx + 1];
        if (next) loadSection(next.id);
        break;
      }
      case 'switch_content':
        if (data?.content_type) handleContentTypeRequest(data.content_type);
        break;
      case 'review_previous':
        if (sectionsDataRef.current.length > 0) loadSection(sectionsDataRef.current[0].id);
        break;
      case 'dismiss':
        break;
    }
  }, [currentSectionId, loadSection, handleContentTypeRequest]);

  // Focus tracking — detect sustained low focus
  const handleFocusUpdate = useCallback((score: number) => {
    setFocusScore(score);

    if (!contentLoaded || !documentId || !currentSectionId) return;

    // Track focus history for prediction
    const now = Date.now();
    focusHistoryRef.current.push({ score, timestamp: now });
    // Keep last 60 seconds
    focusHistoryRef.current = focusHistoryRef.current.filter(h => now - h.timestamp < 60_000);

    // Use prediction to intervene BEFORE focus drops
    const prediction = predictFocus(focusHistoryRef.current);

    // Check activity tracker — phone detection
    const activity = activityTrackerRef.current?.getState();
    const onPhone = activity?.isProbablyOnPhone && score > 30;

    if (onPhone && !agentMessage) {
      // High focus score but no interaction — probably on phone
      setAgentMessage({
        message: "Looks like you might be away from the screen. Still studying?",
        buttons: [
          { label: "I'm here", action: "dismiss" },
          { label: "Take a break", action: "dismiss" },
        ],
      });
      return;
    }

    // Proactive: prediction says focus will drop below 35 within 30 seconds
    if (prediction.isDecliningSteadily && prediction.predictedScore < 35 && score > 35 && !agentMessage) {
      console.log(`[Predict] Focus declining: ${score}% now → ${prediction.predictedScore}% in 30s`);
      agentFocusDrop(documentId, currentSectionId, currentContentType)
        .then(action => setAgentMessage({ message: action.message, buttons: action.buttons || [] }))
        .catch(() => {});
      focusLowSince.current = null;
      return;
    }

    // Reactive fallback: focus already low for 10 seconds
    if (score < 35) {
      if (!focusLowSince.current) focusLowSince.current = now;
      const duration = now - focusLowSince.current;
      if (duration > 10000 && !agentMessage) {
        focusLowSince.current = null;
        agentFocusDrop(documentId, currentSectionId, currentContentType)
          .then(action => setAgentMessage({ message: action.message, buttons: action.buttons || [] }))
          .catch(() => {});
      }
    } else {
      focusLowSince.current = null;
    }
  }, [contentLoaded, documentId, currentSectionId, currentContentType, agentMessage]);

  // Absence
  const handleAbsenceStart = useCallback(() => setIsAbsent(true), []);
  const handleAbsenceEnd = useCallback(() => {
    setIsAbsent(false);
    if (documentId && currentSectionId) {
      agentDistractionReturn(documentId, currentSectionId, currentSectionTitle)
        .then(action => setAgentMessage({ message: action.message, buttons: action.buttons || [] }))
        .catch(() => {});
    }
  }, [documentId, currentSectionId, currentSectionTitle]);

  // Section click in sidebar
  const handleSectionClick = useCallback((sectionId: string) => {
    loadSection(sectionId);
    setAgentMessage(null);
  }, [loadSection]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar
        onAddClick={() => setShowModal(true)}
        sources={sources}
        onSourceClick={(id) => loadDocument(id)}
        sections={sections}
        currentSectionId={currentSectionId}
        onSectionClick={handleSectionClick}
        knowledgeGraph={knowledgeGraph}
      />

      <div className="flex-1 flex flex-col relative">
        {/* Agent inline card */}
        {agentMessage && (
          <AgentCard
            message={agentMessage.message}
            buttons={agentMessage.buttons}
            onAction={handleAgentAction}
            onDismiss={() => setAgentMessage(null)}
          />
        )}

        <MainDisplay
          isLoading={isLoading}
          contentData={currentData}
          onUpload={() => setShowModal(true)}
          onContentTypeRequest={handleContentTypeRequest}
          onQuizComplete={handleQuizComplete}
        />

        {/* Absence bar */}
        {isAbsent && contentLoaded && !isOnBreak && (
          <div className="absolute bottom-0 left-0 right-0 bg-gray-800/90 backdrop-blur-sm text-white px-6 py-3 flex items-center justify-between z-50">
            <span className="text-sm">Still there?</span>
            <div className="flex gap-3">
              <button onClick={() => setIsAbsent(false)} className="px-4 py-1.5 text-sm bg-white/20 hover:bg-white/30 rounded-full transition">
                I&apos;m here
              </button>
              <button onClick={() => { setIsAbsent(false); setIsOnBreak(true); }} className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 rounded-full transition">
                Taking a break
              </button>
            </div>
          </div>
        )}

        {/* Break screen with timer */}
        {isOnBreak && <BreakScreen onBack={() => setIsOnBreak(false)} />}
      </div>

      {/* Studio Panel — always render for camera, control visibility */}
      {showStudio && (
        <>
          {/* Full sidebar panel */}
          <div
            className={`transition-all duration-500 ease-in-out flex-shrink-0 overflow-hidden ${
              studioMinimized ? 'w-0' : 'w-[320px]'
            }`}
          >
            <div className="w-[320px] h-full relative">
              <button
                onClick={() => setStudioMinimized(true)}
                className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all shadow-sm"
                title="Minimize studio"
              >
                <svg className="h-3.5 w-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7" />
                </svg>
              </button>
              <StudioPanel
                onFocusUpdate={handleFocusUpdate}
                onAbsenceStart={handleAbsenceStart}
                onAbsenceEnd={handleAbsenceEnd}
                isContentLoaded={contentLoaded}
              />
            </div>
          </div>

          {/* Floating widget when minimized — shows camera + focus */}
          {studioMinimized && (
            <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right duration-300">
              <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden w-64">
                {/* Mini camera preview */}
                <div className="relative w-full aspect-[16/9] bg-black">
                  <video
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    ref={(el) => {
                      // Mirror the main studio panel's video
                      if (el) {
                        const mainVideo = document.querySelector('.studio-video') as HTMLVideoElement;
                        if (mainVideo?.srcObject) {
                          el.srcObject = mainVideo.srcObject;
                        }
                      }
                    }}
                  />
                  {/* Focus score overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${
                          focusScore > 60 ? 'bg-green-400' : focusScore > 30 ? 'bg-amber-400' : 'bg-red-400'
                        }`} />
                        <span className="text-white text-xs font-semibold">{focusScore}%</span>
                      </div>
                      <span className="text-gray-400 text-xs">
                        {focusScore > 60 ? 'Focused' : focusScore > 30 ? 'Drifting' : 'Low'}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Expand button */}
                <button
                  onClick={() => setStudioMinimized(false)}
                  className="w-full py-2 text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition flex items-center justify-center gap-1"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7" />
                  </svg>
                  Expand studio
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {showModal && (
        <UploadSourcesModal
          onClose={() => setShowModal(false)}
          handleFileUpload={handleFileUpload}
        />
      )}
    </div>
  );
}
