import { LayoutDashboard, GraduationCap, Users, UserCheck, CalendarCheck, DollarSign, ClipboardList, Building, FileText, Settings, Bell, ShieldCheck, KeyRound, Layers, Files, CalendarDays, Clock, Library, Bus, Wallet, CreditCard, BookMarked, NotebookPen, CalendarClock, Award, History, School, UserPlus } from "lucide-react";

export const STATIC_GROUPS = [
  {
    moduleName: "Overview",
    items: [
      { label: "Dashboard", to: "/overview/dashboard", icon: LayoutDashboard },
      { label: "Announcements", to: "/overview/announcements", icon: Bell },
    ],
  },
  {
    moduleName: "Student Management",
    items: [
      { label: "Students", to: "/students", icon: GraduationCap },
      { label: "Admissions", to: "/admissions", icon: UserPlus },
      { label: "Student Promotion", to: "/student-promotion", icon: Award },
    ],
  },
  {
    moduleName: "Academics",
    items: [
      { label: "Academic Sessions", to: "/academics/sessions", icon: CalendarDays },
      { label: "Classes & Sections", to: "/academics/classes", icon: Building },
      { label: "Classrooms", to: "/academics/classrooms", icon: School },
      { label: "Subjects", to: "/academics/subjects", icon: BookMarked },
      { label: "Timetable", to: "/academics/timetable", icon: Clock },
      { label: "Assignments", to: "/academics/assignments", icon: NotebookPen },
      { label: "Examinations", to: "/academics/exams", icon: ClipboardList },
    ],
  },
  {
    moduleName: "Staff Management",
    items: [
      { label: "Teachers", to: "/staff/teachers", icon: Users },
      { label: "Staff", to: "/staff/employees", icon: UserCheck },
      { label: "Attendance", to: "/staff/attendance", icon: CalendarCheck },
      { label: "Leave Requests", to: "/staff/leave-requests", icon: CalendarClock },
    ],
  },
  {
    moduleName: "Finance",
    items: [
      { label: "Fee Management", to: "/finance/fees", icon: DollarSign },
      { label: "Fee Structure", to: "/finance/fee-structure", icon: CreditCard },
      { label: "Expenses", to: "/finance/expenses", icon: Wallet },
      { label: "Payroll", to: "/finance/payroll", icon: DollarSign },
    ],
  },
  {
    moduleName: "Operations",
    items: [
      { label: "Student Attendance", to: "/operations/student-attendance", icon: CalendarCheck },
      { label: "Library", to: "/operations/library", icon: Library },
      { label: "Transport", to: "/operations/transport", icon: Bus },
    ],
  },
  {
    moduleName: "Reports",
    items: [
      { label: "Reports", to: "/reports", icon: FileText },
    ],
  },
  {
    moduleName: "Roles & Permissions",
    items: [
      { label: "Roles", to: "/access-control/roles", icon: ShieldCheck },
      { label: "Permissions", to: "/access-control/permissions", icon: KeyRound },
      { label: "Modules", to: "/access-control/modules", icon: Layers },
      { label: "Pages", to: "/access-control/pages", icon: Files },
    ],
  },
  {
    moduleName: "System",
    items: [
      { label: "School Profile", to: "/system/school-profile", icon: School },
      { label: "Activity Logs", to: "/system/activity-logs", icon: History },
      { label: "Settings", to: "/admin/settings", icon: Settings },
    ],
  },
];
