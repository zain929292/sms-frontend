
import {
  ClipboardList,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileEdit,
  PlayCircle,
} from "lucide-react";

const ExamStats = ({ stats = {}, onStatusChange }) => {
  const {
    total_exams = 0,
    upcoming_exams = 0,
    ongoing_exams = 0,
    completed_exams = 0,
    draft = 0,
    active = 0,
    completed = 0,
  } = stats;

  const summary = [
    {
      title: "Total Examinations",
      value: total_exams,
      subtitle: "All examination records",
      icon: ClipboardList,
      color: "text-teal-700",
      bg: "bg-teal-50",
    },
    {
      title: "Upcoming Exams",
      value: upcoming_exams,
      subtitle: "Scheduled examinations",
      icon: CalendarDays,
      color: "text-blue-700",
      bg: "bg-blue-50",
    },
    {
      title: "Completed Exams",
      value: completed_exams,
      subtitle: "Successfully completed",
      icon: CheckCircle2,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="space-y-3">
      {/* Examination Summary */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
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

export default ExamStats;
