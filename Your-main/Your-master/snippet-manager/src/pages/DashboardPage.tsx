import { useEffect, useState, useCallback } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Dashboard from '../components/dashboard/Dashboard';
import CommandPalette from '../components/ui/CommandPalette';
import { ToastContainer } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { Snippet } from '../types';

export default function DashboardPage() {
  const { user, snippets, fetchSnippets, logout, selectSnippet, fetchVersions, sidebarCollapsed, toggleSidebar } = useStore();
  const navigate = useNavigate();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [newSnippetOpen, setNewSnippetOpen] = useState(false);
  const { toasts, toast, dismissToast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (snippets.length === 0) {
      fetchSnippets();
    }
  }, [user, snippets.length, fetchSnippets, navigate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(prev => !prev);
      }
      // Ctrl+N / Cmd+N → open new snippet modal
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setNewSnippetOpen(true);
      }
      if (e.key === 'Escape') {
        setCmdOpen(false);
        setNewSnippetOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSnippetClick = useCallback(async (snippet: Snippet) => {
    selectSnippet(snippet);
    await fetchVersions(snippet.id);
    navigate(`/workbench/${snippet.id}`);
    toast.info('Opened snippet', snippet.title);
  }, [selectSnippet, fetchVersions, navigate, toast]);

  if (!user) return null;

  return (
    <div className="h-screen flex flex-col bg-dark-900 noise-overlay">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />

      {/* Top bar */}
      <header className="h-14 bg-dark-800/90 border-b border-dark-600 flex items-center justify-between px-4 flex-shrink-0 backdrop-blur-sm">
        <div className="flex items-center gap-3 fade-in-up">
          <button onClick={toggleSidebar} className="btn-ghost p-1.5 rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <span className="font-semibold text-dark-100 text-sm">SnipVCS</span>
          </div>
        </div>

        <div className="flex items-center gap-3 fade-in-up" style={{ animationDelay: '100ms' }}>
          {/* New snippet button in header */}
          <button
            id="header-new-snippet-btn"
            onClick={() => setNewSnippetOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: 'rgba(63,185,80,0.12)',
              border: '1px solid rgba(63,185,80,0.3)',
              color: '#3fb950',
            }}
            title="New Snippet (Ctrl+N)"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New
          </button>

          {/* Search trigger */}
          <button
            onClick={() => setCmdOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-dark-700/50 border border-dark-600 rounded-lg text-dark-400 text-xs hover:border-dark-500 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Search...</span>
            <span className="flex items-center gap-0.5 ml-2">
              <span className="kbd text-[9px]">&cmd;</span>
              <span className="kbd text-[9px]">K</span>
            </span>
          </button>

          {/* User */}
          <div className="flex items-center gap-2">
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="w-7 h-7 rounded-full bg-dark-700 border border-dark-600"
            />
            <span className="text-sm text-dark-300 hidden sm:block">{user.username}</span>
          </div>
          <button
            onClick={() => { logout(); navigate('/auth'); toast.info('Signed out'); }}
            className="btn-ghost text-xs text-dark-400"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {!sidebarCollapsed && (
          <Sidebar snippets={snippets} onSnippetClick={handleSnippetClick} />
        )}
        <Dashboard newSnippetOpen={newSnippetOpen} setNewSnippetOpen={setNewSnippetOpen} />
      </div>
    </div>
  );
}
