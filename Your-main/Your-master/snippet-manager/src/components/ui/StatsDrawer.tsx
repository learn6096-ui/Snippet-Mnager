import { useEffect, useRef } from 'react';
import { Snippet, SnippetVersion, LANGUAGE_COLORS } from '../../types';

export type DrawerMode = 'snippets' | 'languages' | 'versions' | null;

interface StatsDrawerProps {
  mode: DrawerMode;
  snippets: Snippet[];
  /** Pre-loaded versions keyed by snippetId — only filled when mode='versions' */
  versions: Record<string, SnippetVersion[]>;
  onClose: () => void;
  onSnippetClick: (snippet: Snippet) => void;
}

const LANG_ICONS: Record<string, string> = {
  typescript: '🔷', javascript: '🟡', python: '🐍', java: '☕',
  rust: '🦀', go: '🐹', cpp: '⚙️', html: '🌐', css: '🎨',
  sql: '🗄️', bash: '🖥️', ruby: '💎',
};

export default function StatsDrawer({
  mode, snippets, versions, onClose, onSnippetClick,
}: StatsDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!mode) return null;

  /* ── Build content based on mode ── */
  const title = mode === 'snippets'   ? 'All Snippets'
              : mode === 'languages'  ? 'Languages Breakdown'
              :                        'All Versions';

  const subtitle = mode === 'snippets'  ? `${snippets.length} snippet${snippets.length !== 1 ? 's' : ''} in your collection`
                 : mode === 'languages' ? `${new Set(snippets.map(s => s.language)).size} languages used`
                 :                       `${snippets.reduce((s, n) => s + n.latestVersion, 0)} total commits across all snippets`;

  /* languages grouped */
  const langGroups = snippets.reduce((acc, s) => {
    if (!acc[s.language]) acc[s.language] = [];
    acc[s.language].push(s);
    return acc;
  }, {} as Record<string, Snippet[]>);
  const langList = Object.entries(langGroups).sort((a, b) => b[1].length - a[1].length);

  /* all versions flat */
  const allVersions = Object.entries(versions)
    .flatMap(([snippetId, vList]) => vList.map(v => ({ ...v, snippetTitle: snippets.find(s => s.id === snippetId)?.title ?? snippetId })))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const formatDate = (d: string) => {
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff}d ago`;
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease' }}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        className="fixed right-0 top-0 bottom-0 z-50 w-96 flex flex-col"
        style={{
          background: 'linear-gradient(180deg, #161b22 0%, #0d1117 100%)',
          borderLeft: '1px solid #30363d',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
          animation: 'slideInRight 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
        }}
        role="dialog"
        aria-label={title}
      >
        {/* Top accent */}
        <div className="h-0.5 w-full flex-shrink-0"
          style={{ background: 'linear-gradient(90deg, #58a6ff, #bc8cff, #3fb950)' }} />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-600 flex-shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-dark-100">{title}</h2>
            <p className="text-xs text-dark-500 mt-0.5">{subtitle}</p>
          </div>
          <button id="drawer-close-btn" onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* ─── SNIPPETS MODE ─── */}
          {mode === 'snippets' && (
            <div className="p-4 space-y-2 stagger-children">
              {snippets.map(s => {
                const color = LANGUAGE_COLORS[s.language] || '#6e7681';
                return (
                  <button
                    key={s.id}
                    id={`drawer-snip-${s.id}`}
                    onClick={() => { onSnippetClick(s); onClose(); }}
                    className="w-full text-left p-3 rounded-xl transition-all duration-150 group"
                    style={{ background: 'rgba(33,38,45,0.6)', border: '1px solid #30363d' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${color}50`; (e.currentTarget as HTMLElement).style.background = `rgba(33,38,45,0.9)`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#30363d'; (e.currentTarget as HTMLElement).style.background = 'rgba(33,38,45,0.6)'; }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                          <span className="text-sm font-medium text-dark-200 truncate group-hover:text-dark-100">{s.title}</span>
                        </div>
                        {s.description && (
                          <p className="text-xs text-dark-500 ml-4 truncate">{s.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                          style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
                          v{s.latestVersion}
                        </span>
                        <svg className="w-3.5 h-3.5 text-dark-600 group-hover:text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* ─── LANGUAGES MODE ─── */}
          {mode === 'languages' && (
            <div className="p-4 space-y-3 stagger-children">
              {langList.map(([lang, items]) => {
                const color = LANGUAGE_COLORS[lang] || '#6e7681';
                const pct = Math.round((items.length / snippets.length) * 100);
                return (
                  <div key={lang} className="rounded-xl overflow-hidden"
                    style={{ background: 'rgba(33,38,45,0.6)', border: '1px solid #30363d' }}>
                    {/* Lang header */}
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{LANG_ICONS[lang] ?? '📄'}</span>
                        <div>
                          <p className="text-sm font-semibold capitalize" style={{ color }}>{lang}</p>
                          <p className="text-[11px] text-dark-500">{items.length} snippet{items.length !== 1 ? 's' : ''} · {pct}%</p>
                        </div>
                      </div>
                      <span className="text-xl font-bold" style={{ color }}>{items.length}</span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1 mx-4 mb-3 rounded-full bg-dark-700">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
                    </div>
                    {/* Snippet list under lang */}
                    <div className="px-3 pb-3 space-y-1">
                      {items.map(s => (
                        <button
                          key={s.id}
                          id={`drawer-lang-snip-${s.id}`}
                          onClick={() => { onSnippetClick(s); onClose(); }}
                          className="w-full text-left flex items-center justify-between px-2 py-1.5 rounded-lg transition-all"
                          style={{ color: '#8b949e' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(88,166,255,0.05)'; (e.currentTarget as HTMLElement).style.color = '#c9d1d9'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#8b949e'; }}
                        >
                          <span className="text-xs truncate">{s.title}</span>
                          <span className="text-[10px] font-mono ml-2 flex-shrink-0">v{s.latestVersion}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ─── VERSIONS MODE ─── */}
          {mode === 'versions' && (
            <div className="p-4 space-y-2 stagger-children">
              {allVersions.length === 0 ? (
                <div className="text-center py-12 text-dark-500 text-sm">
                  No versions loaded yet. Open a snippet first.
                </div>
              ) : (
                allVersions.map((v, i) => (
                  <div
                    key={v.id}
                    id={`drawer-ver-${v.id}`}
                    className="p-3 rounded-xl"
                    style={{ background: 'rgba(33,38,45,0.6)', border: '1px solid #30363d' }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Version number badge */}
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold font-mono"
                        style={{ background: 'rgba(88,166,255,0.15)', color: '#58a6ff', border: '1px solid rgba(88,166,255,0.25)' }}>
                        {v.version}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-xs font-medium text-dark-200 truncate">{v.snippetTitle}</p>
                          <span className="text-[10px] text-dark-600 ml-2 flex-shrink-0">{formatDate(v.createdAt)}</span>
                        </div>
                        <p className="text-[11px] text-dark-400 truncate">{v.commitMessage}</p>
                        <p className="text-[10px] text-dark-600 mt-0.5">{v.author}</p>
                      </div>
                    </div>
                    {/* Timeline line connector */}
                    {i < allVersions.length - 1 && (
                      <div className="ml-3.5 mt-2 w-px h-2 bg-dark-700" />
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-dark-600 flex-shrink-0">
          <p className="text-[11px] text-dark-600 text-center">
            Click any item to navigate · Press <kbd className="kbd text-[9px]">Esc</kbd> to close
          </p>
        </div>
      </div>
    </>
  );
}
