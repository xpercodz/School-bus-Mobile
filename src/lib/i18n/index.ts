import { messages as en } from "./dictionaries/en";
import { messages as ar } from "./dictionaries/ar";
import type { Locale } from "./config";
import type { MessageKey, Messages } from "./types";

export type { MessageKey, Messages };

/** Look up a locale's message map. Unknown locales fall back to English. */
export function getDictionary(locale: Locale): Messages {
  return locale === "ar" ? ar : en;
}

export type { Locale };
