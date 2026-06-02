import { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { Snippet, LANGUAGE_COLORS } from '../../types';
import { useNavigate } from 'react-router-dom';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
  shortcut?: string;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { snippets, selectSnippet, fetchVersions, logout } = useStore();

  const commands: Command[] = useMemo(() => {
    const snippetCommands: Command[] = snippets.map(s => ({
      id: `snippet-${s.id}`,
      label: s.title,
      description: `${s.language} \u00b7 v${s.latestVersion}`,
      icon: (
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: LANGUAGE_COLORS[s.language] || '#6e7681' }}
        />
      ),
      action: async () => {
        selectSnippet(s);
        await fetchVersions(s.id);
        navigate(`/workbench/${s.id}`);
        onClose();
      },
      category: 'Snippets',
    }));

    const navCommands: Command[] = [
      {
        id: 'nav-dashboard',
        label: 'Go to Dashboard',
        description: 'View all snippets',
        icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
        action: () => { navigate('/dashboard'); onClose(); },
        category: 'Navigation',
      },
      {
        id: 'action-logout',
        label: 'Sign Out',
        description: 'Log out of your account',
        icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
        action: () => { logout(); navigate('/auth'); onClose(); },
        category: 'Actions',
      },
    ];

    return [...navCommands, ...snippetCommands];
  }, [snippets, selectSnippet, fetchVersions, navigate, logout, onClose]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const lower = query.toLowerCase();
    return commands.filter(
      c => c.label.toLowerCase().includes(lower) ||
           c.description?.toLowerCase().includes(lower) ||
           c.category.toLowerCase().includes(lower)
    );
  }, [commands, query]);

  const grouped = useMemo(() => {
    const groups: Record<string, Command[]> = {};
    filtered.forEach(c => {
      if (!groups[c.category]) groups[c.category] = [];
      groups[c.category].push(c);
    });
    return groups;
  }, [filtered]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const item = listRef.current?.children[selectedIndex] as HTMLElement;
    item?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        filtered[selectedIndex]?.action();
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  if (!isOpen) return null;

  let flatIndex = 0;

  return (
    <div className="fixed inset-0 z-[90]" onKeyDown={handleKeyDown}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 command-palette-backdrop"
        onClick={onClose}
      />

      {/* Palette */}
      <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-full max-w-xl command-palette">
        <div className="glass-card overflow-hidden rounded-2xl shadow-2xl shadow-black/50">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-dark-600">
            <svg className="w-5 h-5 text-dark-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search snippets, commands..."
              className="flex-1 bg-transparent text-dark-100 placeholder-dark-500 outline-none text-sm"
            />
            <span className="kbd">ESC</span>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-dark-500 text-sm">
                No results found for "{query}"
              </div>
            ) : (
              Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  <div className="px-4 py-1.5 text-[11px] font-semibold text-dark-500 uppercase tracking-wider">
                    {category}
                  </div>
                  {items.map(command => {
                    const idx = flatIndex++;
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={command.id}
                        onClick={command.action}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          isSelected ? 'bg-accent-blue/10 text-dark-100' : 'text-dark-300 hover:bg-dark-700/50'
                        }`}
                      >
                        <span className={`flex-shrink-0 ${isSelected ? 'text-accent-blue' : 'text-dark-500'}`}>
                          {command.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium truncate block">{command.label}</span>
                          {command.description && (
                            <span className="text-xs text-dark-500 truncate block">{command.description}</span>
                          )}
                        </div>
                        {command.shortcut && <span className="kbd">{command.shortcut}</span>}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 px-4 py-2.5 border-t border-dark-600 text-[11px] text-dark-500">
            <span className="flex items-center gap-1"><span className="kbd">&uarr;&darr;</span> navigate</span>
            <span className="flex items-center gap-1"><span className="kbd">&crarr;</span> select</span>
            <span className="flex items-center gap-1"><span className="kbd">esc</span> close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
