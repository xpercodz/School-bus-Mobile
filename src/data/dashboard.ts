/**
 * Director dashboard ("School Transit Live Monitor") — layout config + types.
 *
 * No mock data lives here anymore: KPIs are derived from Firestore attendance
 * in `useDashboardData`, buses/rows come from Firestore, and the app shows a
 * sign-in prompt when there is no live data.
 *
 * User-facing labels (KPIs, nav, run segments) are resolved by components via
 * `t()` (i18n) — only ids and layout config live here.
 */

import type { StudentStatus } from "@/data/students";

/** Dashboard badge classes per status — scoped to the dash palette (bg-dash-*). */
export const DASH_STATUS_META: Record<StudentStatus, string> = {
  BOARDED: "bg-dash-success-container text-dash-on-success-container border-dash-success/30",
  DROPPED_OFF: "bg-dash-success text-dash-on-success border-dash-success",
  ABSENT: "bg-dash-error-container text-dash-on-error-container border-dash-error/30",
  WAITING: "bg-dash-warning-container text-dash-on-warning-container border-dash-warning/50",
};

/** Student-list status filter options — "All" plus every status. */
export const STUDENT_STATUS_FILTERS: readonly ("ALL" | StudentStatus)[] = [
  "ALL",
  "BOARDED",
  "WAITING",
  "DROPPED_OFF",
  "ABSENT",
];

export type StudentStatusFilter = (typeof STUDENT_STATUS_FILTERS)[number];

export type MetricTone = "default" | "success" | "error";

export interface KPI {
  id: string;
  label: string;
  value: number;
  footer: string;
  tone: MetricTone;
  /** Override the label accent color (e.g. a success-colored label on a default card). */
  labelAccent?: "success" | "error";
  /** Show a live-pulse dot beside the label. */
  pulse?: boolean;
  /** Optional trailing glyph in the footer row. */
  footerIcon?: string;
}

/**
 * KPI config without the localizable label/footer — those are filled in by
 * `useDashboardData` from the active locale so the same cards translate.
 */
export type KPIBase = Omit<KPI, "label" | "footer">;

export interface Bus {
  id: string;
  name: string;
  driver: string;
  status: "IN_PROGRESS" | "COMPLETED";
  progress: number;
  onboard: number;
  droppedOff: number;
  waiting: number;
}

export interface NavItem {
  id: string;
  icon: string;
  /** Only set for the built page; other sections are inert in the UI-only build. */
  href?: string;
}

export interface AttendanceRow {
  id: string;
  name: string;
  grade: string;
  status: StudentStatus;
  bus: string;
  /** Which run segment the row belongs to — drives the dashboard filter. */
  runType: "morning" | "afternoon";
  morningBoarded: string;
  dropOffTime: string;
}

export const KPIS: readonly KPIBase[] = [
  { id: "total", value: 0, tone: "default" },
  { id: "onboard", value: 0, tone: "success", pulse: true },
  { id: "dropped", value: 0, tone: "default", labelAccent: "success" },
  { id: "absent", value: 0, tone: "error", footerIcon: "warning" },
];

export const NAV_ITEMS: readonly NavItem[] = [
  { id: "live-map", icon: "map", href: "/dashboard" },
  // Fleet Status / Routes have no page yet (fleet is covered by the live map).
  { id: "fleet", icon: "directions_bus" },
  { id: "routes", icon: "route" },
  { id: "analytics", icon: "monitoring", href: "/dashboard/analytics" },
  { id: "reports", icon: "assessment", href: "/dashboard/reports" },
  { id: "assignments", icon: "assignment_ind", href: "/dashboard/assignments" },
  { id: "drivers", icon: "badge", href: "/dashboard/drivers" },
];

/** Map the current pathname to the active sidebar item id (shell pages → live-map). */
export function activeIdFromPathname(pathname: string): string {
  if (pathname.startsWith("/dashboard/analytics")) return "analytics";
  if (pathname.startsWith("/dashboard/reports")) return "reports";
  if (pathname.startsWith("/dashboard/assignments")) return "assignments";
  if (pathname.startsWith("/dashboard/drivers")) return "drivers";
  return "live-map";
}

export const RUN_SEGMENTS = [{ id: "morning" }, { id: "afternoon" }] as const;

export type RunSegmentId = (typeof RUN_SEGMENTS)[number]["id"];
