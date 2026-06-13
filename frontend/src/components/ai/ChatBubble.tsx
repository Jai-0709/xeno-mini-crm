'use client';

import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatBubbleProps {
  message: Message;
  index: number;
}

export function ChatBubble({ message, index }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: isUser ? 'rgba(79,110,247,0.15)' : 'rgba(124,92,191,0.15)',
        }}
      >
        {isUser
          ? <User className="w-4 h-4" style={{ color: '#4f6ef7' }} />
          : <Bot className="w-4 h-4" style={{ color: '#7c5cbf' }} />
        }
      </div>

      {/* Bubble */}
      <div
        className="max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
        style={{
          background: isUser ? 'rgba(79,110,247,0.12)' : '#1a1a1a',
          border: `1px solid ${isUser ? 'rgba(79,110,247,0.2)' : '#1f1f1f'}`,
          color: '#f0f0f0',
          borderRadius: isUser ? '20px 4px 20px 20px' : '4px 20px 20px 20px',
        }}
      >
        {/* Render message with basic markdown: bold, bullet lists */}
        {message.content.split('\n').map((line, i) => {
          if (line.startsWith('**') && line.endsWith('**')) {
            return <p key={i} className="font-semibold mt-1">{line.slice(2, -2)}</p>;
          }
          if (line.startsWith('- ') || line.startsWith('• ')) {
            return (
              <div key={i} className="flex gap-1.5 mt-1">
                <span style={{ color: '#7c5cbf' }}>•</span>
                <span>{line.slice(2)}</span>
              </div>
            );
          }
          if (line.trim() === '') return <div key={i} className="h-2" />;
          return <p key={i} className="mt-0.5">{line}</p>;
        })}
      </div>
    </motion.div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(124,92,191,0.15)' }}>
        <Bot className="w-4 h-4" style={{ color: '#7c5cbf' }} />
      </div>
      <div className="px-4 py-3 rounded-2xl" style={{ background: '#1a1a1a', border: '1px solid #1f1f1f', borderRadius: '4px 20px 20px 20px' }}>
        <div className="flex gap-1 items-center h-4">
          {[0, 0.2, 0.4].map(delay => (
            <motion.div
              key={delay}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#7c5cbf' }}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.8, delay, repeat: Infinity }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
