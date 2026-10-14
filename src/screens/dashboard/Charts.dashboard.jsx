
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
  STUDENTS_BY_STATUS,
  ATTENDANCE_DATA,
  MONTHLY_STUDENTS,
  MONTHLY_ATTENDANCE,
  STUDENTS_BY_CLASS,
  SUBJECTS_DATA,
  FEES_DATA,
  ASSIGNMENTS_DATA,
  EXAMS_DATA,
} from "../../components/Dashboard.Charts/chartData";

const DashboardCharts = () => {
  return (
    <div className="space-y-4">
      {/* Student Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DonutCard
          title="Students by Status"
          Icon={Users}
          iconClass="text-blue-600"
          data={STUDENTS_BY_STATUS}
        />

        <DonutCard
          title="Attendance Overview"
          Icon={CalendarCheck}
          iconClass="text-emerald-600"
          data={ATTENDANCE_DATA}
        />
      </div>

      {/* Monthly Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TrendCard
          title="Monthly Student Enrollment"
          Icon={Users}
          iconClass="text-blue-600"
          data={MONTHLY_STUDENTS}
          dataKey="students"
          color="#034A52"
        />

        <TrendCard
          title="Monthly Attendance Trend (%)"
          Icon={CalendarCheck}
          iconClass="text-emerald-600"
          data={MONTHLY_ATTENDANCE}
          dataKey="attendance"
          color="#10B981"
        />
      </div>

      {/* Classes and Subjects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DonutCard
          title="Students by Class"
          Icon={BookOpen}
          iconClass="text-blue-600"
          data={STUDENTS_BY_CLASS}
          size="sm"
        />

        {/* <DonutCard
          title="Subjects Overview"
          Icon={BookOpen}
          iconClass="text-purple-600"
          data={SUBJECTS_DATA}
          size="sm"
        /> */}

        <DonutCard
          title="Fee Collection Overview"
          Icon={Wallet}
          iconClass="text-emerald-600"
          data={FEES_DATA}
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
