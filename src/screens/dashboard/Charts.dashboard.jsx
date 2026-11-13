
import { memo } from "react";

import DonutCard from "../../components/Dashboard.Charts/DonutCard";
import TrendCard from "../../components/Dashboard.Charts/TrendCard";
import BarCard from "../../components/Dashboard.Charts/BarCard";

import {
  Users,
  BookOpen,
  CalendarCheck,
  GraduationCap,
  Wallet,
  ClipboardList,
} from "lucide-react";

import {
  ASSIGNMENTS_DATA,
  EXAMS_DATA,
} from "../../components/Dashboard.Charts/chartData";

const DashboardCharts = ({ stats }) => {
  // Students by Status
  const studentsByStatus = [
    { name: "Active", value: stats?.students?.active ?? 0 },
    { name: "Withdrawn", value: stats?.students?.withdrawn ?? 0 },
    { name: "Completed", value: stats?.students?.completed ?? 0 },
  ];

  // Student Attendance
  const attendanceData = [
    { name: "Present", value: stats?.attendance?.present ?? 0 },
    { name: "Absent", value: stats?.attendance?.absent ?? 0 },
    { name: "Leave", value: stats?.attendance?.leave ?? 0 },
  ];

  // Students by Class
  const studentsByClass = (stats?.students_by_classes ?? []).map((item) => ({
    name: item.class_name,
    value: item.total_students,
  }));

  // Fee Collection Overview
  const feesData = [
    { name: "Collected", value: stats?.fees?.collected ?? 0 },
    { name: "Pending", value: stats?.fees?.pending ?? 0 },
    { name: "Partial", value: stats?.fees?.partial ?? 0 },
  ];

  return (
    <div className="space-y-4">
      {/* Student Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DonutCard
          title="Students by Status"
          Icon={Users}
          iconClass="text-blue-600"
          data={studentsByStatus}
        />

        <DonutCard
          title="Attendance Overview"
          Icon={CalendarCheck}
          iconClass="text-emerald-600"
          data={attendanceData}
        />
      </div>

      {/* Monthly Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TrendCard
          title="Monthly Student Enrollment"
          Icon={Users}
          iconClass="text-blue-600"
          data={stats?.monthly_trends?.monthly_students ?? []}
          dataKey="students"
          color="#034A52"
        />

        <TrendCard
          title="Monthly Attendance Trend (%)"
          Icon={CalendarCheck}
          iconClass="text-emerald-600"
          data={stats?.monthly_trends?.monthly_attendance ?? []}
          dataKey="attendance"
          color="#10B981"
        />
      </div>

      {/* Classes and Fees */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DonutCard
          title="Students by Class"
          Icon={BookOpen}
          iconClass="text-blue-600"
          data={studentsByClass}
          size="sm"
        />

        <DonutCard
          title="Fee Collection Overview"
          Icon={Wallet}
          iconClass="text-emerald-600"
          data={feesData}
          size="sm"
        />
      </div>

      {/* Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BarCard
          title="Assignments Overview"
          Icon={ClipboardList}
          iconClass="text-amber-600"
          data={ASSIGNMENTS_DATA}
          color="#034A52"
        />

        <BarCard
          title="Average Marks by Subject"
          Icon={GraduationCap}
          iconClass="text-purple-600"
          data={EXAMS_DATA}
          dataKey="marks"
          color="#10B981"
        />
      </div>
    </div>
  );
};

export default memo(DashboardCharts);
