'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Minimize2, Maximize2 } from 'lucide-react';
import { chatWithAgent, getChatHistory, AgentContext } from '@/app/services/agentService';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AgentChatProps {
  context: AgentContext;
  sessionId: string | null;
  isVisible: boolean;
  onCommand?: (command: string) => void;
}

export default function AgentChat({ context, sessionId, isVisible, onCommand }: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasLoadedHistory = useRef(false);

  // Load chat history from DB when session starts
  useEffect(() => {
    if (!sessionId || hasLoadedHistory.current) return;
    hasLoadedHistory.current = true;

    getChatHistory(sessionId).then(res => {
      if (res.messages && res.messages.length > 0) {
        setMessages(res.messages);
      }
    }).catch(() => {});
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isVisible) return null;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    // Check for quick commands
    const lower = userMessage.toLowerCase();
    if (lower.match(/^(quiz|test)\s*me/i)) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Generating a quiz for you...' }]);
      onCommand?.('quiz');
      return;
    }
    if (lower.match(/^(flash\s*cards?|show\s*cards)/i)) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Generating flashcards...' }]);
      onCommand?.('flipcard');
      return;
    }
    if (lower.match(/^(next\s*section|move\s*on|continue)/i)) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Moving to the next section.' }]);
      onCommand?.('next_section');
      return;
    }
    if (lower.match(/^(mind\s*map|visual)/i)) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Generating a mind map...' }]);
      onCommand?.('mindmap');
      return;
    }
    if (lower.match(/^(game|play)/i)) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Starting a matching game...' }]);
      onCommand?.('mini-game');
      return;
    }
    if (lower.match(/^(read\s*aloud|speak|audio)/i)) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Starting read aloud. Check the reading view.' }]);
      onCommand?.('read_aloud');
      return;
    }

    // Regular chat — send to LLM
    setIsLoading(true);
    try {
      const result = await chatWithAgent(userMessage, sessionId, context);
      setMessages(prev => [...prev, { role: 'assistant', content: result.response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I had trouble responding. Try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-[240px] z-40">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition"
        >
          <Bot className="h-5 w-5" />
          <span className="text-sm font-medium">Study Assistant</span>
          {messages.length > 0 && (
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
              {messages.length}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-[240px] w-96 h-[500px] bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-xl shadow-2xl flex flex-col z-[60]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-sm dark:text-gray-100">Study Assistant</span>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition"
        >
          <Minimize2 className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 dark:text-gray-500 text-sm mt-8">
            <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Ask me anything about your study material</p>
            <p className="text-xs mt-1">I can explain concepts, quiz you, or help you focus</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="h-3.5 w-3.5 text-blue-600" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 dark:text-gray-100'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <Bot className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions + Input */}
      <div className="p-3 border-t dark:border-gray-700">
        {/* Quick action chips */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {[
            { label: 'Quiz me', cmd: 'quiz' },
            { label: 'Flashcards', cmd: 'flipcard' },
            { label: 'Mind map', cmd: 'mindmap' },
            { label: 'Next section', cmd: 'next_section' },
          ].map(chip => (
            <button
              key={chip.cmd}
              onClick={() => { onCommand?.(chip.cmd); setMessages(prev => [...prev, { role: 'user', content: chip.label }, { role: 'assistant', content: `Loading ${chip.label.toLowerCase()}...` }]); }}
              className="px-2.5 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 transition"
            >
              {chip.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your material..."
            className="flex-1 px-3 py-2 text-sm border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg transition"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
