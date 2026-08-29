import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DirectorShell } from "@/components/dashboard/DirectorShell";

export const metadata: Metadata = {
  title: "School Transit Live Monitor",
  description: "Real-time school transit monitoring dashboard",
};

/**
 * Director dashboard route. The shell (in a client component) enforces the
 * director role — signed-out users go to /login, non-directors back to /.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DirectorShell>{children}</DirectorShell>;
}
