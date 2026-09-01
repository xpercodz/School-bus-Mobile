import { AssignmentsSkeleton } from "@/components/dashboard/DashboardSkeletons";

/**
 * Instant loading fallback for Assignments while the route's content loads —
 * shown as soon as navigation starts, before the page mounts. Matches the
 * Assignments skeleton the page renders while its Firebase query is in flight.
 */
export default function AssignmentsLoading() {
  return (
    <div
      role="status"
      className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-6 p-6"
    >
      <AssignmentsSkeleton />
    </div>
  );
}
