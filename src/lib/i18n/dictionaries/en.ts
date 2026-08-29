/**
 * English strings. This object is the source of truth for the message key set:
 * `Messages` is derived from it and `ar.ts` must satisfy it. Keys are flat
 * dotted strings; `{var}` placeholders are filled by `t(key, vars)`.
 */

export const messages = {
  // Browser-tab metadata
  "meta.title": "School Bus Transit",
  "meta.description": "School bus attendance and transit monitoring",
  "meta.mobileTitle": "Bus #04 • Morning Run",
  "meta.mobileDescription": "School bus attendance roster",
  "meta.dashboardTitle": "School Transit Live Monitor",
  "meta.dashboardDescription": "Real-time school transit monitoring dashboard",

  // Login screen
  "login.heading": "School Bus Transit",
  "login.subtitle": "Sign in to continue",
  "login.email": "Email",
  "login.password": "Password",
  "login.emailPlaceholder": "you@school.edu",
  "login.passwordPlaceholder": "••••••••",
  "login.signIn": "Sign in",
  "login.fallbackError": "Sign in failed. Check your email and password.",
  "login.notConfiguredTitle": "Firebase not configured",
  "login.notConfiguredBody":
    "Fill the keys in {code} to enable sign-in. The app is running on mock data.",
  "login.backToApp": "Back to the app",

  // Mobile roster screen
  "mobile.loading": "Loading roster…",
  "mobile.appBarTitle": "Bus #04 • Morning Run",
  "mobile.moreOptionsAria": "More options",
  "mobile.moreOptionsForAria": "More options for {name}",
  "mobile.searchAria": "Search students",
  "mobile.searchPlaceholder": "Search student...",
  "mobile.clearSearchAria": "Clear search",
  "mobile.emptyTitle": "No students found",
  "mobile.emptySubtitle": "Try a different name",
  "mobile.syncStatus": "Sync Status",
  "mobile.completeRun": "Complete Run",

  // Roster filter tabs
  "tabs.filterAria": "Filter students by status",
  "tabs.all": "All",
  "tabs.waiting": "Waiting",
  "tabs.boarded": "Boarded",
  "tabs.done": "Done",

  // Attendance statuses (shared mobile pills/chips + dashboard badges)
  "status.boarded": "Boarded",
  "status.waiting": "Waiting",
  "status.droppedOff": "Dropped Off",
  "status.absent": "Absent",

  // Route guard
  "guard.checking": "Checking access…",

  // Translatable prefixes embedded in data labels (e.g. "Bus 04", "Grade 4B")
  "bus.bus": "Bus",
  "bus.grade": "Grade",

  // Run-type labels
  "runType.morningPickup": "Morning Pickup",
  "runType.afternoonDropoff": "Afternoon Drop-off",

  // Dashboard sidebar nav
  "nav.liveMap": "Live Map",
  "nav.fleet": "Fleet Status",
  "nav.routes": "Routes",
  "nav.analytics": "Analytics",
  "nav.reports": "Reports",
  "nav.dispatch": "Dispatch Vehicle",

  // Dashboard screen
  "dashboard.loading": "Loading live data…",
  "dashboard.activeFleet": "Active Fleet Status",
  "dashboard.enRouteOne": "{count} Bus En Route",
  "dashboard.enRouteMany": "{count} Buses En Route",
  "dashboard.liveAttendance": "Live Student Attendance",
  "dashboard.liveUpdating": "Live Updating",
  "dashboard.caption": "Live student attendance",
  "dashboard.th.studentName": "Student Name",
  "dashboard.th.grade": "Grade",
  "dashboard.th.bus": "Bus #",
  "dashboard.th.morningBoarded": "Morning Boarded",
  "dashboard.th.dropOffTime": "Drop-off Time",
  "dashboard.th.currentStatus": "Current Status",
  "dashboard.th.actions": "Actions",
  "dashboard.emptyTitle": "No students found",
  "dashboard.emptySubtitle": "Try a different name",
  "dashboard.callAria": "Call {name}",
  "dashboard.historyAria": "View history for {name}",
  "dashboard.driver": "Driver: {name}",
  "dashboard.inProgress": "In Progress",
  "dashboard.completed": "Completed",
  "dashboard.routeProgress": "Route Progress",
  "dashboard.in": "In",
  "dashboard.out": "Out",
  "dashboard.wait": "Wait",
  "dashboard.today": "Today",
  "dashboard.runTypeAria": "Run type",
  "dashboard.searchAria": "Search students",
  "dashboard.searchPlaceholder": "Search student, guardian, or bus...",
  "dashboard.export": "Export CSV / PDF",
  "dashboard.notificationsAria": "Notifications",
  "dashboard.helpAria": "Help",
  "dashboard.settingsAria": "Settings",

  // KPI cards
  "kpi.total.label": "Total Assigned",
  "kpi.total.footer": "System Total",
  "kpi.onboard.label": "Currently Onboard",
  "kpi.onboard.footer": "+5 in last min",
  "kpi.dropped.label": "Safely Dropped Off",
  "kpi.dropped.footer": "Arrived at Campus",
  "kpi.absent.label": "Marked Absent / Pending",
  "kpi.absent.footer": "Action Required",

  // Common
  "common.changeLanguageAria": "Change language",
};

/** Key set is the object's keys; every value is a plain string. */
export type Messages = Record<keyof typeof messages, string>;
