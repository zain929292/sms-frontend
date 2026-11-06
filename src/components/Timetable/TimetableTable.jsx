
import { useState } from "react";
import {
  Pencil,
  Trash2,
  RefreshCw,
  Clock,
  UserRound,
  Plus,
  CalendarDays,
  CalendarX,
} from "lucide-react";

const DAYS = ["regular", "friday"];

const formatTime = (time) =>
  time ? String(time).slice(0, 5) : "—";

const isBreak = (period) =>
  period?.name?.trim().toLowerCase() === "break";

const TimetableTable = ({
  timetables = [],
  periods = [],
  classes = [],
  loading = false,
  onRefresh,
  onEdit,
  onDelete,
  onAdd,
  selectedDay,
  onDayChange,
}) => {
  const [localDay, setLocalDay] = useState("regular");

  const activeDay = selectedDay ?? localDay;

  // Handle schedule selection
  const handleDayChange = (day) => {
    if (onDayChange) {
      onDayChange(day);
    } else {
      setLocalDay(day);
    }
  };

  // Active periods sorted by configured order
  const timeSlots = [...periods]
    .filter((period) => period.status === "active")
    .sort(
      (a, b) =>
        Number(a.sort_order) - Number(b.sort_order)
    );

  // Active classes
  const classRows = classes.length
    ? classes.filter((item) => item.status === "active")
    : [
        ...new Map(
          timetables.map((item) => [
            item.class_id,
            {
              id: item.class_id,
              name:
                item.class?.name ??
                item.classes?.name ??
                item.class_name ??
                `Class ${item.class_id}`,
            },
          ])
        ).values(),
      ];

  // Find timetable entry by class, schedule and period
  const getTimetableEntry = (classId, slot) =>
    timetables.find(
      (item) =>
        String(item.class_id) === String(classId) &&
        item.day?.toLowerCase() === activeDay &&
        String(item.period_id) === String(slot.id)
    );

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">
            Class Timetable
          </h3>

          <p className="text-xs text-slate-500">
            View subject and teacher schedules by class.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-teal-50 hover:text-teal-700 disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Schedule Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3">

        {DAYS.map((day) => {
          const isActive = activeDay === day;

          return (
            <button
              key={day}
              type="button"
              onClick={() => handleDayChange(day)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                isActive
                  ? "bg-teal-700 text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-teal-50 hover:text-teal-700"
              }`}
            >
              {day === "regular"
                ? "Regular (Mon–Sat)"
                : "Friday"}
            </button>
          );
        })}

        <div className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] font-medium text-slate-500">
          <CalendarX size={13} />
          Sunday: Off Day
        </div>
      </div>

      {/* Selected Schedule Information */}
      <div className="flex items-center gap-2 border-b border-slate-100 bg-teal-50/40 px-4 py-2">
        <CalendarDays size={14} className="text-teal-700" />

        <p className="text-xs text-slate-600">
          Showing{" "}
          <span className="font-semibold text-teal-700">
            {activeDay === "regular"
              ? "Regular Schedule (Monday – Saturday)"
              : "Friday Schedule"}
          </span>
        </p>
      </div>

      {/* Timetable Grid */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-max border-collapse text-left">

          {/* Table Header */}
          <thead>
            <tr className="bg-slate-50">

              <th className="sticky left-0 z-10 min-w-28 border-b border-r border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700">
                Class
              </th>

              {timeSlots.map((slot) => (
                <th
                  key={slot.id}
                  className={`min-w-44 border-b border-r border-slate-200 px-3 py-3 text-center ${
                    isBreak(slot) ? "bg-amber-50" : ""
                  }`}
                >
                  <div
                    className={`text-xs font-semibold ${
                      isBreak(slot)
                        ? "text-amber-700"
                        : "text-slate-700"
                    }`}
                  >
                    {slot.name}
                  </div>

                  <div className="mt-1 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500">
                    <Clock size={13} className="text-teal-600" />

                    {formatTime(slot.start_time)} -{" "}
                    {formatTime(slot.end_time)}
                  </div>
                </th>
              ))}

            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {classRows.map((classItem) => (
              <tr key={classItem.id}>

                {/* Class Name */}
                <td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-white px-4 py-3">
                  <span className="text-xs font-semibold text-slate-800">
                    {classItem.name}
                  </span>
                </td>

                {/* Period Columns */}
                {timeSlots.map((slot) => {
                  const breakPeriod = isBreak(slot);

                  const entry = breakPeriod
                    ? null
                    : getTimetableEntry(
                        classItem.id,
                        slot
                      );

                  return (
                    <td
                      key={`${classItem.id}-${slot.id}`}
                      className={`border-b border-r border-slate-100 p-2 align-top ${
                        breakPeriod ? "bg-amber-50/50" : ""
                      }`}
                    >

                      {/* Break Period */}
                      {breakPeriod ? (
                        <div className="flex min-h-24 flex-col items-center justify-center rounded-lg border border-amber-100 bg-amber-50 px-2 text-center">
                          <span className="text-xs font-semibold text-amber-700">
                            Break
                          </span>

                          <span className="mt-1 text-[10px] text-amber-600">
                            No class
                          </span>
                        </div>
                      ) : entry ? (

                        /* Existing Timetable Entry */
                        <div className="min-h-24 rounded-lg border border-teal-100 bg-teal-50/70 p-3">

                          <p className="text-xs font-semibold text-slate-800">
                            {entry.subject?.name ??
                              entry.subject_name ??
                              "—"}
                          </p>

                          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-600">
                            <UserRound
                              size={12}
                              className="text-teal-600"
                            />

                            {entry.teacher?.name ??
                              entry.teachers?.name ??
                              entry.teacher_name ??
                              "—"}
                          </div>

                          {entry.room_number && (
                            <p className="mt-1 text-[10px] text-slate-500">
                              Room: {entry.room_number}
                            </p>
                          )}

                          {/* Actions */}
                          <div className="mt-2 flex justify-end gap-1 border-t border-teal-100 pt-2">

                            <button
                              type="button"
                              onClick={() => onEdit?.(entry)}
                              title="Edit Timetable"
                              className="rounded p-1 text-teal-700 transition hover:bg-teal-100"
                            >
                              <Pencil size={13} />
                            </button>

                            <button
                              type="button"
                              onClick={() => onDelete?.(entry)}
                              title="Delete Timetable"
                              className="rounded p-1 text-red-500 transition hover:bg-red-50"
                            >
                              <Trash2 size={13} />
                            </button>

                          </div>
                        </div>

                      ) : (

                        /* Add Timetable Entry */
                        <button
                          type="button"
                          onClick={() =>
                            onAdd?.({
                              class_id: classItem.id,
                              period_id: slot.id,
                              day: activeDay,
                            })
                          }
                          className="flex min-h-24 w-full items-center justify-center gap-1 rounded-lg border border-dashed border-slate-200 text-xs text-slate-400 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                        >
                          <Plus size={14} />
                          Add
                        </button>

                      )}

                    </td>
                  );
                })}

              </tr>
            ))}
          </tbody>

        </table>

        {/* Empty State */}
        {!loading &&
          (!classRows.length || !timeSlots.length) && (
            <div className="px-4 py-10 text-center text-xs text-slate-500">
              {!timeSlots.length
                ? "No active periods available. Please add periods first."
                : "No classes available."}
            </div>
          )}

        {/* Loading */}
        {loading && (
          <div className="px-4 py-5 text-center text-xs text-teal-700">
            Loading timetable...
          </div>
        )}

      </div>
    </div>
  );
};

export default TimetableTable;
