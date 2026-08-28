"use client";

import { useMemo, useState } from "react";
import type { Student, TabId } from "@/data/students";
import { STATUS_CYCLE, STUDENTS, countByStatus } from "@/data/students";
import { BottomBar } from "@/components/BottomBar";
import { RosterList } from "@/components/RosterList";
import { SearchBar } from "@/components/SearchBar";
import { SegmentedTabs } from "@/components/SegmentedTabs";
import { StatusChips } from "@/components/StatusChips";
import { TopAppBar } from "@/components/TopAppBar";

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [students, setStudents] = useState<readonly Student[]>(STUDENTS);

  const counts = useMemo(() => countByStatus(students), [students]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter(
      (student) =>
        (activeTab === "all" || student.status === activeTab) &&
        (q === "" || student.name.toLowerCase().includes(q)),
    );
  }, [students, activeTab, query]);

  function cycleStatus(id: string) {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id !== id) return student;
        const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(student.status) + 1) % STATUS_CYCLE.length];
        return { ...student, status: next };
      }),
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-surface sm:border-x sm:border-outline-variant">
      <TopAppBar />
      <main className="flex-1 space-y-6 px-4 py-4">
        <StatusChips counts={counts} />
        <SearchBar query={query} onChange={setQuery} />
        <SegmentedTabs active={activeTab} counts={counts} onSelect={setActiveTab} />
        <RosterList students={filtered} onCycleStatus={cycleStatus} />
      </main>
      <BottomBar />
    </div>
  );
}
