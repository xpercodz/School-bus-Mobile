/**
 * Director dashboard ("School Transit Live Monitor") — UI-only mock data.
 *
 * Statuses and student names are NOT duplicated here: we reuse the `StudentStatus`
 * type and derive attendance rows from `STUDENTS` (src/data/students.ts), so the
 * dashboard and the mobile roster always show the same students. When Firebase
 * lands, this module becomes the repository for KPIs/buses while the roster rows
 * follow the same Firestore query as the mobile screen.
 */

import type { StudentStatus } from "@/data/students";
import { STUDENTS } from "@/data/students";

/** Dashboard badge classes per status — scoped to the dash palette (bg-dash-*). */
export const DASH_STATUS_META: Record<StudentStatus, string> = {
  BOARDED: "bg-dash-success-container text-dash-on-success-container border-dash-success/30",
  DROPPED_OFF: "bg-dash-success text-dash-on-success border-dash-success",
  ABSENT: "bg-dash-error-container text-dash-on-error-container border-dash-error/30",
  WAITING: "bg-dash-warning-container text-dash-on-warning-container border-dash-warning/50",
};

/** Human label for each status badge. */
export const DASH_STATUS_LABEL: Record<StudentStatus, string> = {
  BOARDED: "Boarded",
  DROPPED_OFF: "Dropped Off",
  ABSENT: "Absent",
  WAITING: "Waiting",
};

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
  label: string;
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
  morningBoarded: string;
  dropOffTime: string;
}

export const KPIS: readonly KPI[] = [
  { id: "total", label: "Total Assigned", value: 320, footer: "System Total", tone: "default" },
  {
    id: "onboard",
    label: "Currently Onboard",
    value: 210,
    footer: "+5 in last min",
    tone: "success",
    pulse: true,
  },
  {
    id: "dropped",
    label: "Safely Dropped Off",
    value: 95,
    footer: "Arrived at Campus",
    tone: "default",
    labelAccent: "success",
  },
  {
    id: "absent",
    label: "Marked Absent / Pending",
    value: 15,
    footer: "Action Required",
    tone: "error",
    footerIcon: "warning",
  },
];

export const BUSES: readonly Bus[] = [
  { id: "bus-01", name: "Bus 01", driver: "John Doe", status: "IN_PROGRESS", progress: 85, onboard: 18, droppedOff: 0, waiting: 2 },
  { id: "bus-04", name: "Bus 04", driver: "Sarah Jenkins", status: "COMPLETED", progress: 100, onboard: 0, droppedOff: 42, waiting: 0 },
];

export const NAV_ITEMS: readonly NavItem[] = [
  { id: "live-map", label: "Live Map", icon: "map", href: "/dashboard" },
  { id: "fleet", label: "Fleet Status", icon: "directions_bus" },
  { id: "routes", label: "Routes", icon: "route" },
  { id: "analytics", label: "Analytics", icon: "monitoring" },
  { id: "reports", label: "Reports", icon: "assessment" },
];

export const RUN_SEGMENTS = [
  { id: "morning", label: "Morning Pickup" },
  { id: "afternoon", label: "Afternoon Drop-off" },
] as const;

export type RunSegmentId = (typeof RUN_SEGMENTS)[number]["id"];

/** Sample timestamps so boarded/dropped-off rows read realistically. */
const MORNING_TIMES = ["07:35:12 AM", "07:15:00 AM", "07:40:33 AM", "07:22:48 AM", "07:30:05 AM", "07:18:27 AM"];
const DROPOFF_TIMES = ["08:02:45 AM", "08:11:20 AM", "08:05:59 AM", "08:14:37 AM", "08:09:12 AM", "08:07:44 AM"];

/** Attendance rows derived from the shared roster — same students, no duplication. */
export const ATTENDANCE: readonly AttendanceRow[] = STUDENTS.map((student, index) => {
  const boarded = student.status === "BOARDED" || student.status === "DROPPED_OFF";
  return {
    ...student,
    bus: index % 2 === 0 ? "01" : "04",
    morningBoarded: boarded ? MORNING_TIMES[index % MORNING_TIMES.length] : "--:--:--",
    dropOffTime: student.status === "DROPPED_OFF" ? DROPOFF_TIMES[index % DROPOFF_TIMES.length] : "--:--:--",
  };
});
