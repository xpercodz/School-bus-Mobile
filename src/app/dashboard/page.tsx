"use client";

import { useMemo, useState } from "react";
import type { RunSegmentId } from "@/data/dashboard";
import { useDashboardData } from "@/lib/school-data";
import { AttendanceTable } from "@/components/dashboard/AttendanceTable";
import { BusCard } from "@/components/dashboard/BusCard";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { Icon } from "@/components/Icon";
import { MetricCard } from "@/components/dashboard/MetricCard";

export default function DashboardPage() {
  const { kpis, buses, attendance, loading, live } = useDashboardData();
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState<RunSegmentId>("morning");

  // Search filters the attendance table (mirrors the mobile SearchBar).
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q === ""
      ? attendance
      : attendance.filter((row) => row.name.toLowerCase().includes(q));
  }, [attendance, query]);

  // Counts derived from data so the header can never disagree with the grid.
  const enRoute = buses.filter((bus) => bus.status === "IN_PROGRESS").length;

  return (
    <>
      <FilterBar
        query={query}
        onQueryChange={setQuery}
        segment={segment}
        onSegmentChange={setSegment}
      />
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-6 p-6">
        {live && loading && (
          <div role="status" className="flex items-center gap-2 text-dash-body-sm text-dash-on-surface-variant">
            <Icon name="progress_activity" size={16} variant="outlined" className="animate-spin" />
            Loading live data…
          </div>
        )}

        {/* KPI cards */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <MetricCard key={kpi.id} kpi={kpi} />
          ))}
        </section>

        {/* Active fleet */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-dash-outline-variant pb-2">
            <h2 className="flex items-center gap-2 text-dash-label-md text-dash-on-surface uppercase tracking-widest">
              <Icon name="directions_bus" size={18} variant="outlined" />
              Active Fleet Status
            </h2>
            <span className="text-dash-body-sm text-dash-on-surface-variant">
              {enRoute} {enRoute === 1 ? "Bus" : "Buses"} En Route
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {buses.map((bus) => (
              <BusCard key={bus.id} bus={bus} />
            ))}
          </div>
        </section>

        {/* Live attendance */}
        <AttendanceTable rows={filtered} />
      </div>
    </>
  );
}
