"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth";
import { LocaleProvider } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/config";
import { ToastProvider } from "@/components/Toast";

/** Client providers that wrap the app (locale + auth + toasts). */
export function Providers({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  return (
    <LocaleProvider initialLocale={initialLocale}>
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </LocaleProvider>
  );
}
