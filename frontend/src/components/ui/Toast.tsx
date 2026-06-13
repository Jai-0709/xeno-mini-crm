'use client';

import { useToastStore } from '@/store/useToastStore';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const icons = {
  success: <CheckCircle className="w-4 h-4 text-status-success" />,
  error: <XCircle className="w-4 h-4 text-status-danger" />,
  info: <Info className="w-4 h-4 text-accent-blue" />,
  warning: <AlertTriangle className="w-4 h-4 text-status-warning" />,
};

const borders = {
  success: 'border-l-status-success',
  error: 'border-l-status-danger',
  info: 'border-l-accent-blue',
  warning: 'border-l-status-warning',
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast-enter pointer-events-auto flex items-start gap-3 bg-bg-card border border-border border-l-4 ${borders[toast.type]} rounded-btn px-4 py-3 shadow-xl min-w-[300px] max-w-[380px]`}
        >
          <div className="mt-0.5 flex-shrink-0">{icons[toast.type]}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary">{toast.title}</p>
            {toast.message && (
              <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{toast.message}</p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
