import { CalendarDays } from "lucide-react";

export default function StaffAttendanceMonthFilter({
  selectedMonth,
  onMonthChange,
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
      <CalendarDays size={16} className="text-teal-700" />

      <input
        type="month"
        value={selectedMonth}
        onChange={(e) => onMonthChange(e.target.value)}
        className="w-full bg-transparent text-sm text-slate-700 outline-none"
      />
    </div>
  );
}