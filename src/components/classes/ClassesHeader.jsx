import { Plus } from "lucide-react";

const ClassesHeader = ({ classesCount = 0, activeCount = 0, onAddClass }) => (
  <section className="relative overflow-hidden rounded-xl border border-teal-100 bg-gradient-to-r from-white to-teal-50/60 p-4 shadow-sm sm:p-5">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <div>
        <p className="mb-1 text-[11px] font-medium text-teal-700">
          Academics <span className="px-1 text-slate-300">/</span> Classes
        </p>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Classes</h1>
        <p className="mt-1 text-xs text-slate-500">
          Manage class names, sections, and availability.
        </p>
      </div>
      <button
        type="button"
        onClick={onAddClass}
        className="inline-flex min-h-9 items-center justify-center gap-1.5 self-start rounded-lg bg-[var(--primary)] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-teal-600/20 sm:self-center"
      >
        <Plus size={15} />
        Add Class
      </button>
    </div>
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-teal-100/80 pt-3 text-[11px] text-slate-500">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
        <span><strong className="text-slate-700">{classesCount}</strong> total classes</span>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <span><strong className="text-slate-700">{activeCount}</strong> active</span>
      </span>
    </div>
  </section>
);

export default ClassesHeader;
