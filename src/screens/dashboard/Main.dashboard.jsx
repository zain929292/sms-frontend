import React, { lazy, Suspense, useMemo } from "react";
import { Users, Calendar, HeartPulse, BedDouble, Activity,BookOpen,CalendarCheck } from "lucide-react";

import { EMPTY, ROUTES, ROLE_MESSAGE } from "../../constants/dashboard/constants";
import { useDashboardData } from "../../hook/useDashboardData";

import { WelcomeBanner } from "../../components/Dashboard/WelcomeBanner";
import { ErrorBanner } from "../../components/Dashboard/ErrorBanner";
import { StatCard } from "../../components/Dashboard/StatCard";
import { QuickActionsGrid } from "../../components/Dashboard/QuickActionsGrid";
import { RecentActivitySection } from "../../components/Dashboard/RecentActivitySection";
import { ChartsSkeleton } from "../../components/Dashboard/ChartsSkeleton";

const DashboardCharts = lazy(() => import("./Charts.dashboard"));

const Main = () => {
  const {
    currentUser,
    roleKey,
    show,
    loaded,
    failed,
    greeting,
    today,
    showAppointments,
    showAdmissions,
    appointmentSummary,
    admissionSummary,
    recentAppointments,
    recentAdmissions,
    bedOccupancy,
    lowStock,
    patients,
    medicines,
    labTests,
    appointments,
    admissions,
    staffList,
    retryLoad,
  } = useDashboardData();

const stats = (() => {
  switch (roleKey) {
    case "admin":
    case "receptionist":
      return [
        { key: "students", label: "Total Students", value: 6, Icon: Users, tone: "blue" },
        { key: "teachers", label: "Total Teachers", value: 12, Icon: Users, tone: "emerald" },
        { key: "classes", label: "Total Classes", value: 10, Icon: BookOpen, tone: "amber" },
        { key: "attendance", label: "Student Attendance", value: "85%", Icon: CalendarCheck, tone: "purple", progress: 85 },
      ];

    case "teacher":
      return [
        { key: "classes", label: "My Classes", value: 4, Icon: BookOpen, tone: "blue" },
        { key: "students", label: "My Students", value: 120, Icon: Users, tone: "amber" },
        { key: "attendance", label: "Today's Attendance", value: 105, Icon: CalendarCheck, tone: "emerald" },
        { key: "assignments", label: "Pending Assignments", value: 8, Icon: ClipboardList, tone: "teal" },
      ];

    case "student":
      return [
        { key: "subjects", label: "My Subjects", value: 6, Icon: BookOpen, tone: "blue" },
        { key: "attendance", label: "My Attendance", value: "90%", Icon: CalendarCheck, tone: "emerald", progress: 90 },
        { key: "assignments", label: "Pending Assignments", value: 3, Icon: ClipboardList, tone: "amber" },
        { key: "exams", label: "Upcoming Exams", value: 2, Icon: GraduationCap, tone: "purple" },
      ];

    case "accountant":
      return [
        { key: "fees", label: "Total Fees Collected", value: "Rs 150,000", Icon: Wallet, tone: "emerald" },
        { key: "pending", label: "Pending Fees", value: "Rs 25,000", Icon: Wallet, tone: "rose" },
        { key: "students", label: "Total Students", value: 6, Icon: Users, tone: "blue" },
        { key: "expenses", label: "Total Expenses", value: "Rs 45,000", Icon: Receipt, tone: "amber" },
      ];

    case "librarian":
      return [
        { key: "books", label: "Total Books", value: 500, Icon: BookOpen, tone: "blue" },
        { key: "issued", label: "Issued Books", value: 120, Icon: BookMarked, tone: "amber" },
        { key: "available", label: "Available Books", value: 380, Icon: BookOpen, tone: "emerald" },
        { key: "overdue", label: "Overdue Books", value: 15, Icon: Clock, tone: "rose" },
      ];

    default:
      return EMPTY;
  }
})();

  return (
    <div className="space-y-6">
      <WelcomeBanner
        greeting={greeting}
        userName={currentUser?.name}
        roleKey={roleKey}
        today={today}
        showAppointments={showAppointments}
        loadedAppointments={loaded.appointments}
        // isDoctor={isDoctor}
        // pendingCount={isDoctor ? appointmentSummary.minePending : appointmentSummary.pending}
        ROLE_MESSAGE={ROLE_MESSAGE}
      />

      {failed.length > 0 && <ErrorBanner onRetry={retryLoad} />}

      {stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <StatCard
              key={s.key}
              label={s.label}
              value={s.value}
              Icon={s.Icon}
              tone={s.tone}
              to={s.to}
              linkLabel={s.linkLabel}
              progress={s.progress}
              loading={Boolean(s.dataKey) && !loaded[s.dataKey]}
            />
          ))}
        </div>
      )}

      <QuickActionsGrid roleKey={roleKey} />

      <RecentActivitySection
        showAppointments={showAppointments}
        showAdmissions={showAdmissions}
        // isDoctor={isDoctor}
        recentAppointments={recentAppointments}
        recentAdmissions={recentAdmissions}
        loaded={loaded}
      />

      <Suspense fallback={<ChartsSkeleton />}>
        <DashboardCharts
          show={show}
          loaded={loaded}
          appointments={appointments}
          admissions={admissions}
          patients={patients}
          staff={staffList}
          medicines={medicines}
          labTests={labTests}
        />
      </Suspense>
    </div>
  );
};

export default Main;