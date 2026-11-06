import { Plus, CalendarDays, ClipboardList, Clock, CheckCircle } from "lucide-react";

const LeaveRequestHeader = ({
  totalRequests = 0,
  pendingRequests = 0,
  approvedRequests = 0,
  onAddLeaveRequest,
}) => {
  return (
    <section className="relative overflow-hidden rounded-xl border border-teal-100 bg-gradient-to-r from-white to-teal-50/60 p-4 shadow-sm sm:p-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="mb-1 text-[11px] font-medium text-teal-700">
            HR Management
            <span className="px-1 text-slate-300">/</span>
            Leave Requests
          </p>

          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Leave Requests
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Manage staff leave applications and track approval status.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddLeaveRequest}
          className="inline-flex min-h-9 items-center justify-center gap-1.5 self-start rounded-lg bg-[var(--primary)] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-teal-600/20 sm:self-center"
        >
          <Plus size={15} />
          Apply for Leave
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-teal-100/80 pt-3 text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <ClipboardList size={13} className="text-teal-600" />
          <span>
            <strong className="text-slate-700">{totalRequests}</strong>{" "}
            total requests
          </span>
        </span>

        <span className="inline-flex items-center gap-1.5">
          <Clock size={13} className="text-amber-500" />
          <span>
            <strong className="text-slate-700">{pendingRequests}</strong>{" "}
            pending
          </span>
        </span>

        <span className="inline-flex items-center gap-1.5">
          <CheckCircle size={13} className="text-green-600" />
          <span>
            <strong className="text-slate-700">{approvedRequests}</strong>{" "}
            approved
          </span>
        </span>
      </div>
    </section>
  );
};

export default LeaveRequestHeader;