/**
 * Roster types and presentation config — shared by the mobile roster and the
 * dashboard. No data lives here anymore: attendance rows come from Firestore
 * (`useRunRoster` / `useDashboardData`) and the app shows a sign-in prompt when
 * there is no live data.
 *
 * User-facing labels are intentionally NOT here — components resolve them via
 * `t()` (i18n), keyed off `status`/`id`, so the same data renders in both
 * languages.
 */

export type StudentStatus = "BOARDED" | "WAITING" | "DROPPED_OFF" | "ABSENT";

export interface Student {
  id: string;
  name: string;
  grade: string;
  status: StudentStatus;
}

/** Per-status presentation used by the roster cards (and chip icons). */
export interface StatusMeta {
  /** Material Symbols glyph for the pill button and chip icon. */
  icon: string;
  pillClassName: string;
  /** Extra card classes (e.g. ABSENT's error tint); "" = default card. */
  cardClassName: string;
  /** Name color override; "" = default. */
  nameClassName: string;
}

export const STATUS_META: Record<StudentStatus, StatusMeta> = {
  BOARDED: {
    icon: "check_circle",
    // text-on-success (#137333) rather than text-success: passes WCAG AA on the 10% tint
    pillClassName: "bg-success/10 text-on-success hover:bg-success/20",
    cardClassName: "",
    nameClassName: "",
  },
  WAITING: {
    icon: "schedule",
    pillClassName:
      "border border-outline text-on-surface-variant hover:bg-surface-container-high",
    cardClassName: "",
    nameClassName: "",
  },
  DROPPED_OFF: {
    icon: "how_to_reg",
    pillClassName: "bg-primary text-on-primary hover:bg-primary/90",
    cardClassName: "",
    nameClassName: "",
  },
  ABSENT: {
    icon: "cancel",
    pillClassName: "bg-error text-on-error hover:bg-error/90",
    cardClassName: "bg-error-container/20 border-error/50",
    // on-error-container (#93000a) rather than error: passes WCAG AA on the light tint (4.35 -> 8.5)
    nameClassName: "text-on-error-container",
  },
};

/** Chip presentation — in design order (Boarded, Dropped Off, Waiting).
 *  Icon comes from STATUS_META (single source); only chip-specific fields live here. */
export interface ChipConfig {
  status: StudentStatus;
  accentTextClass: string;
}

export const CHIPS: ReadonlyArray<ChipConfig> = [
  { status: "BOARDED", accentTextClass: "text-on-success" },
  { status: "DROPPED_OFF", accentTextClass: "text-primary" },
  { status: "WAITING", accentTextClass: "text-waiting" },
];

/** Filter tabs — in design order. ABSENT has no tab (matches the design). */
export type TabId = "all" | StudentStatus;

export interface TabConfig {
  id: TabId;
}

export const TABS: ReadonlyArray<TabConfig> = [
  { id: "all" },
  { id: "WAITING" },
  { id: "BOARDED" },
  { id: "DROPPED_OFF" },
];

/** Status cycle for the demo pill interaction: tap to advance to the next. */
export const STATUS_CYCLE: ReadonlyArray<StudentStatus> = [
  "BOARDED",
  "WAITING",
  "DROPPED_OFF",
  "ABSENT",
];

export function countByStatus(
  students: readonly Student[],
): Record<StudentStatus, number> {
  const counts: Record<StudentStatus, number> = {
    BOARDED: 0,
    WAITING: 0,
    DROPPED_OFF: 0,
    ABSENT: 0,
  };
  for (const student of students) {
    counts[student.status]++;
  }
  return counts;
}
