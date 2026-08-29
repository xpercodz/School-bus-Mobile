import { Icon } from "@/components/Icon";
import { LiveClock } from "./LiveClock";

/**
 * Sticky dashboard header — brand, live clock, inert utility actions, and
 * the Administrator avatar. UI-only build: the icon buttons carry no onClick.
 */
export function TopBar() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-dash-outline-variant bg-dash-surface px-6">
      <div className="flex items-center gap-3">
        <Icon name="directions_bus" size={24} variant="outlined" className="text-dash-primary" />
        <span className="text-xl font-bold text-dash-primary">TransitFlow Monitor</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex h-12 items-center gap-2 rounded border border-dash-outline-variant bg-dash-surface-container px-3 py-1.5 text-dash-on-surface-variant">
          <Icon name="schedule" size={16} variant="outlined" />
          <LiveClock />
        </div>

        <IconButton label="Notifications" icon="notifications" />
        <IconButton label="Help" icon="help" />
        <IconButton label="Settings" icon="settings" />

        <div className="ml-2 flex h-10 w-10 items-center justify-center rounded-full border border-dash-outline-variant bg-dash-surface-container-highest">
          <span className="text-xs font-semibold text-dash-on-surface" aria-hidden="true">
            AD
          </span>
        </div>
      </div>
    </header>
  );
}

/** Inert round icon button for header utility actions. */
function IconButton({ label, icon }: { label: string; icon: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-12 w-12 items-center justify-center rounded-full text-dash-on-surface-variant transition-colors hover:bg-dash-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-primary"
    >
      <Icon name={icon} size={24} variant="outlined" />
    </button>
  );
}
