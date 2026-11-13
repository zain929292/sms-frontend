
import {
  Users,
  Calendar,
  BookOpen,
  CalendarCheck,
  Wallet,
  GraduationCap,
  UserPlus,
  FileText,
  Activity,
  ClipboardList,
} from "lucide-react";

// Common constants
export const EMPTY = [];

export const REFRESH_TTL_MS = 60 * 1000;

// Dashboard routes
export const ROUTES = {
  dashboard: "/overview/dashboard",

  students: "/students",
  studentAdmission: "/students/admission",
  attendance: "/operations/student-attendance",

  teachers: "/users",
  staffAttendance: "/staff/attendance",
  leaveRequests: "/staff/leave-requests",

  classes: "/academics/classes",
  sessions: "/academic/session",
  subjects: "/academics/subjects",
  timetable: "/academics/timetable",
  assignments: "/academics/assignments",
  exams: "/academics/exams",

  fees: "/finance/fees",
  feeStructure: "/finance/fee-structure",
  salaryStructure: "/staff/salary-structure",
  payroll: "/finance/payroll",

  announcements: "/overview/announcements",
  reports: "/reports",
  schoolProfile: "/system/school-profile",
  settings: "/admin/settings",
};

// Dashboard data fetchers
export const FETCHERS = {};

export const ALL_DATA = Object.keys(FETCHERS);

// Role-based dashboard data
export const ROLE_DATA = {
  admin: ALL_DATA,
  teacher: ALL_DATA,
  student: ALL_DATA,
  parent: ALL_DATA,
};

// Role messages
export const ROLE_MESSAGE = {
  admin: "Here's what's happening at your school today.",
  teacher: "Here is your class overview and upcoming schedule for today.",
  student: "Welcome back! Check your classes, assignments, and announcements.",
  parent: "Here is an overview of your child's academic progress and attendance.",
};

// UI tones
export const TONES = {
  blue: {
    bg: "bg-blue-50",
    icon: "text-blue-600",
    link: "text-blue-600 hover:text-blue-700",
  },
  emerald: {
    bg: "bg-emerald-50",
    icon: "text-emerald-600",
    link: "text-emerald-600 hover:text-emerald-700",
  },
  amber: {
    bg: "bg-amber-50",
    icon: "text-amber-600",
    link: "text-amber-600 hover:text-amber-700",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "text-purple-600",
    link: "text-purple-600 hover:text-purple-700",
  },
  teal: {
    bg: "bg-teal-50",
    icon: "text-teal-600",
    link: "text-teal-600 hover:text-teal-700",
  },
  rose: {
    bg: "bg-rose-50",
    icon: "text-rose-600",
    link: "text-rose-600 hover:text-rose-700",
  },
};

// Admin quick actions
const ADMIN_ACTIONS = [
  {
    label: "Add Student",
    Icon: UserPlus,
    color: "bg-blue-500",
    to: ROUTES.students,
  },
  {
    label: "Add Teacher",
    Icon: Users,
    color: "bg-teal-500",
    to: ROUTES.teachers,
  },
  {
    label: "Manage Classes",
    Icon: BookOpen,
    color: "bg-emerald-500",
    to: ROUTES.classes,
  },
  {
    label: "Mark Attendance",
    Icon: CalendarCheck,
    color: "bg-purple-500",
    to: ROUTES.attendance,
  },
  {
    label: "Manage Exams",
    Icon: GraduationCap,
    color: "bg-amber-500",
    to: ROUTES.exams,
  },
  {
    label: "Collect Fees",
    Icon: Wallet,
    color: "bg-rose-500",
    to: ROUTES.fees,
  },
];

// Role-based quick actions
export const QUICK_ACTIONS = {
  admin: ADMIN_ACTIONS,

  teacher: [
    {
      label: "My Classes",
      Icon: BookOpen,
      color: "bg-blue-500",
      to: ROUTES.classes,
    },
    {
      label: "Mark Attendance",
      Icon: CalendarCheck,
      color: "bg-teal-500",
      to: ROUTES.attendance,
    },
    {
      label: "My Timetable",
      Icon: Calendar,
      color: "bg-emerald-500",
      to: ROUTES.timetable,
    },
    {
      label: "Manage Exams",
      Icon: GraduationCap,
      color: "bg-purple-500",
      to: ROUTES.exams,
    },
  ],

  student: [
    {
      label: "My Timetable",
      Icon: Calendar,
      color: "bg-blue-500",
      to: ROUTES.timetable,
    },
    {
      label: "My Attendance",
      Icon: CalendarCheck,
      color: "bg-teal-500",
      to: ROUTES.attendance,
    },
    {
      label: "My Fees",
      Icon: Wallet,
      color: "bg-emerald-500",
      to: ROUTES.fees,
    },
  ],

  parent: [
    {
      label: "Child Attendance",
      Icon: CalendarCheck,
      color: "bg-blue-500",
      to: ROUTES.attendance,
    },
    {
      label: "Fee Details",
      Icon: Wallet,
      color: "bg-teal-500",
      to: ROUTES.fees,
    },
    {
      label: "Academic Progress",
      Icon: GraduationCap,
      color: "bg-purple-500",
      to: ROUTES.exams,
    },
  ],
};

// Default dashboard action
export const DEFAULT_ACTIONS = [
  {
    label: "Dashboard",
    Icon: Activity,
    color: "bg-blue-500",
    to: ROUTES.dashboard,
  },
];

// Badge styles
export const APPOINTMENT_BADGE = {
  Completed: "bg-emerald-100 text-emerald-800",
  Pending: "bg-amber-100 text-amber-800",
};

export const ADMISSION_ACTIVE_BADGE =
  "bg-emerald-100 text-emerald-800";

export const DEFAULT_BADGE =
  "bg-slate-200 text-slate-700";
