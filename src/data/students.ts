/**
 * Student roster — UI-only mock data.
 *
 * This module is the single source of truth for the attendance screen: the
 * chips, tabs, and list all derive their counts/labels from here, so they can
 * never disagree. When Firebase lands, replace `STUDENTS` with a Firestore
 * query that returns the same `Student` shape — nothing else changes.
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
  /** Uppercase text on the pill button. */
  pillLabel: string;
  pillClassName: string;
  /** Extra card classes (e.g. ABSENT's error tint); "" = default card. */
  cardClassName: string;
  /** Name color override; "" = default. */
  nameClassName: string;
}

export const STATUS_META: Record<StudentStatus, StatusMeta> = {
  BOARDED: {
    icon: "check_circle",
    pillLabel: "BOARDED",
    // text-on-success (#137333) rather than text-success: passes WCAG AA on the 10% tint
    pillClassName: "bg-success/10 text-on-success hover:bg-success/20",
    cardClassName: "",
    nameClassName: "",
  },
  WAITING: {
    icon: "schedule",
    pillLabel: "WAITING",
    pillClassName:
      "border border-outline text-on-surface-variant hover:bg-surface-container-high",
    cardClassName: "",
    nameClassName: "",
  },
  DROPPED_OFF: {
    icon: "how_to_reg",
    pillLabel: "DROPPED OFF",
    pillClassName: "bg-primary text-on-primary hover:bg-primary/90",
    cardClassName: "",
    nameClassName: "",
  },
  ABSENT: {
    icon: "cancel",
    pillLabel: "ABSENT",
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
  label: string;
  accentTextClass: string;
}

export const CHIPS: ReadonlyArray<ChipConfig> = [
  { status: "BOARDED", label: "Boarded", accentTextClass: "text-on-success" },
  { status: "DROPPED_OFF", label: "Dropped Off", accentTextClass: "text-primary" },
  { status: "WAITING", label: "Waiting", accentTextClass: "text-waiting" },
];

/** Filter tabs — in design order. ABSENT has no tab (matches the design). */
export type TabId = "all" | StudentStatus;

export interface TabConfig {
  id: TabId;
  label: string;
}

export const TABS: ReadonlyArray<TabConfig> = [
  { id: "all", label: "All" },
  { id: "WAITING", label: "Waiting" },
  { id: "BOARDED", label: "Boarded" },
  { id: "DROPPED_OFF", label: "Done" },
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

/** Mock roster — the 5 canonical students from the design, plus fillers. */
export const STUDENTS: readonly Student[] = [
  { id: "liam-johnson", name: "Liam Johnson", grade: "Grade 4B", status: "BOARDED" },
  { id: "sophia-chen", name: "Sophia Chen", grade: "Grade 3A", status: "WAITING" },
  { id: "marcus-williams", name: "Marcus Williams", grade: "Grade 5C", status: "DROPPED_OFF" },
  { id: "emma-davis", name: "Emma Davis", grade: "Grade 4B", status: "WAITING" },
  { id: "noah-smith", name: "Noah Smith", grade: "Grade 3A", status: "ABSENT" },
  { id: "ava-martinez", name: "Ava Martinez", grade: "Grade 5C", status: "BOARDED" },
  { id: "ethan-brown", name: "Ethan Brown", grade: "Grade 4A", status: "BOARDED" },
  { id: "mia-wilson", name: "Mia Wilson", grade: "Grade 3B", status: "BOARDED" },
  { id: "lucas-garcia", name: "Lucas Garcia", grade: "Grade 4B", status: "BOARDED" },
  { id: "isabella-lee", name: "Isabella Lee", grade: "Grade 5A", status: "BOARDED" },
  { id: "oliver-taylor", name: "Oliver Taylor", grade: "Grade 3C", status: "BOARDED" },
  { id: "charlotte-anderson", name: "Charlotte Anderson", grade: "Grade 4A", status: "DROPPED_OFF" },
];
