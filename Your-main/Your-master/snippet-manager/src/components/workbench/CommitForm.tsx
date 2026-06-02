import { useState } from 'react';
import { useStore } from '../../store/useStore';

interface CommitFormProps {
  snippetId: string;
  onCommit?: () => void;
}

export default function CommitForm({ snippetId, onCommit }: CommitFormProps) {
  const [message, setMessage] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitSuccess, setCommitSuccess] = useState(false);
  const { editorCode, commitVersion, selectedVersion } = useStore();

  const handleCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !editorCode) return;

    setIsCommitting(true);
    try {
      await commitVersion(snippetId, message.trim(), editorCode);
      setMessage('');
      setCommitSuccess(true);
      setTimeout(() => setCommitSuccess(false), 2000);
      onCommit?.();
    } catch (err) {
      console.error('Commit failed:', err);
    } finally {
      setIsCommitting(false);
    }
  };

  const nextVersion = (selectedVersion?.version || 0) + 1;

  return (
    <form
      onSubmit={handleCommit}
      className="flex items-center gap-3 px-4 py-3 bg-dark-800/90 border-t border-dark-600 backdrop-blur-sm"
    >
      {/* Version indicator */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 ${
          commitSuccess
            ? 'bg-accent-green/20 border border-accent-green/30'
            : 'bg-dark-700 border border-dark-600'
        }`}>
          {commitSuccess ? (
            <svg className="w-4 h-4 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <span className="text-[11px] font-mono text-dark-400 font-bold">v{nextVersion}</span>
          )}
        </div>
      </div>

      {/* Input */}
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Commit message (e.g., 'Fix error handling')"
        className="flex-1 bg-dark-900/60 border border-dark-600 rounded-lg px-3 py-2 text-sm text-dark-200
                   placeholder-dark-500 focus:outline-none focus:border-accent-blue/50 focus:ring-1
                   focus:ring-accent-blue/20 transition-all font-mono"
        disabled={isCommitting}
      />

      {/* Submit */}
      <button
        type="submit"
        disabled={!message.trim() || isCommitting}
        className="btn-primary flex items-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
      >
        {isCommitting ? (
          <>
            <div className="spinner w-3.5 h-3.5" />
            Committing...
          </>
        ) : commitSuccess ? (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Committed!
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Commit
          </>
        )}
      </button>
    </form>
  );
}
