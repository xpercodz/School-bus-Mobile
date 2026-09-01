import { Skeleton, SkeletonText } from "@/components/Skeleton";

/**
 * Dashboard loading skeletons. Each piece mirrors the exact layout of the
 * component it stands in for (MetricCard, BusCard, the data tables, the trend
 * chart) so the loading state looks like the content that will load.
 */

/** Mirrors MetricCard: label line, big metric number, bottom-right footer. */
function SkeletonMetricCard() {
  return (
    <div className="flex flex-col gap-3 rounded border border-dash-outline-variant bg-dash-surface p-4">
      <SkeletonText className="w-24" />
      <Skeleton className="h-8 w-16" />
      <SkeletonText className="ms-auto w-20" />
    </div>
  );
}

/** Mirrors the 4-up KPI grid on every dashboard page. */
function SkeletonKpiGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <SkeletonMetricCard key={i} />
      ))}
    </div>
  );
}

/** Mirrors BusCard: name/driver + status badge, progress bar, In/Out/Wait row. */
function SkeletonBusCard() {
  return (
    <div className="flex flex-col gap-4 rounded border border-dash-outline-variant bg-dash-surface p-4">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <SkeletonText className="h-4 w-24" />
          <SkeletonText className="w-28" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between">
          <SkeletonText className="w-24" />
          <SkeletonText className="w-8" />
        </div>
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-1 border-t border-dash-outline-variant/50 pt-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <SkeletonText className="h-4 w-6" />
            <SkeletonText className="h-2.5 w-6" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Mirrors the "Active Fleet Status" grid (title + en-route count + cards). */
function SkeletonFleetGrid() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-dash-outline-variant pb-2">
        <SkeletonText className="h-4 w-44" />
        <SkeletonText className="w-20" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonBusCard key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Mirrors a data table. `widths` are the per-column skeleton classes (e.g.
 * `"w-40"`, `"flex-1"` for a bar column) so each table's skeleton matches its
 * real column widths.
 */
function SkeletonTable({
  widths,
  rows = 6,
}: {
  widths: readonly string[];
  rows?: number;
}) {
  return (
    <div className="overflow-hidden rounded border border-dash-outline-variant bg-dash-surface">
      <div className="flex items-center gap-4 border-b border-dash-outline-variant bg-dash-surface-container px-4 py-3">
        {widths.map((width, i) => (
          <SkeletonText key={i} className={width} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="flex items-center gap-4 border-b border-dash-outline-variant/50 px-4 py-3 last:border-0"
        >
          {widths.map((width, c) => (
            <SkeletonText key={c} className={`${c === 0 ? "h-3.5" : ""} ${width}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Mirrors the multi-day trend chart: a row of vertical bars of varying height. */
function SkeletonTrend() {
  const heights = [45, 70, 55, 85, 60, 90, 50];
  return (
    <div className="flex items-end gap-2 pb-1">
      {heights.map((height, i) => (
        <Skeleton
          key={i}
          className="w-10 rounded-t"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}

// Column widths shared by the roster/attendance tables (Live Map + Reports).
const ROSTER_COLUMNS = [
  "w-40", // name
  "w-14", // grade
  "w-10", // bus
  "w-20", // morning boarded
  "w-20", // drop-off
  "w-14", // status badge
  "w-20", // actions
];

/** Live Map loading state: KPI grid + fleet grid + attendance table. */
export function LiveMapSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <SkeletonKpiGrid />
      <SkeletonFleetGrid />
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-dash-outline-variant pb-2">
          <SkeletonText className="h-4 w-52" />
          <SkeletonText className="w-24" />
        </div>
        <SkeletonTable widths={ROSTER_COLUMNS} />
      </div>
    </div>
  );
}

/** Analytics loading state: KPIs, per-bus, per-grade, trend. */
export function AnalyticsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <SkeletonKpiGrid />
      <SkeletonText className="h-4 w-40" />
      <SkeletonTable widths={["w-24", "w-10", "flex-1", "flex-1"]} rows={4} />
      <SkeletonText className="h-4 w-40" />
      <SkeletonTable widths={["w-24", "w-8", "w-8", "w-8", "w-8", "w-8"]} rows={4} />
      <SkeletonText className="h-4 w-40" />
      <SkeletonTrend />
    </div>
  );
}

/** Reports loading state: KPIs, by-bus, by-grade, roster. */
export function ReportsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <SkeletonKpiGrid />
      <SkeletonText className="h-4 w-40" />
      <SkeletonTable widths={["w-24", "w-8", "w-8", "w-8", "w-8", "w-12"]} rows={4} />
      <SkeletonText className="h-4 w-40" />
      <SkeletonTable widths={["w-24", "w-8", "w-8", "w-8", "w-8"]} rows={4} />
      <SkeletonText className="h-4 w-40" />
      <SkeletonTable widths={ROSTER_COLUMNS} />
    </div>
  );
}

/** Assignments loading state: a Drivers table skeleton + a Students table skeleton. */
export function AssignmentsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <SkeletonText className="h-4 w-40" />
      <SkeletonTable widths={["w-24", "w-40", "w-24"]} rows={4} />
      <SkeletonText className="h-4 w-40" />
      <SkeletonTable widths={["w-48", "w-16", "w-24"]} rows={6} />
    </div>
  );
}

/** Drivers loading state: an add-driver form card + an access-codes table skeleton. */
export function DriversSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <SkeletonText className="h-4 w-40" />
      <div className="rounded border border-dash-outline-variant bg-dash-surface p-4">
        <SkeletonText className="h-3.5 w-24" />
        <Skeleton className="mt-3 h-10 w-full rounded" />
        <Skeleton className="mt-3 h-10 w-44 rounded-full" />
      </div>
      <SkeletonText className="h-4 w-40" />
      <SkeletonTable widths={["w-40", "w-24", "w-40"]} rows={4} />
    </div>
  );
}
