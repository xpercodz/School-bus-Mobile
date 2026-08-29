"use client";

import type { Student } from "@/data/students";
import { Icon } from "@/components/Icon";
import { StudentCard } from "@/components/StudentCard";
import { useLocale } from "@/lib/i18n/context";

interface RosterListProps {
  students: readonly Student[];
  onCycleStatus: (id: string) => void;
}

export function RosterList({ students, onCycleStatus }: RosterListProps) {
  const { t } = useLocale();

  if (students.length === 0) {
    return (
      <div role="status" className="flex flex-col items-center gap-2 py-16 text-center">
        <Icon name="search_off" size={32} className="text-on-surface-variant" />
        <p className="text-body-lg font-medium">{t("mobile.emptyTitle")}</p>
        <p className="text-body-md text-on-surface-variant">{t("mobile.emptySubtitle")}</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {students.map((student) => (
        <li key={student.id}>
          <StudentCard student={student} onCycleStatus={onCycleStatus} />
        </li>
      ))}
    </ul>
  );
}
