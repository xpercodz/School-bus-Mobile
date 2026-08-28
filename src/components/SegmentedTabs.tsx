import { useRef, type KeyboardEvent } from "react";
import type { StudentStatus } from "@/data/students";
import { TABS, type TabId } from "@/data/students";

interface SegmentedTabsProps {
  active: TabId;
  counts: Record<StudentStatus, number>;
  onSelect: (tab: TabId) => void;
}

export function SegmentedTabs({ active, counts, onSelect }: SegmentedTabsProps) {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({
    all: null,
    BOARDED: null,
    WAITING: null,
    DROPPED_OFF: null,
    ABSENT: null,
  });

  // WAI-ARIA tabs pattern: roving tabindex + arrow-key navigation.
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = TABS.findIndex((tab) => tab.id === active);
    let next = -1;
    if (event.key === "ArrowRight") next = (current + 1) % TABS.length;
    else if (event.key === "ArrowLeft") next = (current - 1 + TABS.length) % TABS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = TABS.length - 1;
    if (next === -1) return;
    event.preventDefault();
    const target = TABS[next];
    onSelect(target.id);
    tabRefs.current[target.id]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label="Filter students by status"
      onKeyDown={handleKeyDown}
      className="no-scrollbar flex overflow-x-auto border-b border-outline-variant"
    >
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        const count = tab.id === "all" ? total : counts[tab.id];
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            ref={(el) => {
              tabRefs.current[tab.id] = el;
            }}
            onClick={() => onSelect(tab.id)}
            className={`flex h-12 min-w-20 flex-1 items-center justify-center whitespace-nowrap border-b-2 px-4 text-label-lg transition-colors hover:bg-surface-container/50 ${
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant"
            }`}
          >
            {tab.label} ({count})
          </button>
        );
      })}
    </div>
  );
}
