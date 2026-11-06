const StudentAttendanceSearchItem = ({ student }) => {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-700">
          {student.label?.[0]?.toUpperCase() || "S"}
        </div>

        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-slate-800">
            {student.label || "N/A"}
          </p>

          <p className="text-[11px] text-slate-500">
            {student.admission_number || "Student"}
          </p>
        </div>
      </div>

      <span className="text-xs text-slate-400">
        ID: {student.value}
      </span>
    </div>
  );
};

export default StudentAttendanceSearchItem;