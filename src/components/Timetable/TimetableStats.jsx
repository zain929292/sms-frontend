import { CalendarDays, CheckCircle2, Clock } from "lucide-react";

const TimetableStats = ({ totalCount = 0, activeCount = 0, daysCount = 0 }) => {
  const stats = [
    { label: "Total Periods", value: totalCount, icon: CalendarDays },
    { label: "Active Periods", value: activeCount, icon: CheckCircle2 },
    { label: "Scheduled Days", value: daysCount, icon: Clock },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {stats.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
        >
          <div className="rounded-lg bg-teal-50 p-2 text-teal-700">
            <Icon size={18} />
          </div>
          <div>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-lg font-bold text-slate-800">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimetableStats;