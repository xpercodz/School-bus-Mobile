"use client";

import { Icon } from "@/components/Icon";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLocale } from "@/lib/i18n/context";

export function TopAppBar() {
  const { t } = useLocale();

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between bg-surface px-4">
      <div className="flex items-center gap-2">
        <Icon name="directions_bus" />
        <h1 className="text-headline-md">{t("mobile.appBarTitle")}</h1>
      </div>
      <div className="flex items-center gap-1">
        <LanguageToggle />
        <button
          type="button"
          aria-label={t("mobile.moreOptionsAria")}
          className="flex h-12 w-12 items-center justify-center rounded-full text-on-surface transition-colors hover:bg-surface-container-high"
        >
          <Icon name="more_vert" />
        </button>
      </div>
    </header>
  );
}
