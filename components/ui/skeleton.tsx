interface SkeletonProps {
  className?: string;
}

export function SkeletonBlock({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`skeleton-pulse rounded-2xl bg-surface-2 ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonLine({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`skeleton-pulse h-3 rounded-full bg-surface-2 ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonCircle({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`skeleton-pulse rounded-full bg-surface-2 ${className}`}
      aria-hidden="true"
    />
  );
}
