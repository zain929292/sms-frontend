const LeaveRequestTableColumns = () => [
  {
    key: "user_name",
    label: "APPLICANT",
    render: (row) => (
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-700">
          {row.user_name?.[0]?.toUpperCase() || "U"}
        </div>

        <span className="text-xs font-bold text-slate-900">
          {row.user_name || "-"}
        </span>
      </div>
    ),
  },
  {
    key: "leave_type",
    label: "LEAVE TYPE",
    render: (row) => {
      const leaveType = row.leave_type || "-";

      return (
        <span className="rounded-md bg-teal-50 px-2.5 py-1 text-xs font-semibold capitalize text-teal-700">
          {leaveType.replaceAll("_", " ")}
        </span>
      );
    },
  },
  {
    key: "start_date",
    label: "START DATE",
    width: "125px",
    render: (row) => {
      const date = row.start_date
        ? new Date(`${row.start_date}T00:00:00`)
        : null;

      return (
        <span className="text-xs font-semibold text-slate-800">
          {date
            ? date.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "-"}
        </span>
      );
    },
  },
  {
    key: "end_date",
    label: "END DATE",
    width: "125px",
    render: (row) => {
      const date = row.end_date
        ? new Date(`${row.end_date}T00:00:00`)
        : null;

      return (
        <span className="text-xs font-semibold text-slate-800">
          {date
            ? date.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "-"}
        </span>
      );
    },
  },
  {
    key: "total_days",
    label: "DURATION",
    render: (row) => (
      <span className="text-xs font-semibold text-slate-700">
        {row.total_days ?? 0}{" "}
        {Number(row.total_days) === 1 ? "Day" : "Days"}
      </span>
    ),
  },
  {
    key: "status",
    label: "STATUS",
    render: (row) => {
      const status = row.status?.toLowerCase() || "pending";

      const statusClasses = {
        pending: "bg-amber-100 text-amber-700",
        approved: "bg-green-100 text-green-700",
        rejected: "bg-red-100 text-red-700",
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
    key: "reason",
    label: "REASON",
    render: (row) => (
      <span
        className="block max-w-[180px] truncate text-xs text-slate-700"
        title={row.reason || ""}
      >
        {row.reason || "-"}
      </span>
    ),
  },
];

export default LeaveRequestTableColumns;