import { Icon } from "@/components/Icon";
import { NAV_ITEMS } from "@/data/dashboard";

interface SidebarProps {
  /** id of the nav item currently shown (e.g. "live-map"); rendered as the active page. */
  activeId: string;
  /** The signed-in tenant's school name (shown as the subtitle). */
  schoolName?: string | null;
}

/** Fixed left navigation rail for the director dashboard (School Transit Live Monitor). */
export function Sidebar({ activeId, schoolName }: SidebarProps) {
  return (
    <nav className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col gap-0 border-r border-dash-outline-variant bg-dash-surface-container-low p-4">
      <div className="mb-8 mt-4 px-4">
        <h1 className="text-xl font-bold text-dash-primary">Fleet Ops</h1>
        <p className="truncate text-dash-body-sm text-dash-on-surface-variant">
          {schoolName ?? "Terminal A-12"}
        </p>
      </div>

      <ul className="flex flex-grow flex-col gap-2 px-2">
        {NAV_ITEMS.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id}>
              {active ? (
                <a
                  href={item.href}
                  aria-current="page"
                  className="flex h-12 items-center gap-3 rounded-full px-4 py-3 font-bold text-dash-on-secondary-container bg-dash-secondary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-primary"
                >
                  <Icon name={item.icon} size={20} variant="outlined" />
                  <span className="text-dash-label-md">{item.label}</span>
                </a>
              ) : (
                <button
                  type="button"
                  className="flex h-12 items-center gap-3 rounded-full px-4 py-3 text-dash-on-surface-variant transition-all hover:bg-dash-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-primary"
                >
                  <Icon name={item.icon} size={20} variant="outlined" />
                  <span className="text-dash-label-md">{item.label}</span>
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mb-4 mt-auto px-4">
        <button
          type="button"
          className="w-full h-12 rounded-full bg-dash-primary text-dash-on-primary text-dash-label-md transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-primary"
        >
          Dispatch Vehicle
        </button>
      </div>
    </nav>
  );
}
