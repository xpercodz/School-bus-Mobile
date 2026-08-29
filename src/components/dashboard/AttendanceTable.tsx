import type { AttendanceRow } from "@/data/dashboard";
import { DASH_STATUS_LABEL, DASH_STATUS_META } from "@/data/dashboard";
import type { StudentStatus } from "@/data/students";
import { Icon } from "@/components/Icon";

interface AttendanceTableProps {
  rows: readonly AttendanceRow[];
}

/** Row background tint by status — tints the whole row, mirrors code.html. */
function rowTint(status: StudentStatus): string {
  if (status === "BOARDED") return "bg-dash-success-container/10";
  if (status === "WAITING") return "bg-dash-warning-container/20";
  return "";
}

/** Dim "--:--:--" placeholders so a missing timestamp reads lighter than a real one. */
function timeCellClass(value: string): string {
  return value === "--:--:--" ? "text-dash-on-surface-variant" : "text-dash-on-surface";
}

/** Live student attendance table — the roster rows derived from the shared STUDENTS list. */
export function AttendanceTable({ rows }: AttendanceTableProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-dash-outline-variant pb-2">
        <h2 className="flex items-center gap-2 text-dash-label-md uppercase tracking-widest text-dash-on-surface">
          <Icon name="history_edu" size={18} variant="outlined" />
          Live Student Attendance
        </h2>
        <div className="flex items-center gap-2 text-dash-label-md text-dash-success">
          <span className="pulse-dot h-2 w-2 rounded-full bg-dash-success" aria-hidden="true" />
          Live Updating
        </div>
      </div>
      <div className="overflow-x-auto rounded border border-dash-outline-variant bg-dash-surface">
        <table className="w-full min-w-[800px] border-collapse text-left">
          <caption className="sr-only">Live student attendance</caption>
          <thead className="border-b border-dash-outline-variant bg-dash-surface-container text-dash-label-md uppercase tracking-wider text-dash-on-surface-variant">
            <tr>
              <th scope="col" className="h-12 px-4 py-3 font-medium">
                Student Name
              </th>
              <th scope="col" className="h-12 px-4 py-3 font-medium">
                Grade
              </th>
              <th scope="col" className="h-12 px-4 py-3 font-medium">
                Bus #
              </th>
              <th scope="col" className="h-12 px-4 py-3 font-medium">
                Morning Boarded
              </th>
              <th scope="col" className="h-12 px-4 py-3 font-medium">
                Drop-off Time
              </th>
              <th scope="col" className="h-12 px-4 py-3 font-medium">
                Current Status
              </th>
              <th scope="col" className="h-12 px-4 py-3 text-right font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dash-outline-variant text-dash-body-sm text-dash-on-surface">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Icon name="search_off" size={32} variant="outlined" />
                    <p className="font-medium text-dash-on-surface">No students found</p>
                    <p className="text-dash-body-sm text-dash-on-surface-variant">Try a different name</p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className={`transition-colors hover:bg-dash-surface-container-low ${rowTint(row.status)}`}
                >
                  <th scope="row" className="h-12 px-4 py-2 font-medium text-dash-on-surface">
                    {row.name}
                  </th>
                  <td className="px-4 py-2 text-dash-on-surface-variant">{row.grade}</td>
                  <td className="px-4 py-2 font-mono text-dash-body-sm">{row.bus}</td>
                  <td className={`px-4 py-2 font-mono text-dash-body-sm ${timeCellClass(row.morningBoarded)}`}>
                    {row.morningBoarded}
                  </td>
                  <td className={`px-4 py-2 font-mono text-dash-body-sm ${timeCellClass(row.dropOffTime)}`}>
                    {row.dropOffTime}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${DASH_STATUS_META[row.status]}`}
                    >
                      {DASH_STATUS_LABEL[row.status]}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      type="button"
                      aria-label={`Call ${row.name}`}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-dash-on-surface-variant transition-colors hover:bg-dash-surface-container-high hover:text-dash-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-primary"
                    >
                      <Icon name="call" size={16} variant="outlined" />
                    </button>
                    <button
                      type="button"
                      aria-label={`View history for ${row.name}`}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-dash-on-surface-variant transition-colors hover:bg-dash-surface-container-high hover:text-dash-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-primary"
                    >
                      <Icon name="history" size={16} variant="outlined" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
