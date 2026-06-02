import { useState } from 'react';
import { Snippet, SnippetVersion, LANGUAGE_COLORS } from '../../types';

interface SnippetCardProps {
  snippet: Snippet;
  onClick: () => void;
  onDelete: (snippet: Snippet) => void;
  /** Pre-loaded versions for the mini popover; undefined = not yet fetched */
  versions?: SnippetVersion[];
  onVersionBadgeClick?: (snippet: Snippet) => void;
}

export default function SnippetCard({
  snippet, onClick, onDelete, versions, onVersionBadgeClick,
}: SnippetCardProps) {
  const langColor = LANGUAGE_COLORS[snippet.language] || '#6e7681';
  const [vPopover, setVPopover] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const diffDays = Math.floor((Date.now() - date.getTime()) / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="glass-card gradient-border card-3d p-5 group relative w-full text-left">

      {/* ── Top row: language badge + action buttons ── */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="language-badge"
          style={{
            backgroundColor: `${langColor}12`,
            color: langColor,
            border: `1px solid ${langColor}25`,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse" style={{ backgroundColor: langColor }} />
          {snippet.language}
        </span>

        <div className="flex items-center gap-1.5">
          {/* ── Clickable version badge — opens mini popover ── */}
          <div className="relative">
            <button
              id={`ver-badge-${snippet.id}`}
              onClick={e => {
                e.stopPropagation();
                if (onVersionBadgeClick) onVersionBadgeClick(snippet);
                setVPopover(p => !p);
              }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono transition-all duration-200 hover:scale-105"
              style={{
                background: `${langColor}18`,
                color: langColor,
                border: `1px solid ${langColor}35`,
              }}
              title="Click to see version history"
            >
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              v{snippet.latestVersion}
            </button>

            {/* Mini version popover */}
            {vPopover && versions && versions.length > 0 && (
              <>
                {/* Backdrop to close */}
                <div className="fixed inset-0 z-40" onClick={() => setVPopover(false)} />
                <div
                  className="absolute right-0 top-7 z-50 w-72 rounded-xl shadow-2xl overflow-hidden"
                  style={{
                    background: 'linear-gradient(180deg, #1c2128 0%, #161b22 100%)',
                    border: '1px solid #30363d',
                    animation: 'fadeInDown 0.2s cubic-bezier(0.16,1,0.3,1) forwards',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="px-4 py-2.5 border-b border-dark-600 flex items-center justify-between">
                    <p className="text-xs font-semibold text-dark-200">Version History</p>
                    <span className="text-[10px] text-dark-500">{versions.length} commits</span>
                  </div>
                  {/* List */}
                  <div className="max-h-52 overflow-y-auto">
                    {[...versions].reverse().map((v, i) => (
                      <div
                        key={v.id}
                        className="flex items-start gap-3 px-4 py-2.5 border-b border-dark-700/40 last:border-0"
                      >
                        <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold font-mono"
                          style={{
                            background: i === 0 ? `${langColor}22` : 'rgba(33,38,45,0.8)',
                            color: i === 0 ? langColor : '#6e7681',
                            border: `1px solid ${i === 0 ? `${langColor}40` : '#30363d'}`,
                          }}>
                          {v.version}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-dark-300 truncate leading-tight">{v.commitMessage}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[10px] text-dark-600">{v.author}</p>
                            <span className="text-dark-700">·</span>
                            <p className="text-[10px] text-dark-600">{formatDate(v.createdAt)}</p>
                          </div>
                        </div>
                        {i === 0 && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: `${langColor}18`, color: langColor, border: `1px solid ${langColor}30` }}>
                            HEAD
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  {/* Footer */}
                  <div className="px-4 py-2 border-t border-dark-600">
                    <button
                      onClick={() => { setVPopover(false); onClick(); }}
                      className="text-[11px] text-accent-blue hover:text-blue-300 transition-colors w-full text-center"
                    >
                      Open in Workbench →
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* If versions not loaded yet, just open workbench */}
            {vPopover && !versions && (
              <div className="absolute right-0 top-7 z-50 w-44 rounded-xl px-3 py-2.5"
                style={{ background: '#1c2128', border: '1px solid #30363d', animation: 'fadeInDown 0.18s ease' }}>
                <p className="text-[11px] text-dark-400 mb-2">Load versions?</p>
                <button onClick={() => { setVPopover(false); onClick(); }}
                  className="text-[11px] text-accent-blue hover:underline">
                  Open in Workbench →
                </button>
              </div>
            )}
          </div>

          {/* ── Delete button ── */}
          <button
            id={`del-btn-${snippet.id}`}
            onClick={e => { e.stopPropagation(); onDelete(snippet); }}
            className="p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
            style={{ color: '#6e7681' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f85149'; (e.currentTarget as HTMLElement).style.background = 'rgba(248,81,73,0.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#6e7681'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            title="Delete snippet"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Clickable main area ── */}
      <button className="w-full text-left" onClick={onClick}>
        {/* Title */}
        <h3 className="text-dark-100 font-semibold text-[15px] mb-2 group-hover:text-accent-blue transition-colors duration-200 line-clamp-1">
          {snippet.title}
        </h3>

        {/* Description */}
        <p className="text-dark-400 text-sm mb-4 line-clamp-2 leading-relaxed">
          {snippet.description || <span className="italic text-dark-600">No description</span>}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-dark-500">{formatDate(snippet.updatedAt)}</span>
          <div className="flex items-center gap-1 text-dark-500 group-hover:text-accent-blue transition-all group-hover:translate-x-0.5">
            <span className="text-[11px]">Open</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </button>

      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(400px circle at 50% 50%, ${langColor}06, transparent 60%)` }}
      />
    </div>
  );
}
