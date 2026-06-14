'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChatBubble, TypingIndicator } from '@/components/ai/ChatBubble';
import { ContextPanel } from '@/components/ai/ContextPanel';
import { Send, Sparkles, Bot, BarChart2, Users, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface Message { role: 'user' | 'assistant'; content: string; }

const SUGGESTIONS = [
  {
    icon: BarChart2,
    label: 'Campaign Performance',
    prompt: 'Summarize overall campaign performance across all channels',
  },
  {
    icon: Users,
    label: 'Segment Recommendations',
    prompt: 'Recommend the best customer segments for a WhatsApp campaign',
  },
  {
    icon: TrendingUp,
    label: 'Improve Open Rates',
    prompt: 'What are the top strategies to improve email open rates?',
  },
  {
    icon: Zap,
    label: 'Re-engagement Tactics',
    prompt: 'Best re-engagement strategies for at-risk customers',
  },
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput('');
    const userMsg: Message = { role: 'user', content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history: messages }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please check your connection and try again.' }]);
    }
    setLoading(false);
  }, [loading, messages]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden -m-6">
      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 flex flex-col gap-4">

          {/* Empty state */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center h-full gap-8"
            >
              {/* Icon */}
              <div className="relative">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(124,92,191,0.15), rgba(79,110,247,0.15))',
                    border: '1px solid rgba(124,92,191,0.25)',
                    boxShadow: '0 0 40px rgba(124,92,191,0.12)',
                  }}
                >
                  <Sparkles className="w-9 h-9" style={{ color: '#9d7fe8' }} />
                </div>
                <span
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: '#22c55e', border: '2px solid #0d0d0d' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                </span>
              </div>

              {/* Heading */}
              <div className="text-center max-w-md">
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#f0f0f0' }}>
                  Lumora AI Assistant
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>
                  Ask questions about your customers, campaigns, and segments.
                  Get data-driven recommendations powered by advanced AI.
                </p>
              </div>

              {/* Suggestion cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                {SUGGESTIONS.map(({ icon: Icon, label, prompt }) => (
                  <button
                    key={label}
                    onClick={() => sendMessage(prompt)}
                    className="flex items-start gap-3 p-4 rounded-xl border text-left transition-all group"
                    style={{ borderColor: '#1f1f1f', background: '#161616' }}
                    onMouseEnter={e => {
                      (e.currentTarget).style.borderColor = 'rgba(124,92,191,0.4)';
                      (e.currentTarget).style.background = 'rgba(124,92,191,0.06)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget).style.borderColor = '#1f1f1f';
                      (e.currentTarget).style.background = '#161616';
                    }}
                  >
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: 'rgba(124,92,191,0.12)' }}
                    >
                      <Icon className="w-4 h-4" style={{ color: '#9d7fe8' }} />
                    </span>
                    <span className="text-sm font-medium" style={{ color: '#a1a1aa' }}>{label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Message list */}
          {messages.map((msg, i) => (
            <ChatBubble key={i} message={msg} index={i} />
          ))}

          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div
          className="px-8 py-4 border-t"
          style={{ borderColor: '#1a1a1a', background: '#0d0d0d' }}
        >
          <div
            className="flex gap-3 items-end rounded-2xl border p-3 transition-all"
            style={{ background: '#161616', borderColor: '#242424' }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about campaigns, customers, or segments…  (Enter to send, Shift+Enter for new line)"
              rows={1}
              style={{
                background: 'transparent',
                color: '#f0f0f0',
                resize: 'none',
                maxHeight: 120,
                overflow: 'auto',
              }}
              className="flex-1 px-2 py-1 text-sm outline-none placeholder-zinc-600"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7c5cbf, #4f6ef7)', color: '#fff' }}
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Send className="w-4 h-4" />
              }
            </button>
          </div>
          <p className="text-xs mt-2 text-center" style={{ color: '#3f3f46' }}>
            Lumora AI · Powered by Groq llama-3.3-70b · Responses may not always be accurate
          </p>
        </div>
      </div>

      {/* Context panel */}
      <div
        className="w-72 border-l flex-col flex-shrink-0 hidden lg:flex"
        style={{ borderColor: '#1a1a1a', background: '#0a0a0a' }}
      >
        {/* Panel header */}
        <div className="px-5 py-4 border-b" style={{ borderColor: '#1a1a1a' }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(124,92,191,0.12)' }}
            >
              <Bot className="w-3.5 h-3.5" style={{ color: '#9d7fe8' }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#f0f0f0' }}>AI Context</p>
              <p className="text-xs" style={{ color: '#6b7280' }}>Live data snapshot</p>
            </div>
          </div>
        </div>

        {/* Panel body */}
        <div className="flex-1 overflow-y-auto p-5">
          <ContextPanel onQuickAction={sendMessage} />
        </div>
      </div>
    </div>
  );
}
