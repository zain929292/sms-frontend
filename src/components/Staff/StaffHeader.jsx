
import { Plus, Users } from "lucide-react";

const StaffHeader = ({
  onAddStaff,
  staffCount = 0,
}) => (
  <div className="relative overflow-hidden rounded-xl border border-teal-100 bg-gradient-to-r from-white to-teal-50/60 p-4 shadow-sm sm:p-5">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      {/* Header Information */}
      <div className="min-w-0">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
          <span>Administration</span>
          <span className="text-slate-300">/</span>
          <span className="text-teal-700">Staff Management</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-100/70 text-teal-700">
            <Users size={18} />
          </div>

          <div className="min-w-0">
            <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
              Staff Management
            </h1>

            <p className="mt-0.5 max-w-xl text-xs leading-5 text-slate-500">
              Manage teachers, employees, and school staff records.
            </p>
          </div>
        </div>
      </div>

      {/* Add Staff */}
      <button
        type="button"
        onClick={onAddStaff}
        className="inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 self-start rounded-lg bg-[var(--primary)] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-teal-600/20 active:scale-[0.98] sm:self-center"
      >
        <Plus size={15} />
        Add Staff
      </button>
    </div>

    {/* Staff Count */}
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-teal-100/80 pt-3 text-[11px] text-slate-500">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />

        <span>
          <span className="font-semibold text-slate-700">
            {staffCount}
          </span>{" "}
          total staff members
        </span>
      </span>
    </div>
  </div>
);

export default StaffHeader;
