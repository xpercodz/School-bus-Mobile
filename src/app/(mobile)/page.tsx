"use client";

import { useMemo, useState } from "react";
import type { TabId } from "@/data/students";
import { countByStatus } from "@/data/students";
import { useRunRoster } from "@/lib/school-data";
import { BottomBar } from "@/components/BottomBar";
import { Icon } from "@/components/Icon";
import { RosterList } from "@/components/RosterList";
import { SearchBar } from "@/components/SearchBar";
import { SegmentedTabs } from "@/components/SegmentedTabs";
import { StatusChips } from "@/components/StatusChips";
import { TopAppBar } from "@/components/TopAppBar";

export default function Home() {
  const { roster, loading, live, cycleStatus } = useRunRoster();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("all");

  const counts = useMemo(() => countByStatus(roster), [roster]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return roster.filter(
      (student) =>
        (activeTab === "all" || student.status === activeTab) &&
        (q === "" || student.name.toLowerCase().includes(q)),
    );
  }, [roster, activeTab, query]);

  return (
    <>
      <TopAppBar />
      <main className="flex-1 space-y-6 px-4 py-4">
        <StatusChips counts={counts} />
        <SearchBar query={query} onChange={setQuery} />
        <SegmentedTabs active={activeTab} counts={counts} onSelect={setActiveTab} />
        {live && loading ? (
          <div role="status" className="flex flex-col items-center gap-2 py-16 text-center">
            <Icon name="progress_activity" size={32} className="animate-spin text-on-surface-variant" />
            <p className="text-body-lg font-medium">Loading roster…</p>
          </div>
        ) : (
          <RosterList students={filtered} onCycleStatus={cycleStatus} />
        )}
      </main>
      <BottomBar />
    </>
  );
}
