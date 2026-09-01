"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

type Placement = "center" | "bottom" | "end";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  /** Localized title; also the panel's aria-label. */
  title?: string;
  /** center = modal, bottom = sheet, end = inline-end drawer. */
  placement?: Placement;
  /** false makes the overlay non-dismissable (Escape/backdrop ignored). */
  dismissable?: boolean;
  /**
   * Replaces the sizing/background classes for the chosen placement entirely —
   * used to give a placement a custom panel (e.g. the dashboard nav drawer).
   * Replaces rather than appends so a custom background can't lose a
   * specificity tie with the placement's default.
   */
  panelClassName?: string;
  children: ReactNode;
}

const WRAPPER_CLASS: Record<Placement, string> = {
  // center/bottom can exceed the viewport, so the whole overlay scrolls. The
  // end drawer is full-height with its own inner scroll wrapper, and a
  // non-scrolling wrapper lets the slide run on the compositor (a transform
  // animation inside a scroll container rasterizes per frame and jitters).
  center: "items-center justify-center overflow-y-auto overflow-x-hidden",
  bottom: "flex-col justify-end overflow-y-auto overflow-x-hidden",
  end: "justify-end overflow-hidden",
};

const PANEL_CLASS: Record<Placement, string> = {
  center: "w-full max-w-md rounded-2xl bg-surface-container-low",
  bottom: "w-full max-w-lg rounded-t-2xl bg-surface-container-low",
  end: "h-full w-80 max-w-[90vw] rounded-s-2xl bg-surface-container-low",
};

// Entry animation per placement (keyframes in globals.css): center/bottom fade
// in, the end drawer slides in from the inline-end edge (direction-aware).
const ANIMATION_CLASS: Record<Placement, string> = {
  center: "dlg-fade-in",
  bottom: "dlg-fade-in",
  end: "dlg-slide-in-end",
};

// Track open dialogs in mount order so Escape only closes the topmost one. When
// a non-dismissable confirm sits over a dismissable menu/drawer, Escape must
// not close the menu underneath it.
const dialogStack: number[] = [];
let nextDialogId = 0;

/**
 * Accessible overlay primitive used by every modal/drawer/sheet in the app.
 * Renders a fixed backdrop + panel that open with a quick fade and close
 * instantly; the body is scroll-locked while open, focus moves into the
 * panel and is trapped (Tab cycles within it), and Escape / backdrop click
 * close the *topmost* open dialog (unless non-dismissable). Uses the mobile
 * (default) palette so it renders identically on both sections; RTL-safe via
 * logical utilities.
 */
export function Dialog({
  open,
  onClose,
  title,
  placement = "center",
  dismissable = true,
  panelClassName,
  children,
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  // Keep the latest onClose without re-running the open-effect on every render.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const dialogId = ++nextDialogId;
    dialogStack.push(dialogId);
    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function isTopmost(): boolean {
      return dialogStack[dialogStack.length - 1] === dialogId;
    }

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        if (dismissable && isTopmost()) {
          event.preventDefault();
          onCloseRef.current();
        }
        return;
      }
      // Trap Tab focus within the panel.
      if (event.key === "Tab") {
        const panel = panelRef.current;
        if (!panel || !isTopmost()) return;
        const focusables = panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      const index = dialogStack.indexOf(dialogId);
      if (index >= 0) dialogStack.splice(index, 1);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      lastFocusedRef.current?.focus();
    };
  }, [open, dismissable]);

  if (!open) return null;

  // Rendered through a portal to <body> so the overlay escapes any parent
  // stacking context (e.g. the sticky z-10 top bar or the z-20 sidebar) and
  // truly sits at z-80 above everything, dimming the whole screen behind the
  // panel. Safe for SSR: `open` is always false on the server.
  // The panel's entry animation is per placement (fade / end-drawer slide).
  return createPortal(
    <div className={`fixed inset-0 z-[80] flex ${WRAPPER_CLASS[placement]}`}>
      <div
        aria-hidden="true"
        className={`fixed inset-0 bg-black/40 dlg-fade-in print:hidden ${dismissable ? "cursor-pointer" : ""}`}
        onClick={dismissable ? onClose : undefined}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? undefined}
        tabIndex={-1}
        className={`relative flex max-h-full flex-col overflow-hidden shadow-card outline-none ${ANIMATION_CLASS[placement]} ${panelClassName ?? PANEL_CLASS[placement]}`}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
