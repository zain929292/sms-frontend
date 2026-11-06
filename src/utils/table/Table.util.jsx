
import { memo, useState, useCallback } from "react";

import TableHeader from "./TableComponents/TableHeader";
import TableFilters from "./TableComponents/TableFilters";
import TableRow from "./TableComponents/TableRow";
import TablePagination from "./TableComponents/TablePagination";

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
  expandedRowKey,
  renderExpandedRow,
  onExpandToggle,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [internalExpandedKey, setInternalExpandedKey] = useState(null);

  const activeExpandedKey =
    expandedRowKey !== undefined
      ? expandedRowKey
      : internalExpandedKey;

  const page =
    pagination.page ??
    pagination.current_page ??
    currentPage;

  const limit =
    pagination.limit ??
    pagination.per_page ??
    10;

  const total = pagination.total ?? data.length;

  const totalPages =
    pagination.totalPages ??
    pagination.last_page ??
    Math.ceil(total / limit);

  const colCount = columns.length + (getRowActions ? 1 : 0);

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage < 1 || newPage > totalPages) return;

      if (onPageChange) {
        onPageChange(newPage);
      } else {
        setCurrentPage(newPage);
      }
    },
    [totalPages, onPageChange]
  );

  const handleRowClick = useCallback(
    (row) => {
      if (expandable && onExpandToggle) {
        onExpandToggle(row);
      } else if (expandable && !onRowClick) {
        const rowKey = row[keyField];

        setInternalExpandedKey((prev) =>
          prev === rowKey ? null : rowKey
        );
      }

      onRowClick?.(row);
    },
    [expandable, onExpandToggle, onRowClick, keyField]
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <TableHeader
        title={title}
        description={description}
        actionButton={actionButton}
      />

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-4 sm:p-5">
        <TableFilters
          searchValue={searchValue}
          onSearch={onSearch}
          searchPlaceholder={searchPlaceholder}
          enableMultiFilters={enableMultiFilters}
          nameSearchValue={nameSearchValue}
          onNameSearchChange={onNameSearchChange}
          nameSearchPlaceholder={nameSearchPlaceholder}
          startDateValue={startDateValue}
          onStartDateChange={onStartDateChange}
          endDateValue={endDateValue}
          onEndDateChange={onEndDateChange}
          onClearFilters={onClearFilters}
          filterControls={filterControls}
        />

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
              {loading ? (
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
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={colCount}
                    className="py-12 text-center text-slate-400 text-sm"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row, rowIndex) => {
                  const rowKey = row[keyField] ?? rowIndex;

                  const actions = getRowActions
                    ? getRowActions(row)
                    : null;

                  return (
                    <TableRow
                      key={rowKey}
                      row={row}
                      columns={columns}
                      actions={actions}
                      hasActions={Boolean(getRowActions)}
                      isExpanded={activeExpandedKey === rowKey}
                      expandable={expandable}
                      renderExpandedRow={renderExpandedRow}
                      rowClickable={rowClickable || expandable}
                      onRowClick={handleRowClick}
                      colCount={colCount}
                    />
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          page={page}
          limit={limit}
          total={total}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onLimitChange={onLimitChange}
          limitOptions={limitOptions}
        />
      </div>
    </div>
  );
};

export default memo(Table);
