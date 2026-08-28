import { Icon } from "@/components/Icon";

export function TopAppBar() {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between bg-surface px-4">
      <div className="flex items-center gap-2">
        <Icon name="directions_bus" />
        <h1 className="text-headline-md">Bus #04 • Morning Run</h1>
      </div>
      <button
        type="button"
        aria-label="More options"
        className="flex h-12 w-12 items-center justify-center rounded-full text-on-surface transition-colors hover:bg-surface-container-high"
      >
        <Icon name="more_vert" />
      </button>
    </header>
  );
}
