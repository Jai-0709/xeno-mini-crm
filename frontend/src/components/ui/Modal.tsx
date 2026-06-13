'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: number;
}

export function Modal({ open, onClose, title, children, maxWidth = 560 }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            ref={ref}
            className="relative z-10 w-full rounded-xl border overflow-hidden"
            style={{
              maxWidth,
              background: '#161616',
              borderColor: '#1f1f1f',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
            }}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#1f1f1f' }}>
                <h2 className="text-base font-semibold" style={{ color: '#f0f0f0' }}>{title}</h2>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg transition-colors"
                  style={{ color: '#6b7280' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#f0f0f0')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
