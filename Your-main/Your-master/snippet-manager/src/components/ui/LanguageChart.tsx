import { useMemo } from 'react';
import { Snippet, LANGUAGE_COLORS } from '../../types';

interface LanguageChartProps {
  snippets: Snippet[];
}

export default function LanguageChart({ snippets }: LanguageChartProps) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    snippets.forEach(s => {
      counts[s.language] = (counts[s.language] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([lang, count]) => ({
        language: lang,
        count,
        percentage: Math.round((count / snippets.length) * 100),
        color: LANGUAGE_COLORS[lang] || '#6e7681',
      }))
      .sort((a, b) => b.count - a.count);
  }, [snippets]);

  if (data.length === 0) return null;

  return (
    <div className="glass-card p-5 fade-in-up" style={{ animationDelay: '300ms' }}>
      <h3 className="text-sm font-semibold text-dark-200 mb-4">Languages</h3>

      {/* Bar chart */}
      <div className="flex h-3 rounded-full overflow-hidden mb-4 bg-dark-700">
        {data.map((d, i) => (
          <div
            key={d.language}
            className="h-full transition-all duration-500"
            style={{
              width: `${d.percentage}%`,
              backgroundColor: d.color,
              animationDelay: `${i * 100}ms`,
            }}
            title={`${d.language}: ${d.count} (${d.percentage}%)`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {data.map((d, i) => (
          <div
            key={d.language}
            className="flex items-center justify-between fade-in-up"
            style={{ animationDelay: `${300 + i * 60}ms` }}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              <span className="text-xs text-dark-300 capitalize">{d.language}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-dark-500">{d.count}</span>
              <span className="text-xs text-dark-500 w-8 text-right">{d.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
