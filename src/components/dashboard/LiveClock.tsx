"use client";

import { useEffect, useState } from "react";

/**
 * Live 12-hour clock for the dashboard header.
 *
 * Ticks every second and renders HH:MM:SS AM. Hydration-safe: the client
 * starts with `now === null` (matching the server's first paint of "--:--:--")
 * and only begins ticking after mount. Decorative, so no aria-live — it
 * would announce every second to screen readers.
 */
export function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="font-mono text-sm tabular-nums text-dash-on-surface-variant">
      {now ? formatTime(now) : "--:--:--"}
    </span>
  );
}

/** Format a Date as 12-hour HH:MM:SS AM (matches code.html's clock script). */
function formatTime(date: Date): string {
  const rawHours = date.getHours();
  const hours = rawHours % 12 === 0 ? 12 : rawHours % 12;
  const ampm = rawHours >= 12 ? "PM" : "AM";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(hours)}:${pad(date.getMinutes())}:${pad(date.getSeconds())} ${ampm}`;
}
