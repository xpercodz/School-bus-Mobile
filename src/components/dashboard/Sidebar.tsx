"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { NAV_ITEMS } from "@/data/dashboard";
import { DispatchModal } from "./DispatchModal";
import { useLocale } from "@/lib/i18n/context";
import type { MessageKey } from "@/lib/i18n/types";

/** Nav label key per item id (labels are translated, ids are stable). */
const NAV_LABEL_KEY: Record<string, MessageKey> = {
  "live-map": "nav.liveMap",
  fleet: "nav.fleet",
  routes: "nav.routes",
  analytics: "nav.analytics",
  reports: "nav.reports",
  assignments: "nav.assignments",
};

interface SidebarProps {
  /** id of the nav item currently shown (e.g. "live-map"); rendered as the active page. */
  activeId: string;
  /** The signed-in tenant's school name (shown as the subtitle). */
  schoolName?: string | null;
}

/** Fixed nav rail for the director dashboard — flips to the right in RTL. */
export function Sidebar({ activeId, schoolName }: SidebarProps) {
  const { t } = useLocale();
  const [dispatchOpen, setDispatchOpen] = useState(false);

  return (
    <nav className="fixed inset-y-0 start-0 z-20 flex w-64 flex-col gap-0 border-e border-dash-outline-variant bg-dash-surface-container-low p-4 print:hidden">
      <div className="mb-8 mt-4 px-4">
        <h1 className="text-xl font-bold text-dash-primary">Fleet Ops</h1>
        <p className="truncate text-dash-body-sm text-dash-on-surface-variant">
          {schoolName ?? "Terminal A-12"}
        </p>
      </div>

      <ul className="flex flex-grow flex-col gap-2 px-2">
        {NAV_ITEMS.map((item) => {
          const active = item.id === activeId;
          const linkClass = `flex h-12 items-center gap-3 rounded-full px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-primary ${
            active
              ? "font-bold text-dash-on-secondary-container bg-dash-secondary-container"
              : "text-dash-on-surface-variant transition-all hover:bg-dash-surface-container-high"
          }`;
          const content = (
            <>
              <Icon name={item.icon} size={20} variant="outlined" />
              <span className="text-dash-label-md">{t(NAV_LABEL_KEY[item.id])}</span>
            </>
          );
          return (
            <li key={item.id}>
              {item.href ? (
                // next/link = client-side transition; a plain <a> would hard-reload
                // the shell and re-trigger the RequireRole guard ("Checking access…").
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={linkClass}
                >
                  {content}
                </Link>
              ) : (
                <button
                  type="button"
                  aria-current={active ? "page" : undefined}
                  className={linkClass}
                >
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mb-4 mt-auto px-4">
        <button
          type="button"
          onClick={() => setDispatchOpen(true)}
          className="w-full h-12 rounded-full bg-dash-primary text-dash-on-primary text-dash-label-md transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-primary"
        >
          {t("nav.dispatch")}
        </button>
      </div>

      <DispatchModal open={dispatchOpen} onClose={() => setDispatchOpen(false)} />
    </nav>
  );
}
