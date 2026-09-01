import { DriversSkeleton } from "@/components/dashboard/DashboardSkeletons";

/**
 * Instant loading fallback for Drivers while the route's content loads — shown
 * as soon as navigation starts, before the page mounts. Matches the Drivers
 * skeleton the page renders while its Firebase query is in flight.
 */
export default function DriversLoading() {
  return (
    <div
      role="status"
      className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-6 p-6"
    >
      <DriversSkeleton />
    </div>
  );
}
