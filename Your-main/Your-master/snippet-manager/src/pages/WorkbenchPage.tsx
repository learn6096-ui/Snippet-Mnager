import { useEffect, useState, useCallback } from 'react';
import CodeWorkbench from '../components/workbench/CodeWorkbench';
import CommandPalette from '../components/ui/CommandPalette';
import { ToastContainer } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { useStore } from '../store/useStore';
import { useNavigate, useParams } from 'react-router-dom';

export default function WorkbenchPage() {
  const { user, selectedSnippet, snippets, fetchSnippets, selectSnippet, fetchVersions, logout } = useStore();
  const navigate = useNavigate();
  const { snippetId } = useParams<{ snippetId: string }>();
  const [cmdOpen, setCmdOpen] = useState(false);
  const { toasts, toast, dismissToast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const loadSnippet = async () => {
      if (snippets.length === 0) {
        await fetchSnippets();
      }
      if (snippetId && (!selectedSnippet || selectedSnippet.id !== snippetId)) {
        const snippet = snippets.find(s => s.id === snippetId);
        if (snippet) {
          selectSnippet(snippet);
          await fetchVersions(snippet.id);
        } else {
          navigate('/dashboard');
        }
      }
    };

    loadSnippet();
  }, [user, snippetId, selectedSnippet, snippets, fetchSnippets, selectSnippet, fetchVersions, navigate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(prev => !prev);
      }
      if (e.key === 'Escape') setCmdOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!user) return null;

  return (
    <div className="h-screen flex flex-col bg-dark-900 noise-overlay">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />

      {/* Top bar */}
      <header className="h-14 bg-dark-800/90 border-b border-dark-600 flex items-center justify-between px-4 flex-shrink-0 backdrop-blur-sm">
        <div className="flex items-center gap-3 fade-in-up">
          <button onClick={() => navigate('/dashboard')} className="btn-ghost p-1.5 rounded-lg">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
          </button>
          <span className="font-semibold text-dark-100 text-sm">SnipVCS</span>
          <span className="text-dark-600 mx-1">/</span>
          <span className="text-dark-400 text-sm truncate max-w-[200px]">{selectedSnippet?.title || 'Loading...'}</span>
        </div>

        <div className="flex items-center gap-3 fade-in-up" style={{ animationDelay: '100ms' }}>
          <button
            onClick={() => setCmdOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-dark-700/50 border border-dark-600 rounded-lg text-dark-400 text-xs hover:border-dark-500 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="hidden sm:block">Search...</span>
            <span className="flex items-center gap-0.5 ml-1">
              <span className="kbd text-[9px]">&cmd;</span>
              <span className="kbd text-[9px]">K</span>
            </span>
          </button>

          <div className="flex items-center gap-2">
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="w-7 h-7 rounded-full bg-dark-700 border border-dark-600"
            />
            <span className="text-sm text-dark-300 hidden sm:block">{user.username}</span>
          </div>
          <button
            onClick={() => { logout(); navigate('/auth'); }}
            className="btn-ghost text-xs text-dark-400"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Workbench */}
      <div className="flex-1 overflow-hidden">
        <CodeWorkbench />
      </div>
    </div>
  );
}
