"use client";

import { useMemo, useState } from "react";
import type { RunSegmentId } from "@/data/dashboard";
import {
  summarizeByBus,
  summarizeByGrade,
  useAttendanceTrend,
  useDashboardData,
} from "@/lib/school-data";
import type { TrendDay } from "@/lib/school-data";
import { AnalyticsSkeleton } from "@/components/dashboard/DashboardSkeletons";
import { DateSegmentBar } from "@/components/dashboard/DateSegmentBar";
import { Icon } from "@/components/Icon";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { useLocale } from "@/lib/i18n/context";
import {
  formatDate,
  toLocaleDigits,
  translateDataLabel,
} from "@/lib/i18n/format";

const MAX_TREND_SPAN_DAYS = 31;

/** Days between two "YYYY-MM-DD" strings (inclusive of start). */
function daysBetween(start: string, end: string): number {
  const [sy, sm, sd] = start.split("-").map(Number);
  const [ey, em, ed] = end.split("-").map(Number);
  const s = new Date(sy, sm - 1, sd).getTime();
  const e = new Date(ey, em - 1, ed).getTime();
  return Math.round((e - s) / 86_400_000) + 1;
}

/** Segmented horizontal bar showing a share of a total. */
function RateBar({ value, total, tone }: { value: number; total: number; tone: string }) {
  const { locale } = useLocale();
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 rounded bg-dash-surface-container-highest">
        <div className={`h-full rounded ${tone}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-dash-body-sm text-dash-on-surface-variant">
        {toLocaleDigits(String(pct), locale)}%
      </span>
    </div>
  );
}

/** One stacked column of the multi-day trend chart. */
function TrendBar({ day, max }: { day: TrendDay; max: number }) {
  const { t, locale } = useLocale();
  const segments = [
    { count: day.boarded, label: t("status.boarded"), cls: "bg-dash-success" },
    { count: day.droppedOff, label: t("status.droppedOff"), cls: "bg-dash-primary" },
    { count: day.absent, label: t("status.absent"), cls: "bg-dash-error" },
    { count: day.waiting, label: t("status.waiting"), cls: "bg-dash-warning" },
  ];
  return (
    <div className="flex min-w-8 flex-col items-center gap-1">
      <div className="flex h-36 w-8 flex-col-reverse justify-end overflow-hidden rounded-t bg-dash-surface-container-highest/40">
        {segments.map((seg) =>
          seg.count === 0 ? null : (
            <div
              key={seg.label}
              role="img"
              aria-label={`${seg.label}: ${toLocaleDigits(String(seg.count), locale)}`}
              className={`w-full ${seg.cls}`}
              style={{ height: `${(seg.count / max) * 100}%` }}
            />
          ),
        )}
      </div>
      <span className="text-[10px] text-dash-on-surface-variant">
        {formatDate(day.date, locale)}
      </span>
    </div>
  );
}

export default function AnalyticsPage() {
  const { t, dir, locale } = useLocale();
  const ltr = dir === "ltr";

  const [date, setDate] = useState<string | null>(null);
  const [segment, setSegment] = useState<RunSegmentId>("morning");
  const [trendStart, setTrendStart] = useState<string | null>(null);
  const [trendEnd, setTrendEnd] = useState<string | null>(null);

  const { kpis, attendance, loading, live } = useDashboardData(date, segment);

  const rows = useMemo(
    () => attendance.filter((row) => row.runType === segment),
    [attendance, segment],
  );
  const byBus = useMemo(() => summarizeByBus(rows), [rows]);
  const byGrade = useMemo(() => summarizeByGrade(rows), [rows]);

  // Trend range validation — only query when the range is sane.
  const rangeInvalid = Boolean(trendStart && trendEnd && trendStart > trendEnd);
  const rangeTooLong = Boolean(
    trendStart && trendEnd && daysBetween(trendStart, trendEnd) > MAX_TREND_SPAN_DAYS,
  );
  const rangeError = rangeInvalid
    ? t("analytics.rangeInvalid")
    : rangeTooLong
      ? t("analytics.rangeTooLong")
      : null;
  const trend = useAttendanceTrend(
    rangeError ? null : trendStart,
    rangeError ? null : trendEnd,
    segment,
  );

  const trendEmpty =
    trend.days.length > 0 &&
    trend.days.every((day) => day.boarded + day.droppedOff + day.absent + day.waiting === 0);
  const maxTotal = Math.max(
    1,
    ...trend.days.map((day) => day.boarded + day.droppedOff + day.absent + day.waiting),
  );

  const sectionTitle = (icon: string, label: string) => (
    <h2
      className={`flex items-center gap-2 border-b border-dash-outline-variant pb-2 text-dash-label-md uppercase text-dash-on-surface ${
        ltr ? "tracking-widest" : ""
      }`}
    >
      <Icon name={icon} size={18} variant="outlined" />
      {label}
    </h2>
  );

  const empty = live && !loading && rows.length === 0;

  return (
    <>
      <div className="border-b border-dash-outline-variant bg-dash-surface-container-low px-6 py-3">
        <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-dash-headline-lg text-dash-on-surface">{t("analytics.title")}</h1>
            <p className="text-dash-body-sm text-dash-on-surface-variant">{t("analytics.subtitle")}</p>
          </div>
          <DateSegmentBar
            date={date}
            onDateChange={setDate}
            segment={segment}
            onSegmentChange={setSegment}
          />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-6 p-6">
        {!live && (
          <div role="status" className="flex items-center gap-2 text-dash-body-sm text-dash-on-surface-variant">
            <Icon name="info" size={16} variant="outlined" />
            {t("dashboard.liveUnavailable")}
          </div>
        )}
        {live && loading ? (
          <div role="status" aria-label={t("dashboard.loading")}>
            <AnalyticsSkeleton />
          </div>
        ) : empty ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <Icon name="query_stats" size={40} variant="outlined" className="text-dash-on-surface-variant" />
            <p className="text-dash-headline-lg text-dash-on-surface">{t("analytics.emptyTitle")}</p>
            <p className="text-dash-body-sm text-dash-on-surface-variant">{t("analytics.emptySubtitle")}</p>
          </div>
        ) : (
          <>
            {/* KPI row */}
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {kpis.map((kpi) => (
                <MetricCard key={kpi.id} kpi={kpi} />
              ))}
            </section>

            {/* Per-bus comparison */}
            <section className="flex flex-col gap-4">
              {sectionTitle("directions_bus", t("analytics.perBus"))}
              <div className="overflow-x-auto rounded border border-dash-outline-variant bg-dash-surface">
                <table className="w-full min-w-[560px] border-collapse text-start">
                  <thead className="border-b border-dash-outline-variant bg-dash-surface-container text-dash-label-md uppercase text-dash-on-surface-variant">
                    <tr>
                      <th scope="col" className="h-10 px-4 py-2 font-medium">{t("dashboard.th.bus")}</th>
                      <th scope="col" className="h-10 px-4 py-2 font-medium">{t("dashboard.th.assigned")}</th>
                      <th scope="col" className="h-10 px-4 py-2 font-medium">{t("status.boarded")}</th>
                      <th scope="col" className="h-10 px-4 py-2 font-medium">{t("status.absent")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dash-outline-variant text-dash-body-sm text-dash-on-surface">
                    {byBus.map((s) => (
                      <tr key={s.bus} className="hover:bg-dash-surface-container-low">
                        <td className="px-4 py-3 font-medium">
                          {translateDataLabel(s.bus, locale, t)}
                        </td>
                        <td className="px-4 py-3 font-mono">
                          {toLocaleDigits(String(s.assigned), locale)}
                        </td>
                        <td className="px-4 py-3">
                          <RateBar value={s.boarded} total={s.assigned} tone="bg-dash-success" />
                        </td>
                        <td className="px-4 py-3">
                          <RateBar value={s.absent} total={s.assigned} tone="bg-dash-error" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Per-grade breakdown */}
            <section className="flex flex-col gap-4">
              {sectionTitle("school", t("analytics.perGrade"))}
              <div className="overflow-x-auto rounded border border-dash-outline-variant bg-dash-surface">
                <table className="w-full min-w-[560px] border-collapse text-start">
                  <thead className="border-b border-dash-outline-variant bg-dash-surface-container text-dash-label-md uppercase text-dash-on-surface-variant">
                    <tr>
                      <th scope="col" className="h-10 px-4 py-2 font-medium">{t("dashboard.th.grade")}</th>
                      <th scope="col" className="h-10 px-4 py-2 font-medium">{t("dashboard.th.assigned")}</th>
                      <th scope="col" className="h-10 px-4 py-2 font-medium">{t("status.boarded")}</th>
                      <th scope="col" className="h-10 px-4 py-2 font-medium">{t("status.droppedOff")}</th>
                      <th scope="col" className="h-10 px-4 py-2 font-medium">{t("status.absent")}</th>
                      <th scope="col" className="h-10 px-4 py-2 font-medium">{t("status.waiting")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dash-outline-variant text-dash-body-sm text-dash-on-surface">
                    {byGrade.map((s) => (
                      <tr key={s.grade} className="hover:bg-dash-surface-container-low">
                        <td className="px-4 py-3 font-medium">{translateDataLabel(s.grade, locale, t)}</td>
                        <td className="px-4 py-3 font-mono">{toLocaleDigits(String(s.assigned), locale)}</td>
                        <td className="px-4 py-3 font-mono">{toLocaleDigits(String(s.boarded), locale)}</td>
                        <td className="px-4 py-3 font-mono">{toLocaleDigits(String(s.droppedOff), locale)}</td>
                        <td className="px-4 py-3 font-mono">{toLocaleDigits(String(s.absent), locale)}</td>
                        <td className="px-4 py-3 font-mono">{toLocaleDigits(String(s.waiting), locale)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Multi-day trend */}
            <section className="flex flex-col gap-4">
              {sectionTitle("monitoring", t("analytics.trendTitle"))}
              <p className="text-dash-body-sm text-dash-on-surface-variant">{t("analytics.trendHint")}</p>

              <div className="flex flex-wrap items-end gap-4">
                <label className="flex flex-col gap-1">
                  <span className="text-dash-body-sm text-dash-on-surface-variant">{t("analytics.startDate")}</span>
                  <input
                    type="date"
                    value={trendStart ?? ""}
                    onChange={(e) => setTrendStart(e.target.value || null)}
                    className="h-10 rounded border border-dash-outline-variant bg-dash-surface px-3 text-dash-body-sm text-dash-on-surface focus:border-dash-primary focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-dash-body-sm text-dash-on-surface-variant">{t("analytics.endDate")}</span>
                  <input
                    type="date"
                    value={trendEnd ?? ""}
                    onChange={(e) => setTrendEnd(e.target.value || null)}
                    className="h-10 rounded border border-dash-outline-variant bg-dash-surface px-3 text-dash-body-sm text-dash-on-surface focus:border-dash-primary focus:outline-none"
                  />
                </label>
              </div>

              {rangeError && (
                <p role="alert" className="text-dash-body-sm text-dash-error">{rangeError}</p>
              )}

              {trend.loading ? (
                <div role="status" className="flex items-center gap-2 py-8 text-dash-body-sm text-dash-on-surface-variant">
                  <Icon name="progress_activity" size={16} variant="outlined" className="animate-spin" />
                  {t("analytics.trendLoading")}
                </div>
              ) : trendEmpty ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <Icon name="insights" size={32} variant="outlined" className="text-dash-on-surface-variant" />
                  <p className="text-dash-body-sm text-dash-on-surface-variant">{t("analytics.trendEmpty")}</p>
                </div>
              ) : (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {trend.days.map((day) => (
                    <TrendBar key={day.date} day={day} max={maxTotal} />
                  ))}
                </div>
              )}

              {/* Legend */}
              <div className="flex flex-wrap gap-4 text-dash-body-sm text-dash-on-surface-variant">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-3 rounded bg-dash-success" aria-hidden="true" />
                  {t("status.boarded")}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-3 rounded bg-dash-primary" aria-hidden="true" />
                  {t("status.droppedOff")}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-3 rounded bg-dash-error" aria-hidden="true" />
                  {t("status.absent")}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-3 rounded bg-dash-warning" aria-hidden="true" />
                  {t("status.waiting")}
                </span>
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
}
