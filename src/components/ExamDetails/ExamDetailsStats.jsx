
import {
  ClipboardList,
  CalendarDays,
  BookOpen,
  GraduationCap,
} from "lucide-react";

const ExamDetailsStats = ({ stats = {} }) => {
  const {
    total_schedules = 0,
    upcoming_schedules = 0,
    completed_schedules = 0,
    total_subjects = 0,
  } = stats;

  const summary = [
    {
      title: "Total Schedules",
      value: total_schedules,
      subtitle: "All examination schedules",
      icon: ClipboardList,
      color: "text-teal-700",
      bg: "bg-teal-50",
    },
    {
      title: "Upcoming Schedules",
      value: upcoming_schedules,
      subtitle: "Scheduled examinations",
      icon: CalendarDays,
      color: "text-blue-700",
      bg: "bg-blue-50",
    },
    {
      title: "Completed Schedules",
      value: completed_schedules,
      subtitle: "Examinations completed",
      icon: GraduationCap,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
    },
    {
      title: "Total Subjects",
      value: total_subjects,
      subtitle: "Subjects in examination schedules",
      icon: BookOpen,
      color: "text-purple-700",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">
                  {item.title}
                </span>

                <span className={`rounded-md p-1.5 ${item.bg}`}>
                  <Icon size={15} className={item.color} />
                </span>
              </div>

              <p className="mt-2 text-lg font-bold text-gray-800">
                {Number(item.value).toLocaleString("en-PK")}
              </p>

              <p className="mt-0.5 text-[11px] text-gray-500">
                {item.subtitle}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExamDetailsStats;
