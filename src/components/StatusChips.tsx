import type { StudentStatus } from "@/data/students";
import { CHIPS, STATUS_META, type ChipConfig } from "@/data/students";
import { Icon } from "@/components/Icon";

interface StatusChipsProps {
  counts: Record<StudentStatus, number>;
}

export function StatusChips({ counts }: StatusChipsProps) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto py-1">
      {CHIPS.map((chip) => (
        <StatusChip key={chip.status} chip={chip} count={counts[chip.status]} />
      ))}
    </div>
  );
}

function StatusChip({ chip, count }: { chip: ChipConfig; count: number }) {
  return (
    <div className="flex h-8 flex-shrink-0 items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-label-lg text-on-surface">
      <Icon name={STATUS_META[chip.status].icon} size={18} className={chip.accentTextClass} />
      <span>
        {count} {chip.label}
      </span>
    </div>
  );
}
