
import React, { memo } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  UserCheck,
  BookOpen,
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
  Library,
  Bus,
  Wallet,
  CreditCard,
  BookMarked,
  NotebookPen,
  CalendarClock,
  Award,
  History,
  School,
  UserPlus,
} from "lucide-react";

export const menuIcons = {
  // Overview
  Dashboard: LayoutDashboard,
  Announcements: Bell,

  // Student Management
  Students: GraduationCap,
  Admissions: UserPlus,
  "Student Promotion": Award,

  // Academic Management
  "Academic Sessions": CalendarDays,
  "Classes & Sections": Building,
  Classes: BookOpen,
  Classrooms: Building,
  Subjects: BookMarked,
  Timetable: Clock,
  Assignments: NotebookPen,
  Examinations: ClipboardList,
  Exams: ClipboardList,

  // Staff Management
  Teachers: Users,
  Staff: UserCheck,
  Attendance: CalendarCheck,
  "Leave Requests": CalendarClock,

  // Finance
  "Fee Management": DollarSign,
  Fees: DollarSign,
  "Fee Structure": CreditCard,
  Expenses: Wallet,
  Payroll: DollarSign,

  // Operations
  Library: Library,
  Transport: Bus,

  // Reports
  Reports: FileText,

  // Role & Permission Management
  Roles: ShieldCheck,
  Permissions: KeyRound,
  Modules: Layers,
  Pages: Files,

  // System
  "School Profile": School,
  "Activity Logs": History,
  Settings: Settings,
};

export const STATIC_GROUPS = [
  {
    moduleName: "Overview",
    items: [
      {
        label: "Dashboard",
        to: "/overview/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Announcements",
        to: "/overview/announcements",
        icon: Bell,
      },
    ],
  },

  {
    moduleName: "Student Management",
    items: [
      {
        label: "Students",
        to: "/students",
        icon: GraduationCap,
      },
      {
        label: "Admissions",
        to: "/admissions",
        icon: UserPlus,
      },
      {
        label: "Student Promotion",
        to: "/student-promotion",
        icon: Award,
      },
    ],
  },

  {
    moduleName: "Academics",
    items: [
      {
        label: "Academic Sessions",
        to: "/academics/sessions",
        icon: CalendarDays,
      },
      {
        label: "Classes & Sections",
        to: "/academics/classes",
        icon: Building,
      },
      {
        label: "Classrooms",
        to: "/academics/classrooms",
        icon: School,
      },
      {
        label: "Subjects",
        to: "/academics/subjects",
        icon: BookMarked,
      },
      {
        label: "Timetable",
        to: "/academics/timetable",
        icon: Clock,
      },
      {
        label: "Assignments",
        to: "/academics/assignments",
        icon: NotebookPen,
      },
      {
        label: "Examinations",
        to: "/academics/exams",
        icon: ClipboardList,
      },
    ],
  },

  {
    moduleName: "Staff Management",
    items: [
      {
        label: "Teachers",
        to: "/staff/teachers",
        icon: Users,
      },
      {
        label: "Staff",
        to: "/staff/employees",
        icon: UserCheck,
      },
      {
        label: "Attendance",
        to: "/staff/attendance",
        icon: CalendarCheck,
      },
      {
        label: "Leave Requests",
        to: "/staff/leave-requests",
        icon: CalendarClock,
      },
    ],
  },

  {
    moduleName: "Finance",
    items: [
      {
        label: "Fee Management",
        to: "/finance/fees",
        icon: DollarSign,
      },
      {
        label: "Fee Structure",
        to: "/finance/fee-structure",
        icon: CreditCard,
      },
      {
        label: "Expenses",
        to: "/finance/expenses",
        icon: Wallet,
      },
      {
        label: "Payroll",
        to: "/finance/payroll",
        icon: DollarSign,
      },
    ],
  },

  {
    moduleName: "Operations",
    items: [
      {
        label: "Student Attendance",
        to: "/operations/student-attendance",
        icon: CalendarCheck,
      },
      {
        label: "Library",
        to: "/operations/library",
        icon: Library,
      },
      {
        label: "Transport",
        to: "/operations/transport",
        icon: Bus,
      },
    ],
  },

  {
    moduleName: "Reports",
    items: [
      {
        label: "Reports",
        to: "/reports",
        icon: FileText,
      },
    ],
  },

  {
    moduleName: "Roles & Permissions",
    items: [
      {
        label: "Roles",
        to: "/access-control/roles",
        icon: ShieldCheck,
      },
      {
        label: "Permissions",
        to: "/access-control/permissions",
        icon: KeyRound,
      },
      {
        label: "Modules",
        to: "/access-control/modules",
        icon: Layers,
      },
      {
        label: "Pages",
        to: "/access-control/pages",
        icon: Files,
      },
    ],
  },

  {
    moduleName: "System",
    items: [
      {
        label: "School Profile",
        to: "/system/school-profile",
        icon: School,
      },
      {
        label: "Activity Logs",
        to: "/system/activity-logs",
        icon: History,
      },
      {
        label: "Settings",
        to: "/admin/settings",
        icon: Settings,
      },
    ],
  },
];

export const SidebarNav = memo(({ groups = STATIC_GROUPS, collapsed, onNavigate }) => (
  <nav className="px-3 py-4 space-y-6">
    {groups.map((group) => (
      <div key={group.moduleName} className="space-y-1">
        {!collapsed && (
          <h3
            className="px-3 text-[11px] font-bold uppercase tracking-wider mb-2 opacity-70"
            style={{ color: "var(--gray)" }}
          >
            {group.moduleName}
          </h3>
        )}
        <div className="space-y-1">
          {group.items.map((item) => {
            const Icon = item.icon || ICON_MAP[item.label] || FileText;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end
                onClick={onNavigate}
                className={({ isActive: a }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                    collapsed ? "justify-center px-0" : ""
                  } ${a ? "bg-[var(--secondary)] text-white" : "text-[rgba(255,255,255,0.75)] hover:bg-slate-800/60"}`
                }
              >
                {({ isActive: a }) => (
                  <>
                    <Icon
                      size={20}
                      className="shrink-0"
                      style={{ color: a ? "var(--tertiary)" : "var(--gray)" }}
                    />
                    {!collapsed && (
                      <span className="truncate capitalize">
                        {item.label.replace(/_/g, " ")}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    ))}
  </nav>
));

SidebarNav.displayName = "SidebarNav";