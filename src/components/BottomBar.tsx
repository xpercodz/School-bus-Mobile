import { Icon } from "@/components/Icon";

export function BottomBar() {
  return (
    <footer className="sticky bottom-0 z-50 flex h-20 items-center justify-between border-t border-outline-variant bg-surface-container px-4">
      <div className="flex items-center gap-2 px-2 text-label-lg text-primary">
        <Icon name="cloud_done" size={18} />
        Sync Status
      </div>
      <button
        type="button"
        disabled
        className="flex h-14 cursor-not-allowed items-center gap-2 rounded-full bg-surface-variant px-8 text-label-lg text-on-surface-variant opacity-50"
      >
        <Icon name="check" />
        Complete Run
      </button>
    </footer>
  );
}
