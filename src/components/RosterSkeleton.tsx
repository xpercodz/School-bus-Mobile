import { Skeleton, SkeletonCircle } from "@/components/Skeleton";

/**
 * Mobile roster loading skeleton. Mirrors the real screen from top to bottom:
 * status chips, search bar, filter tabs, then roster cards (name/grade + status
 * pill + "⋯" button). Wrap in `role="status"` at the call site.
 */
export function RosterSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Status chips */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto py-1">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-8 w-28 flex-shrink-0 rounded-lg" />
        ))}
      </div>
      {/* Search bar */}
      <Skeleton className="h-14 w-full rounded-full" />
      {/* Filter tabs */}
      <div className="flex overflow-hidden border-b border-outline-variant">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 flex-1 rounded-none" />
        ))}
      </div>
      {/* Roster cards */}
      <ul className="flex flex-col gap-4">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <li
            key={i}
            className="flex items-center justify-between gap-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 shadow-card"
          >
            <div className="flex min-w-0 flex-col gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="flex flex-shrink-0 items-center gap-1">
              <Skeleton className="h-10 w-24 rounded-full" />
              <SkeletonCircle className="h-10 w-10" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Mirrors the shared history sheet's list rows (date + run line, status badge). */
export function HistoryListSkeleton() {
  return (
    // Padding comes from the sheet's scroll container.
    <div className="divide-y divide-outline-variant">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center justify-between gap-4 py-3">
          <div className="flex min-w-0 flex-col gap-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-7 w-20 flex-shrink-0 rounded-full" />
        </div>
      ))}
    </div>
  );
}
