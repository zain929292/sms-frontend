
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  UserCheck,
  CalendarCheck,
  DollarSign,
  ClipboardList,
  Building,
  Bell,
  ShieldCheck,
  KeyRound,
  CalendarDays,
  Clock,
  Wallet,
  CreditCard,
  BookMarked,
  CalendarClock,
  Award,
  Settings,
} from "lucide-react";

// Module icons
export const MODULE_CONFIG = {
  Overview: LayoutDashboard,
  "Student Management": GraduationCap,
  Academics: BookMarked,
  "Staff Management": Users,
  Finance: Wallet,
  Reports: ClipboardList,
  "Roles & Permissions": ShieldCheck,
  System: Settings,
};

// Page configuration
export const PAGE_CONFIG = {
  dashboard: {
    label: "Dashboard",
    to: "/overview/dashboard",
    icon: LayoutDashboard,
  },

  announcement: {
    label: "Announcements",
    to: "/overview/announcements",
    icon: Bell,
  },
  
  student: {
    label: "Student Admission",
    to: "/students/admission",
    icon: GraduationCap,
  },
  student_enrollment: {
    label: "Students Enrollment",
    to: "/students",
    icon: Users,
  },
  student_attendance: {
    label: "Student Attendance",
    to: "/operations/student-attendance",
    icon: CalendarCheck,
  },
  student_fee: {
    label: "Student Fees",
    to: "/finance/fees",
    icon: DollarSign,
  },
  exam_results: {
    label: "Student Results",
    to: "/student/result",
    icon: Award,
  },

  academic_session: {
    label: "Academic Sessions",
    to: "/academic/session",
    icon: CalendarDays,
  },
  class: {
    label: "Classes & Sections",
    to: "/academics/classes",
    icon: Building,
  },
  subject: {
    label: "Subjects",
    to: "/academics/subjects",
    icon: BookMarked,
  },
  timetable: {
    label: "Timetable",
    to: "/academics/timetable",
    icon: CalendarCheck,
  },
  exam: {
    label: "Examinations",
    to: "/academics/exams",
    icon: ClipboardList,
  },
  // exam_dates: {
  //   label: "Exam Dates",
  //   to: "/academics/exam-dates",
  //   icon: CalendarDays,
  // },
  // exam_schedules: {
  //   label: "Exam Schedules",
  //   to: "/academics/exam-schedules",
  //   icon: CalendarClock,
  // },

  // exam_subjects_result: {
  //   label: "Subject Results",
  //   to: "/academics/exam-subjects-results",
  //   icon: Award,
  // },

  user: {
    label: "Users",
    to: "/users",
    icon: Users,
  },
  // staff: {
  //   label: "Staff",
  //   to: "/users",
  //   icon: UserCheck,
  // },
  staff_attendance: {
    label: "Staff Attendance",
    to: "/staff/attendance",
    icon: CalendarCheck,
  },
  leave: {
    label: "Leave Requests",
    to: "/staff/leave-requests",
    icon: CalendarClock,
  },

  fee_structure: {
    label: "Fee Structure",
    to: "/finance/fee-structure",
    icon: CreditCard,
  },
  salary_structure: {
    label: "Salary Structure",
    to: "/staff/salary-structure",
    icon: Wallet,
  },
  payroll: {
    label: "Payroll",
    to: "/finance/payroll",
    icon: DollarSign,
  },
  expense: {
    label: "Expenses",
    to: "/finance/expenses",
    icon: Wallet,
  },

  role: {
    label: "Roles",
    to: "/administration/roles",
    icon: ShieldCheck,
  },
  role_permission: {
    label: "Permissions",
    to: "/administration/permissions",
    icon: KeyRound,
  },
  // module: {
  //   label: "Modules",
  //   to: "/administration/modules",
  //   icon: LayoutDashboard,
  // },
  // page: {
  //   label: "Pages",
  //   to: "/administration/pages",
  //   icon: ClipboardList,
  // },
};

// Convert API modules into sidebar groups
export const formatSidebarGroups = (modules = []) => {
  return modules
    .filter((module) => module.status === "active")
    .map((module) => ({
      moduleName: module.name,
      icon: MODULE_CONFIG[module.name] || LayoutDashboard,

      items: (module.pages || [])
        .filter((page) => page.status === "active")
        .filter((page) => PAGE_CONFIG[page.name])
        .map((page) => ({
          id: page.id,
          ...PAGE_CONFIG[page.name],
        })),
    }))
    .filter((module) => module.items.length > 0);
};
