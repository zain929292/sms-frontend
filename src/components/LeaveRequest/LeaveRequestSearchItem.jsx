const LeaveRequestSearchItem = ({ leaveRequest }) => {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-700">
          {leaveRequest.label?.[0]?.toUpperCase() || "L"}
        </div>

        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-slate-800">
            {leaveRequest.label || "N/A"}
          </p>

          <p className="text-[11px] text-slate-500">
            {leaveRequest.leave_type || "Leave Request"}
          </p>
        </div>
      </div>

      <span className="shrink-0 text-xs text-slate-400">
        ID: {leaveRequest.value}
      </span>
    </div>
  );
};

export default LeaveRequestSearchItem;