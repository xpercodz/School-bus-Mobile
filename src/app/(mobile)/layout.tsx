import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getDictionary } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const dict = getDictionary(await getServerLocale());
  return {
    title: dict["meta.mobileTitle"],
    description: dict["meta.mobileDescription"],
  };
}

/** Phone-column shell shared by the mobile attendance screens. */
export default function MobileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-surface sm:border-x sm:border-outline-variant">
      {children}
    </div>
  );
}
