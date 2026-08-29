"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "@/components/Icon";
import { RUN_SEGMENTS, type RunSegmentId } from "@/data/dashboard";
import { useLocale } from "@/lib/i18n/context";
import { formatDate } from "@/lib/i18n/format";
import type { MessageKey } from "@/lib/i18n/types";
import { DatePickerPopover } from "./DatePickerPopover";

/** Run-segment label key per id. */
const SEGMENT_LABEL_KEY: Record<RunSegmentId, MessageKey> = {
  morning: "runType.morningPickup",
  afternoon: "runType.afternoonDropoff",
};

interface DateSegmentBarProps {
  /** Selected date (YYYY-MM-DD) or null for today. */
  date: string | null;
  onDateChange: (d: string | null) => void;
  segment: RunSegmentId;
  onSegmentChange: (s: RunSegmentId) => void;
}

/**
 * Shared dashboard filter: the date picker chip + the Morning/Afternoon
 * run-segment control. Used by the Live Map FilterBar, Analytics, and Reports.
 */
export function DateSegmentBar({
  date,
  onDateChange,
  segment,
  onSegmentChange,
}: DateSegmentBarProps) {
  const { t, dir, locale } = useLocale();
  const [pickerOpen, setPickerOpen] = useState(false);
  const segmentRefs = useRef<Record<RunSegmentId, HTMLButtonElement | null>>({
    morning: null,
    afternoon: null,
  });
  const dateRootRef = useRef<HTMLDivElement>(null);

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
    <div className="flex items-center gap-4">
      {/* Date chip — opens the date picker popover. */}
      <div ref={dateRootRef} className="relative">
        <button
          type="button"
          onClick={() => setPickerOpen((open) => !open)}
          aria-haspopup="dialog"
          aria-expanded={pickerOpen}
          aria-label={t("dashboard.selectDate")}
          className="flex h-12 items-center gap-2 rounded border border-dash-outline-variant bg-dash-surface px-3 text-dash-label-md text-dash-on-surface transition-colors hover:border-dash-outline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-primary"
        >
          <Icon name="calendar_today" size={16} variant="outlined" />
          <span>{date ? formatDate(date, locale) : t("dashboard.today")}</span>
          <Icon name="arrow_drop_down" size={16} variant="outlined" />
        </button>
        <DatePickerPopover
          open={pickerOpen}
          value={date}
          onSelect={onDateChange}
          onClose={() => setPickerOpen(false)}
          containRef={dateRootRef}
        />
      </div>

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
  );
}
