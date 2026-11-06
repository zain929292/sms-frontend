
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Table({
  title,
  description,
  actionButton,
  columns = [],
  data = [],
  loading = false,
  keyField = "id",
  emptyMessage = "No records found.",
  onRowClick,
  getRowActions,
  pagination,
  onPageChange,
  onLimitChange,
  limitOptions = [5, 10, 20, 50, 100],
}) {
  const currentPage = pagination?.page ?? 1;
  const limit = pagination?.limit ?? 10;
  const total = pagination?.total ?? 0;
  const lastPage = pagination?.last_page ?? 1;

  const hasActions = Boolean(getRowActions);

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

      {/* Header */}
      {(title || description || actionButton) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-slate-800">
                {title}
              </h3>
            )}

            {description && (
              <p className="mt-0.5 text-xs text-slate-500">
                {description}
              </p>
            )}
          </div>

          {actionButton}
        </div>
      )}

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-max text-left">

          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{ width: column.width }}
                  className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                >
                  {column.label}
                </th>
              ))}

              {hasActions && (
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">

            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (hasActions ? 1 : 0)}
                  className="px-4 py-10 text-center text-xs text-slate-500"
                >
                  Loading records...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (hasActions ? 1 : 0)}
                  className="px-4 py-10 text-center text-xs text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => {
                const actions = getRowActions?.(row) || [];

                return (
                  <tr
                    key={row[keyField] ?? index}
                    onClick={() => onRowClick?.(row)}
                    className={`transition-colors hover:bg-teal-50/40 ${
                      onRowClick ? "cursor-pointer" : ""
                    }`}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className="whitespace-nowrap px-4 py-3 text-xs text-slate-700"
                      >
                        {column.render
                          ? column.render(row)
                          : row[column.key] ?? "—"}
                      </td>
                    ))}

                    {hasActions && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {actions.map((action, actionIndex) => (
                            <button
                              key={`${action.label}-${actionIndex}`}
                              type="button"
                              title={action.label}
                              aria-label={action.label}
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick?.(row);
                              }}
                              className={`rounded-lg p-2 transition ${
                                action.variant === "danger"
                                  ? "text-red-500 hover:bg-red-50"
                                  : "text-slate-500 hover:bg-teal-50 hover:text-teal-700"
                              }`}
                            >
                              {action.icon}
                            </button>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}

          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">
              Rows per page
            </span>

            <select
              value={limit}
              onChange={(e) => onLimitChange?.(Number(e.target.value))}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-teal-500"
            >
              {limitOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <span className="text-[11px] text-slate-500">
              Total: {total}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">
              Page {currentPage} of {lastPage}
            </span>

            <button
              type="button"
              disabled={currentPage <= 1 || loading}
              onClick={() => onPageChange?.(currentPage - 1)}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-teal-50 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={15} />
            </button>

            <button
              type="button"
              disabled={currentPage >= lastPage || loading}
              onClick={() => onPageChange?.(currentPage + 1)}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-teal-50 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={15} />
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
