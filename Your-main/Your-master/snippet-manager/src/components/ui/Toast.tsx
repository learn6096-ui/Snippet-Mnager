import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const icons: Record<ToastType, string> = {
  success: 'M5 13l4 4L19 7',
  error: 'M6 18L18 6M6 6l12 12',
  info: 'M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z',
  warning: 'M12 9v2m0 4h.01M10.29 3.86l-8.57 14.57a1 1 0 00.86 1.57h17.14a1 1 0 00.86-1.57L11.71 3.86a1 1 0 00-1.72 0z',
};

const colors: Record<ToastType, { bg: string; border: string; icon: string; progress: string }> = {
  success: {
    bg: 'bg-accent-green/10',
    border: 'border-accent-green/30',
    icon: 'text-accent-green',
    progress: 'bg-accent-green',
  },
  error: {
    bg: 'bg-accent-red/10',
    border: 'border-accent-red/30',
    icon: 'text-accent-red',
    progress: 'bg-accent-red',
  },
  info: {
    bg: 'bg-accent-blue/10',
    border: 'border-accent-blue/30',
    icon: 'text-accent-blue',
    progress: 'bg-accent-blue',
  },
  warning: {
    bg: 'bg-accent-orange/10',
    border: 'border-accent-orange/30',
    icon: 'text-accent-orange',
    progress: 'bg-accent-orange',
  },
};

export function Toast({ toast, onDismiss }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const c = colors[toast.type];
  const duration = toast.duration || 4000;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss(toast.id), 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [toast.id, duration, onDismiss]);

  return (
    <div
      className={`${isExiting ? 'toast-exit' : 'toast-enter'} w-80 ${c.bg} border ${c.border} rounded-xl
                  backdrop-blur-xl shadow-2xl shadow-black/30 overflow-hidden`}
    >
      <div className="flex items-start gap-3 p-4">
        <div className={`flex-shrink-0 ${c.icon}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icons[toast.type]} />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-dark-100">{toast.title}</p>
          {toast.message && <p className="text-xs text-dark-400 mt-0.5">{toast.message}</p>}
        </div>
        <button
          onClick={() => { setIsExiting(true); setTimeout(() => onDismiss(toast.id), 300); }}
          className="flex-shrink-0 text-dark-500 hover:text-dark-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="h-0.5 bg-dark-700">
        <div className={`h-full ${c.progress} toast-progress`} style={{ animationDuration: `${duration}ms` }} />
      </div>
    </div>
  );
}

export function ToastContainer({ toasts, onDismiss }: { toasts: ToastMessage[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
