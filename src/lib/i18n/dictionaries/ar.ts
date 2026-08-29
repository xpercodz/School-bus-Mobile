/**
 * Arabic strings. Must satisfy `Messages` (the key set from en.ts). Where a
 * number is embedded we use Eastern Arabic digits (٠١٢٣) inline or a `{var}`
 * placeholder that the caller digitizes via toLocaleDigits().
 */

import type { Messages } from "./en";

export const messages: Messages = {
  // Browser-tab metadata
  "meta.title": "النقل المدرسي",
  "meta.description": "متابعة الحضور والنقل المدرسي",
  "meta.mobileTitle": "حافلة #٠٤ • الرحلة الصباحية",
  "meta.mobileDescription": "قائمة حضور الحافلة المدرسية",
  "meta.dashboardTitle": "مراقب النقل المدرسي المباشر",
  "meta.dashboardDescription": "لوحة مراقبة النقل المدرسي لحظياً",

  // Login screen
  "login.heading": "النقل المدرسي",
  "login.subtitle": "سجّل الدخول للمتابعة",
  "login.email": "البريد الإلكتروني",
  "login.password": "كلمة المرور",
  "login.emailPlaceholder": "you@school.edu",
  "login.passwordPlaceholder": "••••••••",
  "login.signIn": "تسجيل الدخول",
  "login.fallbackError": "فشل تسجيل الدخول. تحقق من البريد الإلكتروني وكلمة المرور.",
  "login.notConfiguredTitle": "لم يتم إعداد Firebase",
  "login.notConfiguredBody":
    "أدخل المفاتيح في {code} لتفعيل تسجيل الدخول. يعمل التطبيق على بيانات تجريبية.",
  "login.backToApp": "العودة إلى التطبيق",

  // Mobile roster screen
  "mobile.loading": "جارٍ تحميل القائمة…",
  "mobile.appBarTitle": "حافلة #٠٤ • الرحلة الصباحية",
  "mobile.moreOptionsAria": "خيارات إضافية",
  "mobile.moreOptionsForAria": "خيارات إضافية لـ {name}",
  "mobile.searchAria": "بحث عن الطلاب",
  "mobile.searchPlaceholder": "ابحث عن طالب...",
  "mobile.clearSearchAria": "مسح البحث",
  "mobile.emptyTitle": "لا يوجد طلاب",
  "mobile.emptySubtitle": "جرّب اسماً آخر",
  "mobile.syncStatus": "حالة المزامنة",
  "mobile.completeRun": "إنهاء الرحلة",

  // Roster filter tabs
  "tabs.filterAria": "تصفية الطلاب حسب الحالة",
  "tabs.all": "الكل",
  "tabs.waiting": "بالانتظار",
  "tabs.boarded": "على المتن",
  "tabs.done": "تم",

  // Attendance statuses (shared mobile pills/chips + dashboard badges)
  "status.boarded": "على المتن",
  "status.waiting": "بالانتظار",
  "status.droppedOff": "تم التوصيل",
  "status.absent": "غائب",

  // Route guard
  "guard.checking": "جارٍ التحقق من الوصول…",

  // Translatable prefixes embedded in data labels (e.g. "Bus 04", "Grade 4B")
  "bus.bus": "حافلة",
  "bus.grade": "الصف",

  // Run-type labels
  "runType.morningPickup": "الاستلام الصباحي",
  "runType.afternoonDropoff": "التوصيل المسائي",

  // Dashboard sidebar nav
  "nav.liveMap": "الخريطة الحية",
  "nav.fleet": "حالة الأسطول",
  "nav.routes": "المسارات",
  "nav.analytics": "التحليلات",
  "nav.reports": "التقارير",
  "nav.dispatch": "إرسال حافلة",

  // Dashboard screen
  "dashboard.loading": "جارٍ تحميل البيانات الحية…",
  "dashboard.activeFleet": "حالة الأسطول النشط",
  "dashboard.enRouteOne": "حافلة واحدة في الطريق",
  "dashboard.enRouteMany": "{count} حافلة في الطريق",
  "dashboard.liveAttendance": "حضور الطلاب المباشر",
  "dashboard.liveUpdating": "تحديث مباشر",
  "dashboard.caption": "حضور الطلاب المباشر",
  "dashboard.th.studentName": "اسم الطالب",
  "dashboard.th.grade": "الصف",
  "dashboard.th.bus": "الحافلة #",
  "dashboard.th.morningBoarded": "ركوب الصباح",
  "dashboard.th.dropOffTime": "وقت التوصيل",
  "dashboard.th.currentStatus": "الحالة الحالية",
  "dashboard.th.actions": "إجراءات",
  "dashboard.emptyTitle": "لا يوجد طلاب",
  "dashboard.emptySubtitle": "جرّب اسماً آخر",
  "dashboard.callAria": "اتصال بـ {name}",
  "dashboard.historyAria": "عرض السجل لـ {name}",
  "dashboard.driver": "السائق: {name}",
  "dashboard.inProgress": "قيد التنفيذ",
  "dashboard.completed": "مكتمل",
  "dashboard.routeProgress": "تقدم المسار",
  "dashboard.in": "داخل",
  "dashboard.out": "خارج",
  "dashboard.wait": "انتظار",
  "dashboard.today": "اليوم",
  "dashboard.runTypeAria": "نوع الرحلة",
  "dashboard.searchAria": "بحث عن الطلاب",
  "dashboard.searchPlaceholder": "ابحث عن طالب أو ولي أمر أو حافلة...",
  "dashboard.export": "تصدير CSV / PDF",
  "dashboard.notificationsAria": "الإشعارات",
  "dashboard.helpAria": "المساعدة",
  "dashboard.settingsAria": "الإعدادات",

  // KPI cards
  "kpi.total.label": "إجمالي المخصصين",
  "kpi.total.footer": "إجمالي النظام",
  "kpi.onboard.label": "على المتن حالياً",
  "kpi.onboard.footer": "+٥ في آخر دقيقة",
  "kpi.dropped.label": "تم التوصيل بأمان",
  "kpi.dropped.footer": "وصلوا إلى المدرسة",
  "kpi.absent.label": "غائب / قيد الانتظار",
  "kpi.absent.footer": "يتطلب إجراء",

  // Common
  "common.changeLanguageAria": "تغيير اللغة",
};
