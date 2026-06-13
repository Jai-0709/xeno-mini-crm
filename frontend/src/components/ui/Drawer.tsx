'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  width?: number;
  children: React.ReactNode;
}

export function Drawer({ open, onClose, title, width = 480, children }: DrawerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Drawer panel */}
          <motion.div
            ref={ref}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{ width }}
            className="fixed right-0 top-0 bottom-0 z-50 bg-bg-card border-l border-border flex flex-col overflow-hidden"
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
                <h2 className="text-base font-semibold text-text-primary">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {/* Content */}
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
