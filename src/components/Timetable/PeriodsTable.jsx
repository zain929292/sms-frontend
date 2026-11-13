
import { useState } from "react";
import {
  Pencil,
  Trash2,
  Plus,
  Clock,
  CalendarClock,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";

const formatTime = (time) =>
  time ? String(time).slice(0, 5) : "—";

export default function PeriodsTable({
  periods = [],
  loading = false,
  onAdd,
  onEdit,
  onDelete,
}) {
  const [showPeriods, setShowPeriods] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

      {/* Compact Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3">

        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
            <CalendarClock size={16} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              Periods
            </h3>
            <p className="text-[11px] text-slate-500">
              Manage timetable periods
            </p>
          </div>

          <span className="rounded-md bg-teal-50 px-2 py-1 text-[11px] font-semibold text-teal-700">
            {periods.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowPeriods((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
        >
          {showPeriods ? (
            <>
              <EyeOff size={14} />
              Hide
            </>
          ) : (
            <>
              <Eye size={14} />
              Show
            </>
          )}

          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${
              showPeriods ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Collapsible Periods */}
      {showPeriods && (
        <div className="border-t border-slate-100 bg-slate-50/40 p-4">

          {loading ? (
            <div className="flex min-h-[80px] items-center justify-center text-xs text-teal-700">
              Loading periods...
            </div>
          ) : (
            <div className="overflow-x-auto pb-2">
              <div className="flex min-w-max items-stretch gap-2">

                {periods.map((period, index) => {
                  const breakPeriod =
                    period.name?.trim().toLowerCase() === "break";

                  return (
                    <div
                      key={period.id}
                      className={`w-[155px] shrink-0 rounded-lg border p-3 transition ${
                        breakPeriod
                          ? "border-amber-200 bg-amber-50/50"
                          : "border-slate-200 bg-white hover:border-teal-300"
                      }`}
                    >
                      {/* Period Name */}
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <div
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                              breakPeriod
                                ? "bg-amber-100 text-amber-700"
                                : "bg-teal-50 text-teal-700"
                            }`}
                          >
                            <Clock size={14} />
                          </div>

                          <span className="truncate text-xs font-semibold text-slate-800">
                            {period.name}
                          </span>
                        </div>

                        <span className="text-[10px] text-slate-400">
                          #{period.sort_order ?? index + 1}
                        </span>
                      </div>

                      {/* Timings */}
                      <div className="mb-3 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Start</span>
                          <span className="font-medium text-slate-700">
                            {formatTime(period.start_time)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">End</span>
                          <span className="font-medium text-slate-700">
                            {formatTime(period.end_time)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            period.status === "active"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {period.status === "active"
                            ? "Active"
                            : "Inactive"}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onEdit?.(period)}
                            title="Edit Period"
                            className="rounded-md p-1.5 text-teal-700 transition hover:bg-teal-100"
                          >
                            <Pencil size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDelete?.(period)}
                            title="Delete Period"
                            className="rounded-md p-1.5 text-red-500 transition hover:bg-red-50"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Add Period */}
                <button
                  type="button"
                  onClick={onAdd}
                  className="flex w-[155px] shrink-0 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-teal-300 bg-teal-50/40 p-3 text-teal-700 transition hover:border-teal-500 hover:bg-teal-50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100">
                    <Plus size={17} />
                  </div>

                  <span className="text-xs font-semibold">
                    Add Period
                  </span>

                  <span className="text-[10px] text-slate-400">
                    Create new period
                  </span>
                </button>

              </div>
            </div>
          )}

          {!loading && periods.length === 0 && (
            <p className="py-4 text-center text-xs text-slate-400">
              No periods found. Add your first period.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
