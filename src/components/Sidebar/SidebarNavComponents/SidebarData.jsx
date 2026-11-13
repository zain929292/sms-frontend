
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  UserCheck,
  CalendarCheck,
  DollarSign,
  ClipboardList,
  Building,
  FileText,
  Settings,
  Bell,
  ShieldCheck,
  KeyRound,
  Layers,
  Files,
  CalendarDays,
  Clock,
  Wallet,
  CreditCard,
  BookMarked,
  NotebookPen,
  CalendarClock,
  Award,
  History,
  School,
} from "lucide-react";

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
      { label: "Student Admission", to: "/students/admission", icon: GraduationCap },
      { label: "Students", to: "/students", icon: Users },
      { label: "Student Attendance", to: "/operations/student-attendance", icon: CalendarCheck },
    ],
  },

  {
    moduleName: "Academics",
    items: [
      { label: "Academic Sessions", to: "/academic/session", icon: CalendarDays },
      { label: "Classes & Sections", to: "/academics/classes", icon: Building },
      { label: "Subjects", to: "/academics/subjects", icon: BookMarked },
      { label: "Timetable", to: "/academics/timetable", icon: Clock },
      { label: "Assignments", to: "/academics/assignments", icon: NotebookPen },
      { label: "Examinations", to: "/academics/exams", icon: ClipboardList },
    ],
  },

  {
    moduleName: "Staff Management",
    items: [
      { label: "Staff", to: "/users", icon: Users },
      { label: "Staff Attendance", to: "/staff/attendance", icon: UserCheck },
      { label: "Leave Requests", to: "/staff/leave-requests", icon: CalendarClock },
    ],
  },

  {
    moduleName: "Finance",
    items: [
      { label: "Fee Structure", to: "/finance/fee-structure", icon: CreditCard },
      { label: "Fee Management", to: "/finance/fees", icon: DollarSign },
      { label: "Salary Structure", to: "/staff/salary-structure", icon: Wallet },
      { label: "Payroll", to: "/finance/payroll", icon: DollarSign },
      { label: "Expenses", to: "/finance/expenses", icon: Wallet },
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
