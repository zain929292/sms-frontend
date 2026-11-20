
import {
  Plus,
  Pencil,
  Trash2,
  CalendarDays,
  Clock,
  BookOpen,
} from "lucide-react";

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (time) =>
  time ? String(time).slice(0, 5) : "—";

export default function ExamDetailsTable({
  schedules = [],
  examDates = [],
  classes = [],
  loading = false,
  onEdit,
  onDelete,
  onAdd,
}) {
  const handleAdd = (classItem, examDate) => {
    onAdd?.({
      class_id: Number(classItem.id),
      exam_id: Number(examDate.exam_id),
      exam_date_id: Number(examDate.id),
    });
  };

  const getSchedule = (classItem, examDate) => {
    return schedules.find(
      (schedule) =>
        Number(schedule.class_id) === Number(classItem.id) &&
        Number(schedule.exam_date_id) === Number(examDate.id)
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-slate-200 bg-white text-xs text-teal-700">
        Loading exam schedules...
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
            <CalendarDays size={16} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              Datesheet
            </h3>

            <p className="text-[11px] text-slate-500">
              Assign subjects to classes and exam dates
            </p>
          </div>
        </div>

        <span className="rounded-md bg-teal-50 px-2 py-1 text-[11px] font-semibold text-teal-700">
          {schedules.length} Schedules
        </span>
      </div>

      {/* Table */}
      {classes.length === 0 || examDates.length === 0 ? (
        <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 p-5 text-center">
          <CalendarDays size={28} className="text-slate-300" />

          <p className="text-sm font-semibold text-slate-600">
            {classes.length === 0
              ? "No classes available"
              : "No exam dates defined"}
          </p>

          <p className="text-xs text-slate-400">
            {classes.length === 0
              ? "Please add classes first."
              : "Create exam dates above before assigning subjects."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-max border-collapse text-left">

            <thead>
              <tr className="bg-slate-50">

                <th className="sticky left-0 z-20 min-w-[155px] border-b border-r border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="text-xs font-semibold text-slate-600">
                    Classes
                  </span>
                </th>

                {examDates.map((date) => (
                  <th
                    key={date.id}
                    className="min-w-[210px] border-b border-r border-slate-200 px-3 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                        <CalendarDays size={14} />
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-slate-800">
                          {formatDate(date.exam_date)}
                        </p>

                        <p className="mt-1 flex items-center gap-1 text-[10px] font-normal text-slate-400">
                          <Clock size={10} />
                          {formatTime(date.start_time)} -{" "}
                          {formatTime(date.end_time)}
                        </p>
                      </div>
                    </div>
                  </th>
                ))}

              </tr>
            </thead>

            <tbody>
              {classes.map((classItem) => (
                <tr
                  key={classItem.id}
                  className="group transition hover:bg-slate-50/60"
                >

                  {/* Class Name */}
                  <td className="sticky left-0 z-10 border-b border-r border-slate-100 bg-white px-4 py-3 transition group-hover:bg-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600">
                        {classItem.name?.match(/\d+/)?.[0] || "CL"}
                      </div>

                      <span className="text-xs font-semibold text-slate-700">
                        {classItem.name}
                      </span>
                    </div>
                  </td>

                  {/* Exam Date Cells */}
                  {examDates.map((date) => {
                    const schedule = getSchedule(classItem, date);

                    return (
                      <td
                        key={`${classItem.id}-${date.id}`}
                        className="border-b border-r border-slate-100 p-2"
                      >
                        {schedule ? (
                          <div className="min-h-[105px] rounded-lg border border-teal-200 bg-teal-50/40 p-3 transition hover:border-teal-400">

                            <div className="mb-2 flex items-start gap-2">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-teal-700 shadow-sm">
                                <BookOpen size={14} />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold text-slate-800">
                                  {schedule.subject?.name ||
                                    schedule.subject_name ||
                                    "Subject"}
                                </p>

                                <p className="mt-1 text-[10px] text-slate-500">
                                  Total: {schedule.total_marks ?? "—"} Marks
                                </p>

                                <p className="text-[10px] text-slate-500">
                                  Passing: {schedule.passing_marks ?? "—"} Marks
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-1 border-t border-teal-100 pt-2">
                              <button
                                type="button"
                                onClick={() => onEdit?.(schedule)}
                                title="Edit Schedule"
                                className="rounded-md p-1.5 text-teal-700 transition hover:bg-teal-100"
                              >
                                <Pencil size={13} />
                              </button>

                              <button
                                type="button"
                                onClick={() => onDelete?.(schedule)}
                                title="Delete Schedule"
                                className="rounded-md p-1.5 text-red-500 transition hover:bg-red-50"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>

                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAdd(classItem, date)}
                            className="flex min-h-[105px] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 text-slate-400 transition hover:border-teal-300 hover:bg-teal-50/50 hover:text-teal-700"
                          >
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm">
                              <Plus size={15} />
                            </div>

                            <span className="text-[11px] font-medium">
                              Add Subject
                            </span>
                          </button>
                        )}
                      </td>
                    );
                  })}

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
