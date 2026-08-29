"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth";

/** Client providers that wrap the app (currently just auth state). */
export function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
