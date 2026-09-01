/**
 * Locale configuration — the single place that lists supported languages.
 * Only `en` and `ar` exist today; add a locale to the `Locale` union, a
 * dictionary file, and a LOCALE_DIR entry to grow the set.
 */

export type Locale = "en" | "ar";

/** English is the default; drivers switch to Arabic with the UI toggle. */
export const defaultLocale: Locale = "en";

/** Text direction per locale — drives the `dir` attribute on <html>. */
export const LOCALE_DIR: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  ar: "rtl",
};

/** Cookie the locale preference is persisted in (read by the server layouts). */
export const LOCALE_COOKIE = "locale";

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "ar";
}
