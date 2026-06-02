import { useEffect, useRef, useState } from 'react';

interface ConfirmDeleteProps {
  isOpen: boolean;
  snippetTitle: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export default function ConfirmDeleteDialog({
  isOpen, snippetTitle, onConfirm, onCancel,
}: ConfirmDeleteProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [typed, setTyped] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTyped('');
      setIsDeleting(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onCancel]);

  const canDelete = typed.trim().toLowerCase() === 'delete';

  const handleConfirm = async () => {
    if (!canDelete) return;
    setIsDeleting(true);
    try { await onConfirm(); } finally { setIsDeleting(false); }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.15s ease' }}
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        className="glass-card w-full max-w-md"
        style={{ animation: 'command-palette-enter 0.2s cubic-bezier(0.16,1,0.3,1) forwards' }}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="del-title"
      >
        {/* Red accent bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
          style={{ background: 'linear-gradient(90deg, #f85149, #ff6b6b)' }} />

        <div className="p-6">
          {/* Icon + title */}
          <div className="flex items-start gap-4 mb-5">
            <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center"
              style={{ background: 'rgba(248,81,73,0.15)', border: '1px solid rgba(248,81,73,0.3)' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#f85149" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h2 id="del-title" className="text-base font-semibold text-dark-100 mb-1">Delete Snippet</h2>
              <p className="text-sm text-dark-400 leading-relaxed">
                This will permanently delete <span className="text-dark-200 font-medium">"{snippetTitle}"</span> and all its versions and comparisons. This action cannot be undone.
              </p>
            </div>
          </div>

          {/* Confirmation input */}
          <div className="mb-5">
            <label className="block text-xs text-dark-500 mb-2">
              Type <span className="text-accent-red font-mono font-semibold">delete</span> to confirm
            </label>
            <input
              id="delete-confirm-input"
              ref={inputRef}
              value={typed}
              onChange={e => setTyped(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleConfirm(); }}
              className="input-field"
              placeholder="delete"
              autoComplete="off"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button id="del-cancel-btn" onClick={onCancel} className="btn-ghost text-sm">
              Cancel
            </button>
            <button
              id="del-confirm-btn"
              onClick={handleConfirm}
              disabled={!canDelete || isDeleting}
              className="btn-danger flex items-center gap-2"
            >
              {isDeleting ? (
                <><div className="spinner" style={{ width: 14, height: 14, borderTopColor: '#f85149' }} /> Deleting…</>
              ) : (
                <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg> Delete snippet</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
