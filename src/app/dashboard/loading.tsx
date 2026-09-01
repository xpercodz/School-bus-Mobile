import { LiveMapSkeleton } from "@/components/dashboard/DashboardSkeletons";

/**
 * Instant loading fallback for the Live Map while the route's content loads —
 * shown as soon as navigation starts, before the page mounts. Matches the Live
 * Map skeleton the page renders while its Firebase query is in flight.
 */
export default function DashboardLoading() {
  return (
    <div
      role="status"
      className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-6 p-6"
    >
      <LiveMapSkeleton />
    </div>
  );
}
