"use client";

import { useRef, type KeyboardEvent } from "react";
import { Icon } from "@/components/Icon";
import { RUN_SEGMENTS, type RunSegmentId } from "@/data/dashboard";

interface FilterBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  segment: RunSegmentId;
  onSegmentChange: (s: RunSegmentId) => void;
}

/**
 * Sticky filter bar above the dashboard content: run-type segmented control,
 * date chip, student search, and export button. UI-only — all controls are
 * inert except the search input and the run segment toggle.
 */
export function FilterBar({ query, onQueryChange, segment, onSegmentChange }: FilterBarProps) {
  const segmentRefs = useRef<Record<RunSegmentId, HTMLButtonElement | null>>({
    morning: null,
    afternoon: null,
  });

  // Roving focus + arrow-key navigation, matching the mobile SegmentedTabs.
  function handleSegmentKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = RUN_SEGMENTS.findIndex((item) => item.id === segment);
    let next = -1;
    if (event.key === "ArrowRight") next = (current + 1) % RUN_SEGMENTS.length;
    else if (event.key === "ArrowLeft") next = (current - 1 + RUN_SEGMENTS.length) % RUN_SEGMENTS.length;
    if (next === -1) return;
    event.preventDefault();
    const target = RUN_SEGMENTS[next];
    onSegmentChange(target.id);
    segmentRefs.current[target.id]?.focus();
  }

  return (
    <div className="sticky top-16 z-0 border-b border-dash-outline-variant bg-dash-surface-container-low px-6 py-3">
      <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Date chip — inert in the UI-only build. */}
          <button
            type="button"
            className="flex h-12 items-center gap-2 rounded border border-dash-outline-variant bg-dash-surface px-3 text-dash-label-md text-dash-on-surface transition-colors hover:border-dash-outline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-primary"
          >
            <Icon name="calendar_today" size={16} variant="outlined" />
            <span>Today</span>
            <Icon name="arrow_drop_down" size={16} variant="outlined" />
          </button>

          {/* Run type segmented control. */}
          <div
            role="group"
            aria-label="Run type"
            onKeyDown={handleSegmentKeyDown}
            className="flex h-12 items-center rounded border border-dash-outline-variant bg-dash-surface p-1"
          >
            {RUN_SEGMENTS.map((item) => {
              const isActive = segment === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={isActive}
                  tabIndex={isActive ? 0 : -1}
                  ref={(el) => {
                    segmentRefs.current[item.id] = el;
                  }}
                  onClick={() => onSegmentChange(item.id)}
                  className={`h-full rounded px-4 text-dash-label-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-primary ${
                    isActive
                      ? "bg-dash-primary-container font-bold text-dash-on-primary-container"
                      : "text-dash-on-surface-variant transition-colors hover:text-dash-on-surface"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-4">
          <div className="relative w-64 max-w-sm">
            <Icon
              name="search"
              size={18}
              variant="outlined"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-dash-outline"
            />
            <input
              aria-label="Search students"
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search student, guardian, or bus..."
              className="h-12 w-full rounded border border-dash-outline-variant bg-dash-surface pl-9 pr-3 text-dash-body-sm text-dash-on-surface transition-all placeholder:text-dash-outline focus:border-dash-primary focus:outline-none focus:ring-1 focus:ring-dash-primary"
            />
          </div>

          {/* Export — inert in the UI-only build. */}
          <button
            type="button"
            className="flex h-12 items-center justify-center gap-2 rounded border border-dash-outline px-4 text-dash-label-md uppercase tracking-wider text-dash-on-surface transition-colors hover:bg-dash-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-primary"
          >
            <Icon name="download" size={16} variant="outlined" />
            <span>Export CSV / PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
