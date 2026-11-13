
export default function StudentAttendanceTableSection({ s }) {
  const today = new Date().toISOString().slice(0, 10);

  const getStatusStyle = (status) => {
    const styles = {
      present: "bg-emerald-50 text-emerald-700 border-emerald-200",
      absent: "bg-red-100 text-red-700 border-red-200",
      leave: "bg-amber-50 text-amber-700 border-amber-200",
      late: "bg-orange-50 text-orange-700 border-orange-200",
    };

    return styles[status] || "bg-white text-slate-300 border-slate-200";
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Table Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">
            Student Attendance Register
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Mark and manage daily student attendance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Present
          </span>

          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Absent
          </span>

          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Leave
          </span>

          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            Late
          </span>

          <span className="flex items-center gap-1.5 text-red-600">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Sunday
          </span>
        </div>
      </div>

      {/* Loading */}
      {s.loading ? (
        <div className="flex flex-col items-center justify-center gap-2 py-14">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
          <p className="text-xs text-slate-500">
            Loading attendance register...
          </p>
        </div>
      ) : !s.students?.length ? (
        <div className="flex flex-col items-center justify-center py-14">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <span className="text-xl">👨‍🎓</span>
          </div>

          <p className="text-sm font-semibold text-slate-700">
            No students found
          </p>

          <p className="mt-1 text-xs text-slate-400">
            No active enrolled students are available in this class.
          </p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="max-h-[650px] overflow-auto">
            <table className="w-full min-w-max border-collapse text-xs">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50">
                  {/* Student Header */}
                  <th className="sticky left-0 z-[20] min-w-[230px] border-b border-r border-slate-200 bg-slate-50 px-4 py-3 text-left">
                    <span className="font-semibold uppercase tracking-wide text-slate-600">
                      Student
                    </span>
                  </th>

                  {s.dates.map((date) => {
                    const isSunday =
                      new Date(`${date.date}T00:00:00`).getDay() === 0;

                    const isToday = date.date === today;

                    return (
                      <th
                        key={date.date}
                        className={`min-w-[65px] border-b border-r px-2 py-2 text-center ${
                          isSunday
                            ? "border-red-200 bg-red-100"
                            : isToday
                            ? "border-slate-200 bg-teal-50"
                            : "border-slate-200"
                        }`}
                      >
                        <div
                          className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                            isSunday
                              ? "bg-red-500 text-white"
                              : isToday
                              ? "bg-teal-600 text-white"
                              : "text-slate-700"
                          }`}
                        >
                          {date.day}
                        </div>

                        <div
                          className={`mt-1 text-[10px] font-medium ${
                            isSunday
                              ? "font-semibold text-red-600"
                              : isToday
                              ? "text-teal-700"
                              : "text-slate-400"
                          }`}
                        >
                          {date.weekday}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {s.students.map((student) => (
                  <tr
                    key={student.enrollment_id}
                    className="group transition-colors hover:bg-teal-50/40"
                  >
                    {/* Student Column */}
                    <td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-white px-4 py-2.5 group-hover:bg-teal-50">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-700">
                          {student.name?.charAt(0)?.toUpperCase() || "S"}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-slate-700">
                            {student.name}
                          </p>

                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {student.admission_number || "No admission number"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Attendance Cells */}
                    {s.dates.map((date) => {
                      const cellKey = `${student.id}_${date.date}`;
                      const record = s.attendanceMap.get(cellKey);
                      const status = record?.status || "";

                      const isSaving = s.savingCell === cellKey;

                      const isSunday =
                        new Date(`${date.date}T00:00:00`).getDay() === 0;

                      const isToday = date.date === today;
                      const isDisabled = isSunday || isSaving;

                      return (
                        <td
                          key={date.date}
                          className={`border-b border-r px-2 py-2 text-center ${
                            isSunday
                              ? "border-red-100 bg-red-50"
                              : isToday
                              ? "border-slate-100 bg-teal-50/30"
                              : "border-slate-100"
                          }`}
                        >
                          <div className="flex min-h-[38px] flex-col items-center justify-center gap-1">
                            {/* Sunday */}
                            {isSunday ? (
                              <span className="inline-flex h-7 min-w-[42px] items-center justify-center rounded-md border border-red-200 bg-red-100 px-2 text-[10px] font-semibold text-red-500">
                                Off
                              </span>
                            ) : status === "late" ? (
                              /* Late */
                              <span
                                title="Late"
                                className={`inline-flex min-w-[42px] items-center justify-center rounded-md border px-2 py-1 text-[10px] font-semibold ${getStatusStyle(
                                  status
                                )}`}
                              >
                                Late
                              </span>
                            ) : (
                              /* Attendance Checkbox */
                              <label
                                title={
                                  status === "present"
                                    ? "Click to mark absent"
                                    : "Click to mark present"
                                }
                                className={`relative flex h-7 w-9 items-center justify-center rounded-md border transition ${
                                  status
                                    ? getStatusStyle(status)
                                    : "border-slate-200 bg-white text-slate-300"
                                } ${
                                  isDisabled
                                    ? "cursor-wait opacity-50"
                                    : "cursor-pointer hover:border-teal-400"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={status === "present"}
                                  disabled={isDisabled}
                                  onChange={(e) =>
                                    s.handleStatusChange(
                                      student.id,
                                      date.date,
                                      e.target.checked
                                        ? "present"
                                        : "absent"
                                    )
                                  }
                                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                />

                                <span className="text-[10px] font-bold">
                                  {status === "present"
                                    ? "P"
                                    : status === "absent"
                                    ? "A"
                                    : status === "leave"
                                    ? "L"
                                    : "—"}
                                </span>
                              </label>
                            )}

                            {/* Leave Selection */}
                            {!isSunday && status !== "late" && (
                              <select
                                aria-label={`Attendance status for ${student.name} on ${date.date}`}
                                value={status === "leave" ? "leave" : ""}
                                disabled={isDisabled}
                                onChange={(e) =>
                                  s.handleStatusChange(
                                    student.id,
                                    date.date,
                                    e.target.value === "leave"
                                      ? "leave"
                                      : "absent"
                                  )
                                }
                                className={`w-10 cursor-pointer rounded border bg-white px-0.5 py-0.5 text-[9px] outline-none focus:border-teal-500 ${
                                  status === "leave"
                                    ? "border-amber-300 text-amber-700"
                                    : "border-slate-200 text-slate-400"
                                }`}
                              >
                                <option value="">—</option>
                                <option value="leave">Leave</option>
                              </select>
                            )}

                            {isSaving && (
                              <span className="text-[9px] text-teal-600">
                                Saving
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-4 py-2.5">
            <p className="text-[11px] text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {s.students.length}
              </span>{" "}
              students
            </p>

            <p className="text-[10px] text-slate-400">
              Changes are saved automatically
            </p>
          </div>
        </>
      )}
    </div>
  );
}
