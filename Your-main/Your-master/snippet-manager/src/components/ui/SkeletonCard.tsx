export function SkeletonCard() {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="skeleton w-20 h-5 rounded-full" />
        <div className="skeleton w-8 h-4" />
      </div>
      <div className="skeleton w-3/4 h-5 mb-2" />
      <div className="skeleton w-full h-4 mb-1" />
      <div className="skeleton w-2/3 h-4 mb-4" />
      <div className="skeleton w-1/3 h-3" />
    </div>
  );
}

export function SkeletonSidebar() {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="skeleton w-2 h-2 rounded-full" />
          <div className="skeleton flex-1 h-4" style={{ width: `${60 + Math.random() * 30}%` }} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTimeline() {
  return (
    <div className="p-4 space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="skeleton w-3 h-3 rounded-full mt-1" />
          <div className="flex-1">
            <div className="skeleton w-8 h-3 mb-1" />
            <div className="skeleton w-3/4 h-4 mb-1" />
            <div className="skeleton w-1/2 h-3" />
          </div>
        </div>
      ))}
    </div>
  );
}
