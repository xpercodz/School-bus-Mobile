"use client";

import { useState } from "react";
import { Dialog } from "@/components/Dialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Icon } from "@/components/Icon";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useAuth } from "@/lib/auth";
import { useUserProfile } from "@/lib/user-profile";
import { useLocale } from "@/lib/i18n/context";
import { useSignOut } from "@/lib/sign-out";

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
}

/** End-drawer settings for the dashboard top bar: account, language, sign out. */
export function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
  const { t } = useLocale();
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const signOut = useSignOut();
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSignOut() {
    setBusy(true);
    try {
      await signOut();
      setConfirmSignOut(false);
      onClose();
    } finally {
      setBusy(false);
    }
  }

  const roleLabel = profile.role
    ? t(profile.role === "director" ? "role.director" : "role.staff")
    : "—";

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        title={t("settings.title")}
        placement="end"
      >
        <div className="flex items-center justify-between border-b border-outline-variant px-4 py-3">
          <h2 className="text-headline-md text-on-surface">{t("settings.title")}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("dialog.close")}
            className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high"
          >
            <Icon name="close" variant="outlined" />
          </button>
        </div>

        <div className="flex flex-col gap-6 p-4">
          <section className="flex flex-col gap-3">
            <h3 className="text-dash-label-md uppercase text-dash-on-surface-variant">
              {t("settings.account")}
            </h3>
            <div className="flex items-center justify-between gap-4">
              <span className="text-dash-body-sm text-dash-on-surface-variant">
                {t("settings.email")}
              </span>
              <span className="truncate text-dash-body-sm font-medium text-dash-on-surface">
                {user?.email ?? "—"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-dash-body-sm text-dash-on-surface-variant">
                {t("settings.role")}
              </span>
              <span className="text-dash-body-sm font-medium text-dash-on-surface">
                {roleLabel}
              </span>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-dash-label-md uppercase text-dash-on-surface-variant">
              {t("settings.language")}
            </h3>
            <LanguageToggle variant="dash" />
          </section>

          <button
            type="button"
            onClick={() => setConfirmSignOut(true)}
            className="flex h-12 items-center justify-center gap-2 rounded-full border border-error/40 text-dash-label-md text-error transition-colors hover:bg-error/10"
          >
            <Icon name="logout" variant="outlined" />
            {t("settings.signOut")}
          </button>
        </div>
      </Dialog>

      <ConfirmDialog
        open={confirmSignOut}
        title={t("confirm.signOut.title")}
        body={t("confirm.signOut.body")}
        confirmLabel={t("dialog.confirm")}
        cancelLabel={t("dialog.cancel")}
        busy={busy}
        onConfirm={handleSignOut}
        onClose={() => setConfirmSignOut(false)}
      />
    </>
  );
}
