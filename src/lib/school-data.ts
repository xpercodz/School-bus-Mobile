"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  where,
  type Timestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import type { Student, StudentStatus } from "@/data/students";
import { STATUS_CYCLE, STUDENTS } from "@/data/students";
import type { Bus, KPI } from "@/data/dashboard";
import { ATTENDANCE, BUSES, KPIS, type AttendanceRow } from "@/data/dashboard";

/** The mobile roster always shows Bus #04's morning run (matches the design). */
export const ROSTER_BUS_ID = "bus04";
export const ROSTER_RUN_TYPE = "morning";

// ── helpers ──────────────────────────────────────────────────────────────────

function todayDateStr(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Cached users/{uid} → schoolId lookup. */
const schoolIdCache = new Map<string, string>();

async function fetchSchoolId(uid: string): Promise<string | null> {
  const cached = schoolIdCache.get(uid);
  if (cached) return cached;
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, "users", uid));
    const schoolId = (snap.data()?.schoolId as string | undefined) ?? null;
    if (schoolId) schoolIdCache.set(uid, schoolId);
    return schoolId;
  } catch {
    return null;
  }
}

function formatTime(ts: Timestamp | null): string {
  if (!ts) return "--:--:--";
  const d = ts.toDate();
  const pad = (n: number) => String(n).padStart(2, "0");
  const hours = d.getHours();
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${pad(h12)}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${hours >= 12 ? "PM" : "AM"}`;
}

function countByStatus(rows: AttendanceDoc[], status: StudentStatus): number {
  return rows.filter((row) => row.status === status).length;
}

interface AttendanceDoc {
  id: string;
  runId: string;
  busId: string;
  busName: string;
  studentName: string;
  grade: string;
  status: StudentStatus;
  boardedAt: Timestamp | null;
  droppedOffAt: Timestamp | null;
}

interface BusDoc {
  id: string;
  name: string;
  driver: string;
}

interface RunDoc {
  id: string;
  busId: string;
  status: "IN_PROGRESS" | "COMPLETED";
}

/** True when we can read live Firestore data (configured + signed in). */
function useLiveFlag(): boolean {
  const { user, status } = useAuth();
  return isFirebaseConfigured && status === "ready" && !!user && !!db;
}

// ── mobile roster ────────────────────────────────────────────────────────────

export interface RunRoster {
  roster: readonly Student[];
  loading: boolean;
  live: boolean;
  /** Advance a student's status. Writes to Firestore when live, else local demo cycle. */
  cycleStatus: (id: string) => void;
}

export function useRunRoster(): RunRoster {
  const live = useLiveFlag();
  const { user } = useAuth();
  const uid = user?.uid;

  const [roster, setRoster] = useState<readonly Student[]>(STUDENTS);
  const [mockRoster, setMockRoster] = useState<readonly Student[]>(STUDENTS);
  // loading = live && we haven't received the first snapshot for this user yet.
  const [loadedUid, setLoadedUid] = useState<string | null>(null);
  const loading = live && loadedUid !== uid;

  useEffect(() => {
    if (!live || !uid || !db) return;
    const firestore = db;
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    void fetchSchoolId(uid).then((schoolId) => {
      if (cancelled) return;
      if (!schoolId) {
        setLoadedUid(uid);
        return;
      }
      const runId = `${ROSTER_BUS_ID}-${todayDateStr()}-${ROSTER_RUN_TYPE}`;
      const attQuery = query(
        collection(firestore, "schools", schoolId, "attendance"),
        where("runId", "==", runId),
      );
      unsubscribe = onSnapshot(
        attQuery,
        (snap) => {
          const list: Student[] = snap.docs
            .map((d) => {
              const data = d.data();
              return {
                id: d.id,
                name: (data.studentName as string) ?? "",
                grade: (data.grade as string) ?? "",
                status: (data.status as StudentStatus) ?? "WAITING",
              };
            })
            .sort((a, b) => a.name.localeCompare(b.name));
          setRoster(list);
          setLoadedUid(uid);
        },
        () => setLoadedUid(uid),
      );
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [live, uid]);

  function cycleStatus(id: string) {
    if (live && uid && db) {
      const firestore = db;
      const current = roster.find((s) => s.id === id);
      if (!current) return;
      const next =
        STATUS_CYCLE[(STATUS_CYCLE.indexOf(current.status) + 1) % STATUS_CYCLE.length];
      void fetchSchoolId(uid).then((schoolId) => {
        if (!schoolId) return;
        const runId = `${ROSTER_BUS_ID}-${todayDateStr()}-${ROSTER_RUN_TYPE}`;
        void setDoc(
          doc(firestore, "schools", schoolId, "attendance", `${runId}__${id}`),
          { status: next },
          { merge: true },
        );
      });
      return;
    }
    // Mock/demo mode: cycle the local list.
    setMockRoster((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const next =
          STATUS_CYCLE[(STATUS_CYCLE.indexOf(s.status) + 1) % STATUS_CYCLE.length];
        return { ...s, status: next };
      }),
    );
  }

  return { roster: live ? roster : mockRoster, loading, live, cycleStatus };
}

// ── director dashboard ───────────────────────────────────────────────────────

export interface DashboardData {
  kpis: readonly KPI[];
  buses: readonly Bus[];
  attendance: readonly AttendanceRow[];
  loading: boolean;
  live: boolean;
}

export function useDashboardData(): DashboardData {
  const live = useLiveFlag();
  const { user } = useAuth();
  const uid = user?.uid;

  const [attendance, setAttendance] = useState<AttendanceDoc[]>([]);
  const [buses, setBuses] = useState<BusDoc[]>([]);
  const [runs, setRuns] = useState<RunDoc[]>([]);
  const [loadedUid, setLoadedUid] = useState<string | null>(null);
  const loading = live && loadedUid !== uid;

  useEffect(() => {
    if (!live || !uid || !db) return;
    const firestore = db;
    let cancelled = false;
    const unsubscribers: (() => void)[] = [];

    void fetchSchoolId(uid).then((schoolId) => {
      if (cancelled) return;
      if (!schoolId) {
        setLoadedUid(uid);
        return;
      }
      const dateStr = todayDateStr();
      const base = `schools/${schoolId}`;

      const unsubBuses = onSnapshot(collection(firestore, base, "buses"), (snap) => {
        setBuses(
          snap.docs.map((d) => ({
            id: d.id,
            name: (d.data().name as string) ?? "",
            driver: (d.data().driver as string) ?? "",
          })),
        );
      });
      unsubscribers.push(unsubBuses);

      const unsubRuns = onSnapshot(
        query(collection(firestore, base, "runs"), where("date", "==", dateStr)),
        (snap) => {
          setRuns(
            snap.docs.map((d) => ({
              id: d.id,
              busId: (d.data().busId as string) ?? "",
              status: (d.data().status as RunDoc["status"]) ?? "IN_PROGRESS",
            })),
          );
        },
      );
      unsubscribers.push(unsubRuns);

      const unsubAtt = onSnapshot(
        query(collection(firestore, base, "attendance"), where("date", "==", dateStr)),
        (snap) => {
          setAttendance(
            snap.docs.map((d) => {
              const data = d.data();
              return {
                id: d.id,
                runId: (data.runId as string) ?? "",
                busId: (data.busId as string) ?? "",
                busName: (data.busName as string) ?? "",
                studentName: (data.studentName as string) ?? "",
                grade: (data.grade as string) ?? "",
                status: (data.status as StudentStatus) ?? "WAITING",
                boardedAt: (data.boardedAt as Timestamp | null) ?? null,
                droppedOffAt: (data.droppedOffAt as Timestamp | null) ?? null,
              };
            }),
          );
          setLoadedUid(uid);
        },
        () => setLoadedUid(uid),
      );
      unsubscribers.push(unsubAtt);
    });

    return () => {
      cancelled = true;
      unsubscribers.forEach((u) => u());
    };
  }, [live, uid]);

  const data = useMemo<DashboardData>(() => {
    if (!live) {
      return { kpis: KPIS, buses: BUSES, attendance: ATTENDANCE, loading: false, live: false };
    }
    const rows: AttendanceRow[] = attendance.map((a) => ({
      id: a.id,
      name: a.studentName,
      grade: a.grade,
      bus: a.busName,
      morningBoarded: formatTime(a.boardedAt),
      dropOffTime: formatTime(a.droppedOffAt),
      status: a.status,
    }));

    const onboard = countByStatus(attendance, "BOARDED");
    const dropped = countByStatus(attendance, "DROPPED_OFF");
    const waiting = countByStatus(attendance, "WAITING");
    const absent = countByStatus(attendance, "ABSENT");

    const kpis: KPI[] = [
      { ...KPIS[0], value: attendance.length },
      { ...KPIS[1], value: onboard },
      { ...KPIS[2], value: dropped },
      { ...KPIS[3], value: absent + waiting },
    ];

    const busList: Bus[] = buses.map((bus) => {
      const busAtt = attendance.filter((a) => a.busId === bus.id);
      const run = runs.find((r) => r.busId === bus.id);
      const total = busAtt.length;
      const onboardCount = countByStatus(busAtt, "BOARDED");
      const droppedCount = countByStatus(busAtt, "DROPPED_OFF");
      return {
        id: bus.id,
        name: bus.name,
        driver: bus.driver,
        status: run?.status ?? "IN_PROGRESS",
        progress: total === 0 ? 0 : Math.round(((onboardCount + droppedCount) / total) * 100),
        onboard: onboardCount,
        droppedOff: droppedCount,
        waiting: countByStatus(busAtt, "WAITING"),
      };
    });

    return { kpis, buses: busList, attendance: rows, loading, live: true };
  }, [live, attendance, buses, runs, loading]);

  return data;
}
