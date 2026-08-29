/**
 * Server-only locale resolution — reads the locale cookie so server-rendered
 * <html lang/dir> and metadata match the user's saved preference on first paint
 * (no wrong-direction flash). Only import from Server Components/layouts.
 */

import { cookies } from "next/headers";
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "./config";

export async function getServerLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : defaultLocale;
}
