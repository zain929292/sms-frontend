
import { CalendarDays } from "lucide-react";

export default function StudentAttendanceDateTabs({
  selectedMonth,
  attendanceDate,
  onDateChange,
}) {
  if (!selectedMonth) return null;

  const [year, month] = selectedMonth.split("-").map(Number);

  const totalDays = new Date(year, month, 0).getDate();

  const today = new Date();

  const isCurrentMonth =
    year === today.getFullYear() &&
    month === today.getMonth() + 1;

  const lastDay = isCurrentMonth ? today.getDate() : totalDays;

  const dates = Array.from({ length: lastDay }, (_, index) => {
    const day = index + 1;
    const date = new Date(year, month - 1, day);

    return {
      value: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      day,
      label: date.toLocaleDateString("en-US", {
        weekday: "short",
      }),
      isSunday: date.getDay() === 0,
    };
  });

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-3 flex items-center gap-2">
        <CalendarDays size={16} className="text-teal-700" />

        <span className="text-sm font-semibold text-slate-700">
          {new Date(year, month - 1, 1).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {/* All Dates Tab */}
        <button
          type="button"
          onClick={() => onDateChange("all")}
          className={`min-w-[75px] rounded-lg border px-3 py-2 text-center transition ${
            attendanceDate === "all"
              ? "border-teal-600 bg-teal-600 text-white"
              : "border-slate-200 bg-white text-slate-600 hover:border-teal-400"
          }`}
        >
          <span className="block text-xs">All</span>
          <span className="block text-sm font-semibold">Dates</span>
        </button>

        {/* Individual Date Tabs */}
        {dates.map((date) => {
          const isActive = attendanceDate === date.value;

          return (
            <button
              key={date.value}
              type="button"
              onClick={() => onDateChange(date.value)}
              className={`min-w-[58px] rounded-lg border px-3 py-2 text-center transition ${
                isActive
                  ? "border-teal-600 bg-teal-600 text-white"
                  : date.isSunday
                  ? "border-red-200 bg-red-50 text-red-600 hover:border-red-400"
                  : "border-slate-200 bg-white text-slate-600 hover:border-teal-400"
              }`}
            >
              <span className="block text-xs">{date.label}</span>
              <span className="block text-sm font-semibold">
                {date.day}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
