import { useState, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import SnippetCard from './SnippetCard';
import CreateSnippetModal from './CreateSnippetModal';
import ConfirmDeleteDialog from '../ui/ConfirmDeleteDialog';
import StatsCards from '../ui/StatsCards';
import StatsDrawer, { DrawerMode } from '../ui/StatsDrawer';
import ActivityHeatmap from '../ui/ActivityHeatmap';
import LanguageChart from '../ui/LanguageChart';
import { SkeletonCard } from '../ui/SkeletonCard';
import { useNavigate } from 'react-router-dom';
import { Snippet, SnippetVersion } from '../../types';

interface DashboardProps {
  newSnippetOpen: boolean;
  setNewSnippetOpen: (open: boolean) => void;
}

export default function Dashboard({ newSnippetOpen, setNewSnippetOpen }: DashboardProps) {
  const {
    snippets, selectedLanguage,
    selectSnippet, fetchVersions,
    isLoadingSnippets, createSnippet, deleteSnippet,
  } = useStore();
  const navigate = useNavigate();

  // ── Delete state ──
  const [deletingSnippet, setDeletingSnippet] = useState<Snippet | null>(null);

  // ── Stats drawer state ──
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);

  // ── Cached versions for the drawer + version popovers ──
  const [cachedVersions, setCachedVersions] = useState<Record<string, SnippetVersion[]>>({});

  const filtered = selectedLanguage
    ? snippets.filter(s => s.language === selectedLanguage)
    : snippets;

  /* Navigate to workbench */
  const handleSnippetClick = useCallback(async (snippet: Snippet) => {
    selectSnippet(snippet);
    const { data } = await fetchVersions(snippet.id) as unknown as { data: SnippetVersion[] };
    navigate(`/workbench/${snippet.id}`);
  }, [selectSnippet, fetchVersions, navigate]);

  /* Open workbench and also cache versions for popover */
  const handleSnippetOpen = useCallback(async (snippet: Snippet) => {
    selectSnippet(snippet);
    // fetchVersions updates store; also cache locally for the popover
    if (!cachedVersions[snippet.id]) {
      try {
        // use store's raw API call shape
        const versions = await import('../../api/mockApi').then(m =>
          m.api.getVersions(snippet.id).then(r => r.data)
        );
        setCachedVersions(prev => ({ ...prev, [snippet.id]: versions }));
      } catch { /* ignore */ }
    }
    await fetchVersions(snippet.id);
    navigate(`/workbench/${snippet.id}`);
  }, [selectSnippet, fetchVersions, navigate, cachedVersions]);

  /* Version badge click — preload versions without navigating */
  const handleVersionBadgeClick = useCallback(async (snippet: Snippet) => {
    if (!cachedVersions[snippet.id]) {
      try {
        const versions = await import('../../api/mockApi').then(m =>
          m.api.getVersions(snippet.id).then(r => r.data)
        );
        setCachedVersions(prev => ({ ...prev, [snippet.id]: versions }));
      } catch { /* ignore */ }
    }
  }, [cachedVersions]);

  /* Delete confirmed */
  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingSnippet) return;
    await deleteSnippet(deletingSnippet.id);
    setDeletingSnippet(null);
  }, [deletingSnippet, deleteSnippet]);

  /* Create snippet */
  const handleCreate = async (data: {
    title: string; description: string; language: string;
    initialCode: string; commitMessage: string;
  }) => {
    const snippet = await createSnippet(data);
    navigate(`/workbench/${snippet.id}`);
  };

  /* Open stats drawer — for versions mode, collect all cached versions */
  const handleStatClick = (mode: DrawerMode) => setDrawerMode(mode);

  return (
    <div className="flex-1 p-6 overflow-y-auto page-enter">

      {/* ── Stats dashboard ── */}
      {!selectedLanguage && snippets.length > 0 && (
        <div className="mb-6 space-y-4">
          <StatsCards snippets={snippets} onStatClick={handleStatClick} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ActivityHeatmap snippets={snippets} />
            <LanguageChart snippets={snippets} />
          </div>
        </div>
      )}

      {/* ── Section header ── */}
      <div className="flex items-center justify-between mb-5">
        <div className="fade-in-up">
          <h1 className="text-xl font-bold text-dark-100 flex items-center gap-2">
            {selectedLanguage ? (
              <>
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#58a6ff' }} />
                <span className="capitalize">{selectedLanguage}</span>
                <span className="text-dark-500 font-normal text-base ml-1">({filtered.length})</span>
              </>
            ) : (
              <>
                All Snippets
                <span className="text-dark-500 font-normal text-base">({filtered.length})</span>
              </>
            )}
          </h1>
          <p className="text-sm text-dark-500 mt-0.5">
            {selectedLanguage ? `Showing ${selectedLanguage} snippets` : 'Your code snippet collection'}
          </p>
        </div>

        {/* New Snippet button */}
        <button
          id="new-snippet-btn"
          onClick={() => setNewSnippetOpen(true)}
          className="fade-in-up flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, rgba(63,185,80,0.18), rgba(63,185,80,0.08))',
            border: '1px solid rgba(63,185,80,0.35)',
            color: '#3fb950',
          }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Snippet
        </button>
      </div>

      {/* ── Grid ── */}
      {isLoadingSnippets ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center scale-in">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-dark-700/50 flex items-center justify-center">
              <svg className="w-10 h-10 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-dark-300 mb-1">No snippets found</h3>
            <p className="text-dark-500 text-sm max-w-xs mx-auto mb-5">
              {selectedLanguage
                ? `No ${selectedLanguage} snippets yet.`
                : 'Create your first snippet to get started.'}
            </p>
            {!selectedLanguage && (
              <button id="empty-new-snippet-btn" onClick={() => setNewSnippetOpen(true)} className="btn-primary inline-flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Create your first snippet
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
          {filtered.map(snippet => (
            <SnippetCard
              key={snippet.id}
              snippet={snippet}
              onClick={() => handleSnippetOpen(snippet)}
              onDelete={s => setDeletingSnippet(s)}
              versions={cachedVersions[snippet.id]}
              onVersionBadgeClick={handleVersionBadgeClick}
            />
          ))}
        </div>
      )}

      {/* ── Modals & Drawers ── */}
      <CreateSnippetModal
        isOpen={newSnippetOpen}
        onClose={() => setNewSnippetOpen(false)}
        onSubmit={handleCreate}
      />

      <ConfirmDeleteDialog
        isOpen={deletingSnippet !== null}
        snippetTitle={deletingSnippet?.title ?? ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingSnippet(null)}
      />

      <StatsDrawer
        mode={drawerMode}
        snippets={snippets}
        versions={cachedVersions}
        onClose={() => setDrawerMode(null)}
        onSnippetClick={handleSnippetOpen}
      />
    </div>
  );
}
