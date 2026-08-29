import type { CSSProperties } from "react";

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
}

/**
 * Base skeleton block — a pulsing rounded placeholder, sized by className.
 *
 * Color is the mobile palette's `surface-container-high`, a near-neutral gray
 * that reads correctly on both the mobile and dashboard surfaces. Compose
 * screen shapes from these primitives (see `dashboard/DashboardSkeletons.tsx`
 * and `RosterSkeleton.tsx`) and wrap the result in `role="status"` at the call
 * site so screen readers announce the loading state.
 */
export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      style={style}
      className={`animate-pulse rounded-md bg-surface-container-high ${className ?? ""}`}
    />
  );
}

/** A short text-line skeleton. */
export function SkeletonText({ className }: { className?: string }) {
  return <Skeleton className={`h-3 ${className ?? ""}`} />;
}

/** A circular skeleton (status dots, avatars, badges). */
export function SkeletonCircle({ className }: { className?: string }) {
  return <Skeleton className={`rounded-full ${className ?? ""}`} />;
}
