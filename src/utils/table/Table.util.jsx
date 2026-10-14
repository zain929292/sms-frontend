/**
 * @file Table.util.jsx
 * @module Util/Table
 * @description Flexible data table with expandable rows, multi-filters, action menus, and pagination.
 */

import { memo, useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar,
  X,
  MoreVertical,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                              Action Menu                                   */
/* -------------------------------------------------------------------------- */

const ActionMenu = memo(({ actions, row }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = useCallback((e) => {
    e.stopPropagation();
    setIsOpen((p) => !p);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={toggleMenu}
        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none"
        aria-label="Actions menu"
      >
        <MoreVertical size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-44 rounded-xl bg-white shadow-lg border border-slate-200 z-50 overflow-hidden py-1 transition-all duration-150 origin-top-right">
          {actions.map((action, index) => (
            <button
              key={index}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                action.onClick?.(row);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold transition-colors ${
                action.variant === "danger"
                  ? "text-rose-600 hover:bg-rose-50"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {action.icon && <span className="shrink-0">{action.icon}</span>}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
ActionMenu.displayName = "ActionMenu";

/* -------------------------------------------------------------------------- */
/*                               Input Helpers                                */
/* -------------------------------------------------------------------------- */

const searchInputClass =
  "w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all";

const dateInputClass =
  "w-full sm:w-auto pl-10 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all";

/* -------------------------------------------------------------------------- */
/*                                   Table                                    */
/* -------------------------------------------------------------------------- */

const Table = ({
  title,
  description,
  actionButton,

  searchValue = "",
  onSearch,
  searchPlaceholder = "Search...",

  enableMultiFilters = false,
  nameSearchValue = "",
  onNameSearchChange,
  nameSearchPlaceholder = "Search by name...",

  startDateValue = "",
  onStartDateChange,
  endDateValue = "",
  onEndDateChange,
  onClearFilters,

  filterControls,

  columns = [],
  data = [],
  keyField = "id",
  loading = false,
  emptyMessage = "No records found",

  getRowActions,

  pagination = {},
  onPageChange,
  onLimitChange,
  limitOptions = [5, 10, 20, 50, 100],

  onRowClick,
  rowClickable = false,
  className = "",

  expandable = false,
  expandedRowKey = null,
  renderExpandedRow,
  onExpandToggle,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [internalExpandedKey, setInternalExpandedKey] = useState(null);

  const activeExpandedKey =
    expandedRowKey !== undefined ? expandedRowKey : internalExpandedKey;

  const page = pagination.page || pagination.current_page || currentPage;
  const limit = pagination.limit || pagination.per_page || 10;
  const total = pagination.total || data.length;
  const totalPages =
    pagination.totalPages || pagination.last_page || Math.ceil(total / limit);

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage < 1 || newPage > totalPages) return;
      onPageChange ? onPageChange(newPage) : setCurrentPage(newPage);
    },
    [totalPages, onPageChange],
  );

  const handleLimitChange = useCallback(
    (e) => {
      onLimitChange?.(Number(e.target.value));
    },
    [onLimitChange],
  );

  const hasActiveFilters =
    Boolean(nameSearchValue) ||
    Boolean(startDateValue) ||
    Boolean(endDateValue);

  const colCount = columns.length + (getRowActions ? 1 : 0);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      {(title || actionButton) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {title && (
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-sm text-slate-500 mt-0.5">{description}</p>
            )}
          </div>
          {actionButton && <div className="shrink-0">{actionButton}</div>}
        </div>
      )}

      {/* Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-4 sm:p-5">
        {/* Filters */}
        {(onSearch || enableMultiFilters || filterControls) && (
          <div className="flex flex-col gap-3 mb-5">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
              {onSearch && !enableMultiFilters && (
                <div className="relative flex-1">
                  <Search
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => onSearch(e.target.value)}
                    placeholder={searchPlaceholder}
                    className={searchInputClass}
                  />
                </div>
              )}

              {enableMultiFilters && (
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 flex-1">
                  {onNameSearchChange && (
                    <div className="relative flex-1">
                      <Search
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                      <input
                        type="text"
                        value={nameSearchValue}
                        onChange={(e) => onNameSearchChange(e.target.value)}
                        placeholder={nameSearchPlaceholder}
                        className={searchInputClass}
                      />
                    </div>
                  )}

                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                    {onStartDateChange && (
                      <div className="relative flex-1 sm:flex-initial">
                        <Calendar
                          size={16}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />
                        <input
                          type="date"
                          value={startDateValue}
                          onChange={(e) => onStartDateChange(e.target.value)}
                          title="Start Date"
                          className={dateInputClass}
                        />
                      </div>
                    )}

                    <span className="text-slate-400 text-xs font-medium hidden sm:inline">
                      to
                    </span>

                    {onEndDateChange && (
                      <div className="relative flex-1 sm:flex-initial">
                        <Calendar
                          size={16}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />
                        <input
                          type="date"
                          value={endDateValue}
                          onChange={(e) => onEndDateChange(e.target.value)}
                          title="End Date"
                          className={dateInputClass}
                        />
                      </div>
                    )}

                    {hasActiveFilters && onClearFilters && (
                      <button
                        type="button"
                        onClick={onClearFilters}
                        className="inline-flex items-center justify-center p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors shrink-0"
                        title="Clear filters"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {filterControls && (
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  {filterControls}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto -mx-4 sm:-mx-5 pb-16 -mb-16">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/50">
                {columns.map((col, idx) => (
                  <th
                    key={col.key || idx}
                    className={`px-4 sm:px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider ${
                      col.align === "center"
                        ? "text-center"
                        : col.align === "right"
                          ? "text-right"
                          : "text-left"
                    } ${col.headerClassName || ""}`}
                    style={{ width: col.width || "auto" }}
                  >
                    {col.label}
                  </th>
                ))}
                {getRowActions && (
                  <th className="px-4 sm:px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right w-16">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td
                    colSpan={colCount}
                    className="py-12 text-center text-slate-400 text-sm"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </div>
                  </td>
                </tr>
              )}

              {!loading && data.length === 0 && (
                <tr>
                  <td
                    colSpan={colCount}
                    className="py-12 text-center text-slate-400 text-sm"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}

              {!loading &&
                data.map((row, rowIndex) => {
                  const rowKey = row[keyField] ?? rowIndex;
                  const isExpanded = activeExpandedKey === rowKey;
                  const actions = getRowActions ? getRowActions(row) : null;

                  return (
                    <RowGroup
                      key={rowKey}
                      row={row}
                      rowKey={rowKey}
                      rowIndex={rowIndex}
                      columns={columns}
                      actions={actions}
                      isExpanded={isExpanded}
                      expandable={expandable}
                      renderExpandedRow={renderExpandedRow}
                      rowClickable={rowClickable}
                      onRowClick={onRowClick}
                      colCount={colCount}
                    />
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span>
              Page <span className="font-semibold text-slate-800">{page}</span>{" "}
              of {totalPages} · {total} records
            </span>

            <div className="flex items-center gap-3">
              {onLimitChange && (
                <div className="flex items-center gap-2">
                  <span>Show per page:</span>
                  <select
                    value={limit}
                    onChange={handleLimitChange}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all"
                  >
                    {limitOptions.map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={14} /> Prev
                </button>
                <button
                  type="button"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                             Row Group (memo)                               */
/* -------------------------------------------------------------------------- */

const RowGroup = memo(
  ({
    row,
    rowKey,
    columns,
    actions,
    isExpanded,
    expandable,
    renderExpandedRow,
    rowClickable,
    onRowClick,
    colCount,
  }) => {
    return (
      <>
        <tr
          onClick={() => rowClickable && onRowClick?.(row)}
          className={`transition-colors duration-150 ${
            isExpanded ? "bg-slate-50/80" : ""
          } ${
            rowClickable
              ? "cursor-pointer hover:bg-slate-50/80"
              : "hover:bg-slate-50/50"
          }`}
        >
          {columns.map((col, colIndex) => (
            <td
              key={col.key || colIndex}
              className={`px-4 sm:px-5 py-4 text-sm text-slate-700 align-middle ${
                col.align === "center"
                  ? "text-center"
                  : col.align === "right"
                    ? "text-right"
                    : "text-left"
              } ${col.cellClassName || ""}`}
            >
              {col.render ? col.render(row) : (row[col.key] ?? "-")}
            </td>
          ))}

          {actions && (
            <td className="px-4 sm:px-5 py-4 text-sm text-right align-middle">
              {actions.length > 0 && <ActionMenu actions={actions} row={row} />}
            </td>
          )}
        </tr>

        {expandable && isExpanded && renderExpandedRow && (
          <tr>
            <td colSpan={colCount} className="p-0">
              {renderExpandedRow(row)}
            </td>
          </tr>
        )}
      </>
    );
  },
);
RowGroup.displayName = "RowGroup";

export default memo(Table);
