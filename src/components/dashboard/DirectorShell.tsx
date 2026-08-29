"use client";

import type { ReactNode } from "react";
import { RequireRole } from "@/components/RequireRole";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { useSchoolName } from "@/lib/school";

/**
 * Director-only shell for /dashboard: guards access (redirects to /login or /
 * by role), then renders the fixed sidebar + sticky top bar. The school name
 * comes from the signed-in user's tenant so each school sees its own.
 */
export function DirectorShell({ children }: { children: ReactNode }) {
  const schoolName = useSchoolName();

  return (
    <RequireRole role="director" fallback="/">
      <div className="min-h-dvh bg-dash-background font-sans text-dash-on-surface">
        <Sidebar activeId="live-map" schoolName={schoolName} />
        <div className="ml-64 flex min-h-dvh flex-col">
          <TopBar />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </RequireRole>
  );
}
