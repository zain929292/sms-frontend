
import { memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const TablePagination = memo(({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
  limitOptions = [5, 10, 20, 50, 100, "all"],
}) => {
  if (totalPages <= 0) return null;

  return (
    <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
      <span>
        Page{" "}
        <span className="font-semibold text-slate-800">
          {page}
        </span>{" "}
        of {totalPages} · {total} records
      </span>

      <div className="flex items-center gap-3">
        {onLimitChange && (
          <div className="flex items-center gap-2">
            <span>Show per page:</span>

            <select
              value={limit}
              onChange={(e) => {
                const value = e.target.value;
                onLimitChange(
                  value === "all" ? "all" : Number(value)
                );
              }}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all"
            >
              {limitOptions.map((num) => (
                <option key={num} value={num}>
                  {num === "all" ? "All" : num}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={14} />
            Prev
          </button>

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
});

TablePagination.displayName = "TablePagination";

export default TablePagination;
