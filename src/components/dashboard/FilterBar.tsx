"use client";

import { useRef, type KeyboardEvent } from "react";
import { Icon } from "@/components/Icon";
import { RUN_SEGMENTS, type RunSegmentId } from "@/data/dashboard";
import { useLocale } from "@/lib/i18n/context";
import type { MessageKey } from "@/lib/i18n/types";

/** Run-segment label key per id. */
const SEGMENT_LABEL_KEY: Record<RunSegmentId, MessageKey> = {
  morning: "runType.morningPickup",
  afternoon: "runType.afternoonDropoff",
};

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
  const { t, dir } = useLocale();
  const ltr = dir === "ltr";
  const segmentRefs = useRef<Record<RunSegmentId, HTMLButtonElement | null>>({
    morning: null,
    afternoon: null,
  });

  // Roving focus + arrow-key navigation, matching the mobile SegmentedTabs.
  // Direction is inverted in RTL.
  function handleSegmentKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = RUN_SEGMENTS.findIndex((item) => item.id === segment);
    const forward = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    const backward = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    let next = -1;
    if (event.key === forward) next = (current + 1) % RUN_SEGMENTS.length;
    else if (event.key === backward) next = (current - 1 + RUN_SEGMENTS.length) % RUN_SEGMENTS.length;
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
            <span>{t("dashboard.today")}</span>
            <Icon name="arrow_drop_down" size={16} variant="outlined" />
          </button>

          {/* Run type segmented control. */}
          <div
            role="group"
            aria-label={t("dashboard.runTypeAria")}
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
                  {t(SEGMENT_LABEL_KEY[item.id])}
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
              className="absolute start-3 top-1/2 -translate-y-1/2 text-dash-outline"
            />
            <input
              aria-label={t("dashboard.searchAria")}
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder={t("dashboard.searchPlaceholder")}
              className="h-12 w-full rounded border border-dash-outline-variant bg-dash-surface ps-9 pe-3 text-dash-body-sm text-dash-on-surface transition-all placeholder:text-dash-outline focus:border-dash-primary focus:outline-none focus:ring-1 focus:ring-dash-primary"
            />
          </div>

          {/* Export — inert in the UI-only build. */}
          <button
            type="button"
            className={`flex h-12 items-center justify-center gap-2 rounded border border-dash-outline px-4 text-dash-label-md uppercase text-dash-on-surface transition-colors hover:bg-dash-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-primary ${
              ltr ? "tracking-wider" : ""
            }`}
          >
            <Icon name="download" size={16} variant="outlined" />
            <span>{t("dashboard.export")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
