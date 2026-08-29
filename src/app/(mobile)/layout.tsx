import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Bus #04 • Morning Run",
  description: "School bus attendance roster",
};

/** Phone-column shell shared by the mobile attendance screens. */
export default function MobileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-surface sm:border-x sm:border-outline-variant">
      {children}
    </div>
  );
}
