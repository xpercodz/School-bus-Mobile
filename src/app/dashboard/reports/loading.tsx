import { ReportsSkeleton } from "@/components/dashboard/DashboardSkeletons";

/**
 * Instant loading fallback for Reports while the route's content loads —
 * shown as soon as navigation starts, before the page mounts. Matches the
 * Reports skeleton the page renders while its Firebase query is in flight.
 */
export default function ReportsLoading() {
  return (
    <div
      role="status"
      className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-6 p-6"
    >
      <ReportsSkeleton />
    </div>
  );
}
