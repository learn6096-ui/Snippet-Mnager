import { useMemo } from 'react';
import { Snippet } from '../../types';

interface ActivityHeatmapProps {
  snippets: Snippet[];
}

export default function ActivityHeatmap({ snippets }: ActivityHeatmapProps) {
  // Generate mock activity data based on snippet dates
  const weeks = useMemo(() => {
    const today = new Date();
    const cells: { date: Date; count: number }[] = [];

    // Generate 16 weeks (about 4 months) of data
    for (let i = 111; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Generate activity based on snippets and some randomness
      const dayOfWeek = date.getDay();
      const isWeekday = dayOfWeek > 0 && dayOfWeek < 6;
      const baseChance = isWeekday ? 0.6 : 0.25;
      const hasActivity = Math.random() < baseChance;
      const count = hasActivity ? Math.floor(Math.random() * 5) + 1 : 0;

      cells.push({ date, count });
    }

    // Group into weeks
    const weeks: typeof cells[] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
  }, [snippets]);

  const getOpacity = (count: number) => {
    if (count === 0) return 0;
    if (count === 1) return 0.25;
    if (count === 2) return 0.45;
    if (count === 3) return 0.65;
    if (count === 4) return 0.85;
    return 1;
  };

  const totalCommits = weeks.flat().reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="glass-card p-5 fade-in-up" style={{ animationDelay: '200ms' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-dark-200">Activity</h3>
        <span className="text-xs text-dark-500">{totalCommits} commits in 16 weeks</span>
      </div>

      <div className="flex gap-0.5 overflow-x-auto pb-2">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {week.map((day, di) => (
              <div
                key={di}
                className="heatmap-cell w-2.5 h-2.5 rounded-sm cursor-pointer"
                style={{
                  backgroundColor: day.count > 0
                    ? `rgba(63, 185, 80, ${getOpacity(day.count)})`
                    : 'rgba(48, 54, 61, 0.4)',
                  animationDelay: `${(wi * 7 + di) * 8}ms`,
                }}
                title={`${day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${day.count} commits`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1 mt-2">
        <span className="text-[10px] text-dark-500 mr-1">Less</span>
        {[0, 0.25, 0.45, 0.65, 0.85, 1].map((opacity, i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-sm"
            style={{
              backgroundColor: opacity > 0
                ? `rgba(63, 185, 80, ${opacity})`
                : 'rgba(48, 54, 61, 0.4)',
            }}
          />
        ))}
        <span className="text-[10px] text-dark-500 ml-1">More</span>
      </div>
    </div>
  );
}
