
import { useState } from "react";
import {
  Pencil,
  Trash2,
  Plus,
  Clock,
  CalendarDays,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";

const formatTime = (time) =>
  time ? String(time).slice(0, 5) : "—";

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function ExamDatesTable({
  examId,
  examDates = [],
  loading = false,
  onAdd,
  onEdit,
  onDelete,
}) {
  const [showDates, setShowDates] = useState(false);

  // Only show dates belonging to the selected exam
  const filteredDates = examDates.filter(
    (item) => String(item.exam_id) === String(examId)
  );

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

      {/* Compact Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
            <CalendarDays size={16} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              Exam Dates
            </h3>

            <p className="text-[11px] text-slate-500">
              Manage examination dates and timings
            </p>
          </div>

          <span className="rounded-md bg-teal-50 px-2 py-1 text-[11px] font-semibold text-teal-700">
            {filteredDates.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowDates((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
        >
          {showDates ? (
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
              showDates ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Collapsible Exam Dates */}
      {showDates && (
        <div className="border-t border-slate-100 bg-slate-50/40 p-4">
          {loading ? (
            <div className="flex min-h-[80px] items-center justify-center text-xs text-teal-700">
              Loading exam dates...
            </div>
          ) : (
            <>
              {filteredDates.length > 0 && (
                <div className="overflow-x-auto pb-2">
                  <div className="flex min-w-max items-stretch gap-2">

                    {filteredDates.map((examDate) => (
                      <div
                        key={examDate.id}
                        className="w-[175px] shrink-0 rounded-lg border border-slate-200 bg-white p-3 transition hover:border-teal-300"
                      >
                        {/* Date */}
                        <div className="mb-3 flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                            <CalendarDays size={15} />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-slate-800">
                              {formatDate(examDate.exam_date)}
                            </p>

                            <p className="text-[10px] text-slate-400">
                              Exam Date
                            </p>
                          </div>
                        </div>

                        {/* Exam Name */}
                        {examDate.exam?.name && (
                          <p className="mb-3 truncate rounded-md bg-slate-50 px-2 py-1.5 text-[11px] font-medium text-slate-600">
                            {examDate.exam.name}
                          </p>
                        )}

                        {/* Timings */}
                        <div className="mb-3 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="flex items-center gap-1 text-slate-400">
                              <Clock size={11} />
                              Start
                            </span>

                            <span className="font-medium text-slate-700">
                              {formatTime(examDate.start_time)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px]">
                            <span className="flex items-center gap-1 text-slate-400">
                              <Clock size={11} />
                              End
                            </span>

                            <span className="font-medium text-slate-700">
                              {formatTime(examDate.end_time)}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-1 border-t border-slate-100 pt-2">
                          <button
                            type="button"
                            onClick={() => onEdit?.(examDate)}
                            title="Edit Exam Date"
                            className="rounded-md p-1.5 text-teal-700 transition hover:bg-teal-100"
                          >
                            <Pencil size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDelete?.(examDate)}
                            title="Delete Exam Date"
                            className="rounded-md p-1.5 text-red-500 transition hover:bg-red-50"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add Exam Date */}
                    <button
                      type="button"
                      onClick={onAdd}
                      className="flex w-[175px] shrink-0 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-teal-300 bg-teal-50/40 p-3 text-teal-700 transition hover:border-teal-500 hover:bg-teal-50"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100">
                        <Plus size={17} />
                      </div>

                      <span className="text-xs font-semibold">
                        Add Exam Date
                      </span>

                      <span className="text-[10px] text-slate-400">
                        Define date and timing
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {filteredDates.length === 0 && (
                <div className="py-4 text-center">
                  <p className="text-xs text-slate-400">
                    No exam dates found for this examination.
                  </p>

                  <button
                    type="button"
                    onClick={onAdd}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-teal-800"
                  >
                    <Plus size={14} />
                    Add Exam Date
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
