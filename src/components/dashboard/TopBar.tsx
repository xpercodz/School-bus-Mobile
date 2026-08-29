"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { LanguageToggle } from "@/components/LanguageToggle";
import { LiveClock } from "./LiveClock";
import { HelpDialog } from "./HelpDialog";
import { SettingsDrawer } from "./SettingsDrawer";
import { useLocale } from "@/lib/i18n/context";

/**
 * Sticky dashboard header — brand, live clock, utility actions, and the
 * Administrator avatar. Notifications stays inert (no feed yet); Help and
 * Settings are wired to their dialogs.
 */
export function TopBar() {
  const { t } = useLocale();
  const [helpOpen, setHelpOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-dash-outline-variant bg-dash-surface px-6 print:hidden">
      <div className="flex items-center gap-3">
        <Icon name="directions_bus" size={24} variant="outlined" className="text-dash-primary" />
        <span className="text-xl font-bold text-dash-primary">TransitFlow Monitor</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex h-12 items-center gap-2 rounded border border-dash-outline-variant bg-dash-surface-container px-3 py-1.5 text-dash-on-surface-variant">
          <Icon name="schedule" size={16} variant="outlined" />
          <LiveClock />
        </div>

        <LanguageToggle variant="dash" />
        <IconButton label={t("dashboard.notificationsAria")} icon="notifications" />
        <IconButton label={t("dashboard.helpAria")} icon="help" onClick={() => setHelpOpen(true)} />
        <IconButton
          label={t("dashboard.settingsAria")}
          icon="settings"
          onClick={() => setSettingsOpen(true)}
        />

        <div className="ms-2 flex h-10 w-10 items-center justify-center rounded-full border border-dash-outline-variant bg-dash-surface-container-highest">
          <span className="text-xs font-semibold text-dash-on-surface" aria-hidden="true">
            AD
          </span>
        </div>
      </div>

      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </header>
  );
}

/** Round icon button for header utility actions (optionally wired). */
function IconButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-12 w-12 items-center justify-center rounded-full text-dash-on-surface-variant transition-colors hover:bg-dash-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-primary"
    >
      <Icon name={icon} size={24} variant="outlined" />
    </button>
  );
}
