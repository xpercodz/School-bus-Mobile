import type { Student } from "@/data/students";
import { Icon } from "@/components/Icon";
import { StudentCard } from "@/components/StudentCard";

interface RosterListProps {
  students: readonly Student[];
  onCycleStatus: (id: string) => void;
}

export function RosterList({ students, onCycleStatus }: RosterListProps) {
  if (students.length === 0) {
    return (
      <div role="status" className="flex flex-col items-center gap-2 py-16 text-center">
        <Icon name="search_off" size={32} className="text-on-surface-variant" />
        <p className="text-body-lg font-medium">No students found</p>
        <p className="text-body-md text-on-surface-variant">Try a different name</p>
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
