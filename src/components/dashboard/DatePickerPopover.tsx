"use client";

import { useEffect, type RefObject } from "react";
import { useLocale } from "@/lib/i18n/context";
import { formatDate } from "@/lib/i18n/format";

interface DatePickerPopoverProps {
  open: boolean;
  /** Selected date (YYYY-MM-DD), or null for today. */
  value: string | null;
  onSelect: (date: string | null) => void;
  onClose: () => void;
  /**
   * The container that also holds the trigger button. Outside clicks (including
   * on the trigger itself) are ignored for closing, so the chip's own onClick
   * can toggle cleanly instead of closing-then-reopening via the mousedown
   * listener.
   */
  containRef: RefObject<HTMLDivElement | null>;
}

/**
 * Anchored popover under the filter bar's date chip: a native date input plus a
 * "Today" reset. The input value stays "YYYY-MM-DD" regardless of `dir` (native
 * input locale is the browser's). Closes on outside click / Escape.
 */
export function DatePickerPopover({
  open,
  value,
  onSelect,
  onClose,
  containRef,
}: DatePickerPopoverProps) {
  const { t, locale } = useLocale();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (containRef.current && !containRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, containRef]);

  if (!open) return null;

  return (
    <div
      className="absolute start-0 top-full z-20 mt-2 flex w-64 flex-col gap-3 rounded-lg border border-dash-outline-variant bg-dash-surface p-4 shadow-card"
    >
      <input
        type="date"
        aria-label={t("dashboard.selectDate")}
        value={value ?? ""}
        onChange={(event) => onSelect(event.target.value || null)}
        className="h-12 rounded border border-dash-outline-variant bg-dash-surface px-3 text-dash-body-sm text-dash-on-surface focus:border-dash-primary focus:outline-none focus:ring-1 focus:ring-dash-primary"
      />
      <button
        type="button"
        onClick={() => {
          onSelect(null);
          onClose();
        }}
        className="flex h-10 items-center justify-center gap-2 rounded text-dash-label-md text-dash-primary transition-colors hover:bg-dash-primary-container/40"
      >
        {t("dashboard.today")}
        {value && (
          <span className="text-dash-on-surface-variant">
            ({formatDate(value, locale)})
          </span>
        )}
      </button>
    </div>
  );
}
