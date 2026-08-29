"use client";

import { Icon } from "@/components/Icon";
import type { RunSegmentId } from "@/data/dashboard";
import { useLocale } from "@/lib/i18n/context";
import { DateSegmentBar } from "./DateSegmentBar";

interface FilterBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  segment: RunSegmentId;
  onSegmentChange: (s: RunSegmentId) => void;
  /** Selected date (YYYY-MM-DD) or null for today. */
  date: string | null;
  onDateChange: (d: string | null) => void;
  onExport: () => void;
}

/**
 * Sticky filter bar above the Live Map: shared date + run-segment controls,
 * student search, and export. The segment control and search filter the table
 * live; the date chip re-queries the dashboard; Export downloads the CSV.
 */
export function FilterBar({
  query,
  onQueryChange,
  segment,
  onSegmentChange,
  date,
  onDateChange,
  onExport,
}: FilterBarProps) {
  const { t, dir } = useLocale();
  const ltr = dir === "ltr";

  return (
    <div className="sticky top-16 z-0 border-b border-dash-outline-variant bg-dash-surface-container-low px-6 py-3">
      <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-4">
        <DateSegmentBar
          date={date}
          onDateChange={onDateChange}
          segment={segment}
          onSegmentChange={onSegmentChange}
        />

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

          {/* Export — downloads the current filtered rows as CSV. */}
          <button
            type="button"
            onClick={onExport}
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
