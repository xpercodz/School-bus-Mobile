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
  "mobile.appBarTitle": "Bus #{bus} • Morning Run",
  "mobile.appBarTitleNoBus": "Morning Run",
  "mobile.moreOptionsAria": "More options",
  "mobile.moreOptionsForAria": "More options for {name}",
  "mobile.searchAria": "Search students",
  "mobile.searchPlaceholder": "Search student...",
  "mobile.clearSearchAria": "Clear search",
  "mobile.emptyTitle": "No students found",
  "mobile.emptySubtitle": "Try a different name",
  "mobile.syncStatus": "Sync Status",
  "mobile.completeRun": "Complete Run",
  "mobile.completed": "Completed",
  "mobile.signInPromptTitle": "Sign in to see the live roster",
  "mobile.signInPromptBody":
    "The roster loads from your school's live data after you sign in.",
  "mobile.signInAction": "Sign in",
  "mobile.noBusTitle": "No bus assigned",
  "mobile.noBusBody":
    "Your account isn't linked to a bus yet. Ask your school director to assign you one.",

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
  "nav.assignments": "Assignments",
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
  "dashboard.th.assigned": "Assigned",
  "dashboard.th.completion": "Completion",
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
  "dashboard.export": "Export CSV / PDF",
  "dashboard.selectDate": "Select a date",
  "dashboard.prevMonth": "Previous month",
  "dashboard.nextMonth": "Next month",
  "dashboard.liveUnavailable": "Live data unavailable — sign in to continue.",
  "dashboard.notificationsAria": "Notifications",
  "dashboard.helpAria": "Help",
  "dashboard.settingsAria": "Settings",
  "dashboard.noContactNumber": "No contact number on file",

  // Student list (dashboard) — search, filters, and pagination
  "studentList.searchAria": "Search students",
  "studentList.searchPlaceholder": "Search student name…",
  "studentList.statusAria": "Filter by status",
  "studentList.gradeAria": "Filter by grade",
  "studentList.allGrades": "All grades",
  "studentList.clear": "Clear filters",
  "studentList.showing": "Showing {start}–{end} of {total}",
  "studentList.previousAria": "Previous page",
  "studentList.nextAria": "Next page",
  "studentList.pageAria": "Page {page} of {pages}",

  // KPI cards
  "kpi.total.label": "Total Assigned",
  "kpi.total.footer": "System Total",
  "kpi.onboard.label": "Currently Onboard",
  "kpi.onboard.footer": "+5 in last min",
  "kpi.dropped.label": "Safely Dropped Off",
  "kpi.dropped.footer": "Arrived at Campus",
  "kpi.absent.label": "Marked Absent / Pending",
  "kpi.absent.footer": "Action Required",

  // Roles
  "role.director": "Director",
  "role.staff": "Staff",

  // Shared dialogs
  "dialog.close": "Close",
  "dialog.cancel": "Cancel",
  "dialog.confirm": "Confirm",

  // Run details (mobile overflow sheet)
  "runDetails.title": "Run Details",
  "runDetails.bus": "Bus",
  "runDetails.type": "Run Type",
  "runDetails.date": "Date",
  "runDetails.status": "Status",
  "runDetails.noRun": "No run started yet",

  // Student attendance history
  "history.title": "Attendance History",
  "history.loading": "Loading history…",
  "history.empty": "No attendance history for this student",
  "history.loadMore": "Load more",
  "history.col.date": "Date",
  "history.col.run": "Run",
  "history.col.status": "Status",
  "history.col.bus": "Bus",

  // Confirm dialogs
  "confirm.completeRun.title": "Complete this run?",
  "confirm.completeRun.body":
    "Waiting students will be marked absent. This can't be undone.",
  "confirm.signOut.title": "Sign out?",
  "confirm.signOut.body": "You'll be returned to the login screen.",

  // Dispatch vehicle
  "dispatch.title": "Dispatch Vehicle",
  "dispatch.bus": "Bus",
  "dispatch.runType": "Run Type",
  "dispatch.date": "Date",
  "dispatch.selectBus": "Select a bus",
  "dispatch.submit": "Dispatch",
  "dispatch.loadError": "Couldn't load the bus list.",

  // Student kebab menu
  "kebab.viewHistory": "View history",
  "kebab.markAbsent": "Mark absent",

  // Settings drawer
  "settings.title": "Settings",
  "settings.account": "Account",
  "settings.email": "Email",
  "settings.role": "Role",
  "settings.language": "Language",
  "settings.signOut": "Sign out",

  // Help dialog
  "help.title": "Help",
  "help.content":
    "The dashboard shows live bus status, KPIs, and the student attendance roster.\nUse the run-type control to switch Morning Pickup / Afternoon Drop-off.\nSet a date to view a past day.\nDispatch creates a new run and pre-registers waiting students.\nExport downloads the current filtered rows as CSV.",

  // Toasts
  "toast.exported": "Exported {count} rows",
  "toast.dispatched": "Vehicle dispatched",
  "toast.runCompleted": "Run completed",
  "toast.signedOut": "Signed out",
  "toast.markedAbsent": "{name} marked absent",
  "toast.dispatchExists": "A run already exists for this bus, date and type",
  "toast.error": "Something went wrong. Please try again.",

  // Analytics
  "analytics.title": "Attendance Analytics",
  "analytics.subtitle": "Attendance summary for the selected day and run segment",
  "analytics.perBus": "Per-Bus Comparison",
  "analytics.perGrade": "Per-Grade Breakdown",
  "analytics.trendTitle": "Multi-day Trend",
  "analytics.trendHint": "Daily totals across a date range",
  "analytics.startDate": "Start date",
  "analytics.endDate": "End date",
  "analytics.trendLoading": "Loading trend…",
  "analytics.trendEmpty": "No attendance data in this range",
  "analytics.rangeTooLong": "The date range is too long — maximum 31 days",
  "analytics.rangeInvalid": "Start date must be before end date",
  "analytics.roster": "Student Roster",
  "analytics.emptyTitle": "No attendance data",
  "analytics.emptySubtitle": "No records exist for this date and run segment yet.",

  // Reports
  "reports.title": "Attendance Report",
  "reports.subtitle": "Printable attendance summary for the selected day and run segment",
  "reports.overview": "Overview",
  "reports.byBus": "Summary by Bus",
  "reports.byGrade": "Summary by Grade",
  "reports.roster": "Attendance Roster",
  "reports.print": "Print",
  "reports.export": "Export CSV",
  "reports.emptyTitle": "No attendance data",
  "reports.emptySubtitle": "No records exist for this date and run segment yet.",

  // Assignments (director — driver ↔ bus, student ↔ bus)
  "assignments.title": "Assignments",
  "assignments.subtitle": "Assign drivers and students to buses",
  "assignments.drivers": "Drivers",
  "assignments.th.bus": "Bus",
  "assignments.th.driver": "Assigned Driver",
  "assignments.th.assignedStudents": "Assigned Students",
  "assignments.unassigned": "—",
  "assignments.students": "Students",
  "assignments.th.studentName": "Student Name",
  "assignments.th.grade": "Grade",
  "assignments.th.currentBus": "Current Bus",
  "assignments.noBus": "No bus",
  "assignments.studentsEmpty": "No students found",
  "assignments.studentsEmptyHint": "Adjust your search or load more students.",
  "assignments.loadingStudents": "Loading students…",
  "assignments.loadMore": "Load more",
  "assignments.driverAssigned": "Driver assigned",
  "assignments.driverCleared": "Driver unassigned",
  "assignments.studentMoved": "Student bus updated",

  // Common
  "common.changeLanguageAria": "Change language",
  "common.loading": "Loading",
};

/** Key set is the object's keys; every value is a plain string. */
export type Messages = Record<keyof typeof messages, string>;
