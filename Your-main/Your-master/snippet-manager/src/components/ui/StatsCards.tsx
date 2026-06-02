import { useMemo } from 'react';
import { Snippet, LANGUAGE_COLORS } from '../../types';
import type { DrawerMode } from './StatsDrawer';

interface StatsCardsProps {
  snippets: Snippet[];
  onStatClick: (mode: DrawerMode) => void;
}

export default function StatsCards({ snippets, onStatClick }: StatsCardsProps) {
  const stats = useMemo(() => {
    const languages = new Set(snippets.map(s => s.language));
    const totalVersions = snippets.reduce((sum, s) => sum + s.latestVersion, 0);
    const mostUsedLang = snippets.reduce((acc, s) => {
      acc[s.language] = (acc[s.language] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topLang = Object.entries(mostUsedLang).sort((a, b) => b[1] - a[1])[0];

    return {
      totalSnippets: snippets.length,
      totalLanguages: languages.size,
      totalVersions,
      topLanguage: topLang ? { name: topLang[0], count: topLang[1] } : null,
    };
  }, [snippets]);

  const cards: {
    label: string;
    value: number | string;
    isText?: boolean;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    borderColor: string;
    clickable: boolean;
    mode: DrawerMode;
    hint: string;
  }[] = [
    {
      label: 'Total Snippets',
      value: stats.totalSnippets,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      color: 'text-accent-blue',
      bgColor: 'bg-accent-blue/10',
      borderColor: 'border-accent-blue/20',
      clickable: true,
      mode: 'snippets',
      hint: 'Click to browse all snippets',
    },
    {
      label: 'Languages',
      value: stats.totalLanguages,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      color: 'text-accent-purple',
      bgColor: 'bg-accent-purple/10',
      borderColor: 'border-accent-purple/20',
      clickable: true,
      mode: 'languages',
      hint: 'Click to see language breakdown',
    },
    {
      label: 'Total Versions',
      value: stats.totalVersions,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-accent-green',
      bgColor: 'bg-accent-green/10',
      borderColor: 'border-accent-green/20',
      clickable: true,
      mode: 'versions',
      hint: 'Click to see all commits',
    },
    {
      label: 'Top Language',
      value: stats.topLanguage?.name || '-',
      isText: true,
      icon: (
        <span
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: stats.topLanguage ? LANGUAGE_COLORS[stats.topLanguage.name] : '#6e7681' }}
        />
      ),
      color: 'text-accent-orange',
      bgColor: 'bg-accent-orange/10',
      borderColor: 'border-accent-orange/20',
      clickable: stats.topLanguage !== null,
      mode: 'languages' as DrawerMode,
      hint: 'Click to see language breakdown',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className={`glass-card p-4 fade-in-up ${card.borderColor} border relative overflow-hidden ${card.clickable ? 'cursor-pointer' : ''} group/card`}
          style={{ animationDelay: `${i * 80}ms` }}
          onClick={() => card.clickable && onStatClick(card.mode)}
          title={card.clickable ? card.hint : undefined}
          id={`stat-card-${card.mode ?? card.label.toLowerCase().replace(' ', '-')}-${i}`}
        >
          {/* Subtle hover overlay */}
          {card.clickable && (
            <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 pointer-events-none rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.02)' }} />
          )}

          <div className="flex items-center justify-between mb-2">
            <span className={`${card.color} ${card.bgColor} p-1.5 rounded-lg`}>
              {card.icon}
            </span>
            {/* Clickable indicator */}
            {card.clickable && (
              <svg className="w-3 h-3 text-dark-600 opacity-0 group-hover/card:opacity-100 transition-opacity"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>

          {/* Value — big clickable number */}
          <p
            className={`${card.isText ? 'text-lg' : 'text-2xl'} font-bold text-dark-100 transition-all duration-200 ${
              card.clickable ? 'group-hover/card:scale-105 group-hover/card:text-white origin-left inline-block' : ''
            }`}
          >
            {card.value}
          </p>
          <p className="text-xs text-dark-500 mt-0.5">{card.label}</p>

          {/* Click hint */}
          {card.clickable && (
            <p className="text-[10px] text-dark-600 mt-1.5 opacity-0 group-hover/card:opacity-100 transition-opacity">
              {card.hint} →
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
