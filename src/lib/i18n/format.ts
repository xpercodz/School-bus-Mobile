/**
 * Locale-aware formatting. Safe on both server and client — no browser-only
 * APIs, no React.
 *
 * Arabic (ar) intentionally formats via `ar-EG`, which produces Eastern Arabic
 * digits (٠١٢٣) and Arabic AM/PM words (ص/م) — the user's chosen numeral style.
 */

import type { Locale } from "./config";
import type { MessageKey, TFunction } from "./types";

const AR_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

/** Replace 0-9 with Eastern Arabic digits when locale is ar; no-op for en. */
export function toLocaleDigits(input: string, locale: Locale): string {
  if (locale === "en") return input;
  return input.replace(/[0-9]/g, (d) => AR_DIGITS[Number(d)]);
}

const timeFormatters = new Map<string, Intl.DateTimeFormat>();

function timeFormatter(locale: Locale): Intl.DateTimeFormat {
  const code = locale === "ar" ? "ar-EG" : "en-US";
  let fmt = timeFormatters.get(code);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat(code, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    timeFormatters.set(code, fmt);
  }
  return fmt;
}

/** Format a Date as a localized 12-hour clock; "--:--:--" when null. */
export function formatTime(ts: Date | null, locale: Locale): string {
  if (!ts) return "--:--:--";
  return timeFormatter(locale).format(ts);
}

/**
 * Localize an already-formatted "HH:MM:SS AM/PM" string (the mock times) —
 * digit map + AM/PM → ص/م for ar. No-op for en.
 */
export function localizeTimeString(input: string, locale: Locale): string {
  if (locale === "en") return input;
  return input
    .replace(/AM/gi, "ص")
    .replace(/PM/gi, "م")
    .replace(/[0-9]/g, (d) => AR_DIGITS[Number(d)]);
}

/**
 * Rewrite a translatable prefix embedded in stored data — "Bus 04" → "حافلة ٠٤"
 * and "Grade 4B" → "الصف ٤B". Pass-through for anything else (proper nouns).
 */
export function translateDataLabel(
  input: string,
  locale: Locale,
  t: TFunction,
): string {
  const bus = input.match(/^Bus\s+(\S+)/);
  if (bus) return `${t("bus.bus")} ${toLocaleDigits(bus[1], locale)}`;
  const grade = input.match(/^Grade\s+(\S+)/);
  if (grade) return `${t("bus.grade")} ${toLocaleDigits(grade[1], locale)}`;
  return toLocaleDigits(input, locale);
}

/** `t` key for a status — handy for mapping StudentStatus → MessageKey. */
export function statusKey(status: string): MessageKey {
  switch (status) {
    case "BOARDED":
      return "status.boarded";
    case "WAITING":
      return "status.waiting";
    case "DROPPED_OFF":
      return "status.droppedOff";
    case "ABSENT":
      return "status.absent";
    default:
      return "status.waiting";
  }
}
