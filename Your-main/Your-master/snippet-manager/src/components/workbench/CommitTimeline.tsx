import { SnippetVersion } from '../../types';
import { useStore } from '../../store/useStore';

interface CommitTimelineProps {
  versions: SnippetVersion[];
}

export default function CommitTimeline({ versions }: CommitTimelineProps) {
  const { selectedVersion, selectVersion } = useStore();

  const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (versions.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-dark-700/50 flex items-center justify-center">
          <svg className="w-6 h-6 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-dark-500 text-sm">No commits yet</p>
      </div>
    );
  }

  const reversed = [...versions].reverse();

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-dark-600 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider flex items-center gap-2">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          History
        </h3>
        <span className="text-[10px] text-dark-500 font-mono">{versions.length} commits</span>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 stagger-children">
        {reversed.map((version, idx) => {
          const isActive = selectedVersion?.id === version.id;
          const isLatest = idx === 0;

          return (
            <button
              key={version.id}
              onClick={() => selectVersion(version)}
              className="relative w-full text-left group timeline-node"
            >
              <div className={`flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-accent-blue/8'
                  : 'hover:bg-dark-700/30'
              }`}>
                {/* Timeline dot */}
                <div className="flex flex-col items-center flex-shrink-0 pt-1">
                  <div className={`relative w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                    isActive
                      ? 'border-accent-blue bg-accent-blue/20 shadow-[0_0_10px_rgba(88,166,255,0.4)]'
                      : 'border-dark-500 bg-dark-800 group-hover:border-dark-400'
                  }`}>
                    {isLatest && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-accent-green rounded-full border border-dark-800 animate-pulse" />
                    )}
                    {isActive && (
                      <span className="absolute inset-0 rounded-full bg-accent-blue/30 animate-ping opacity-30" />
                    )}
                  </div>
                  {idx < versions.length - 1 && (
                    <div className={`w-px h-full min-h-[32px] mt-1 transition-colors ${
                      isActive ? 'bg-accent-blue/30' : 'bg-dark-600'
                    }`} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[11px] font-mono font-bold transition-colors ${
                      isActive ? 'text-accent-blue' : 'text-dark-500'
                    }`}>
                      v{version.version}
                    </span>
                    {isLatest && (
                      <span className="text-[9px] font-bold text-accent-green bg-accent-green/15 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                        latest
                      </span>
                    )}
                  </div>
                  <p className={`text-[13px] truncate transition-colors ${
                    isActive ? 'text-dark-100' : 'text-dark-300 group-hover:text-dark-200'
                  }`}>
                    {version.commitMessage}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-dark-500">
                      {formatTimestamp(version.createdAt)}
                    </span>
                    <span className="text-dark-600">&middot;</span>
                    <span className="text-[10px] text-dark-500">
                      {version.author}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
