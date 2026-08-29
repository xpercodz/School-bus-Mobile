import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DirectorShell } from "@/components/dashboard/DirectorShell";
import { getDictionary } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const dict = getDictionary(await getServerLocale());
  return {
    title: dict["meta.dashboardTitle"],
    description: dict["meta.dashboardDescription"],
  };
}

/**
 * Director dashboard route. The shell (in a client component) enforces the
 * director role — signed-out users go to /login, non-directors back to /.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DirectorShell>{children}</DirectorShell>;
}
