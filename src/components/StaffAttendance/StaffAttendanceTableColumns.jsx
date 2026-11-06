const StaffAttendanceTableColumns = () => [
  {
    key: "user_name",
    label: "STAFF NAME",
    render: (row) => (
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-700">
          {row.user_name?.[0]?.toUpperCase() || "S"}
        </div>

        <span className="text-xs font-bold text-slate-900">
          {row.user_name || "-"}
        </span>
      </div>
    ),
  },
  {
    key: "attendance_date",
    label: "ATTENDANCE DATE",
    width: "145px",
    render: (row) => {
      const date = row.attendance_date
        ? new Date(`${row.attendance_date}T00:00:00`)
        : null;

      return (
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-800">
            {date
              ? date.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "-"}
          </span>
          {date && (
            <span className="text-[10px] text-slate-400">
              {date.toLocaleDateString("en-US", {
                weekday: "long",
              })}
            </span>
          )}
        </div>
      );
    },
  },

  {
    key: "check_in",
    label: "CHECK IN",
    render: (row) => (
      <span className="text-xs text-slate-700">
        {row.check_in?.substring(0, 5) || "-"}
      </span>
    ),
  },
  {
    key: "check_out",
    label: "CHECK OUT",
    render: (row) => (
      <span className="text-xs text-slate-700">
        {row.check_out?.substring(0, 5) || "-"}
      </span>
    ),
  },
  {
    key: "status",
    label: "STATUS",
    render: (row) => {
      const status = row.status?.toLowerCase() || "absent";

      const statusClasses = {
        present: "bg-green-100 text-green-700",
        late: "bg-amber-100 text-amber-700",
        absent: "bg-red-100 text-red-700",
        leave: "bg-blue-100 text-blue-700",
      };

      return (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            statusClasses[status] || "bg-slate-100 text-slate-600"
          }`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    },
  },
  {
    key: "remarks",
    label: "REMARKS",
    render: (row) => (
      <span
        className="block max-w-[180px] truncate text-xs text-slate-700"
        title={row.remarks || ""}
      >
        {row.remarks || "-"}
      </span>
    ),
  },
];

export default StaffAttendanceTableColumns;