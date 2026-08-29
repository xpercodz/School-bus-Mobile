"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { RequireRole } from "@/components/RequireRole";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { activeIdFromPathname } from "@/data/dashboard";
import { useSchoolName } from "@/lib/school";

/**
 * Director-only shell for /dashboard (and its sub-pages): guards access
 * (redirects to /login or / by role), then renders the fixed sidebar + sticky
 * top bar. The active sidebar item follows the current path; the school name
 * comes from the signed-in user's tenant so each school sees its own.
 */
export function DirectorShell({ children }: { children: ReactNode }) {
  const schoolName = useSchoolName();
  const pathname = usePathname();
  const activeId = activeIdFromPathname(pathname);

  return (
    <RequireRole role="director" fallback="/">
      <div className="min-h-dvh bg-dash-background font-sans text-dash-on-surface">
        <Sidebar activeId={activeId} schoolName={schoolName} />
        <div className="ms-64 flex min-h-dvh flex-col print:ms-0">
          <TopBar />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </RequireRole>
  );
}
