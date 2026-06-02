import { useMemo, useState } from 'react';
import { useStore } from '../../store/useStore';
import { Snippet, LANGUAGE_COLORS } from '../../types';

interface SidebarProps {
  snippets: Snippet[];
  onSnippetClick: (snippet: Snippet) => void;
}

export default function Sidebar({ snippets, onSnippetClick }: SidebarProps) {
  const { selectedSnippet, selectedLanguage, setSelectedLanguage } = useStore();
  const [expandedLang, setExpandedLang] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const languageGroups = useMemo(() => {
    const groups: Record<string, Snippet[]> = {};
    snippets.forEach(s => {
      if (!groups[s.language]) groups[s.language] = [];
      groups[s.language].push(s);
    });
    return Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
  }, [snippets]);

  const filteredSnippets = useMemo(() => {
    let filtered = selectedLanguage
      ? snippets.filter(s => s.language === selectedLanguage)
      : snippets;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        s => s.title.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [snippets, selectedLanguage, searchQuery]);

  return (
    <aside className="w-72 bg-dark-800/80 border-r border-dark-600 flex flex-col h-full slide-in-left backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-dark-600">
        <h2 className="text-sm font-semibold text-dark-300 uppercase tracking-wider flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          Explorer
        </h2>
      </div>

      {/* Search */}
      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <svg className="w-3.5 h-3.5 text-dark-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Filter snippets..."
            className="w-full bg-dark-900/60 border border-dark-600 rounded-lg pl-9 pr-3 py-1.5 text-xs text-dark-200
                       placeholder-dark-500 focus:outline-none focus:border-accent-blue/50 transition-all"
          />
        </div>
      </div>

      {/* Language filters */}
      <div className="px-3 pb-3 border-b border-dark-600">
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => { setSelectedLanguage(null); setExpandedLang(null); }}
            className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
              !selectedLanguage
                ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/30'
                : 'text-dark-400 hover:text-dark-300 hover:bg-dark-700/50'
            }`}
          >
            All ({snippets.length})
          </button>
          {languageGroups.map(([lang, items]) => (
            <button
              key={lang}
              onClick={() => {
                setSelectedLanguage(selectedLanguage === lang ? null : lang);
                setExpandedLang(selectedLanguage === lang ? null : lang);
              }}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 ${
                selectedLanguage === lang
                  ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/30'
                  : 'text-dark-400 hover:text-dark-300 hover:bg-dark-700/50'
              }`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: LANGUAGE_COLORS[lang] || '#6e7681' }}
              />
              {lang}
              <span className="text-dark-500">({items.length})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Snippet list */}
      <div className="flex-1 overflow-y-auto stagger-children">
        {filteredSnippets.length === 0 ? (
          <div className="p-4 text-center text-dark-500 text-xs">
            {searchQuery ? 'No matching snippets' : 'No snippets yet'}
          </div>
        ) : (
          filteredSnippets.map(snippet => {
            const isActive = selectedSnippet?.id === snippet.id;
            return (
              <button
                key={snippet.id}
                onClick={() => onSnippetClick(snippet)}
                className={`w-full text-left px-4 py-3 border-b border-dark-700/30 transition-all group
                  ${isActive
                    ? 'bg-accent-blue/8 border-l-2 border-l-accent-blue'
                    : 'hover:bg-dark-700/30 border-l-2 border-l-transparent hover:border-l-dark-500'
                  }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0 transition-transform group-hover:scale-125"
                    style={{ backgroundColor: LANGUAGE_COLORS[snippet.language] || '#6e7681' }}
                  />
                  <span className={`text-sm font-medium truncate transition-colors ${
                    isActive ? 'text-accent-blue' : 'text-dark-200 group-hover:text-dark-100'
                  }`}>
                    {snippet.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-[10px] text-dark-500 font-mono">v{snippet.latestVersion}</span>
                  <span className="text-dark-600">&middot;</span>
                  <span className="text-[10px] text-dark-500">{snippet.language}</span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer with snippet count */}
      <div className="p-3 border-t border-dark-600 text-[11px] text-dark-500 flex items-center justify-between">
        <span>{filteredSnippets.length} snippet{filteredSnippets.length !== 1 ? 's' : ''}</span>
        <span className="flex items-center gap-1">
          <span className="kbd text-[9px]">⌘</span>
          <span className="kbd text-[9px]">K</span>
          <span className="ml-1">to search</span>
        </span>
      </div>
    </aside>
  );
}
