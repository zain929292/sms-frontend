
import { useCallback } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Pencil,
  Trash2,
} from "lucide-react";
import Table from "../../utils/table/Table.util";

const AcademicSessionsTable = ({
  sessions = [],
  total = 0,
  currentPage,
  itemsPerPage,
  totalPages,
  loading,
  searchTerm,
  onRefresh,
  onPageChange,
  onLimitChange,
  onEdit,
  onDelete,
  limitOptions,
}) => {
  const columns = [
    {
      key: "id",
      label: "ID",
      width: "60px",
      render: (row) => (
        <span className="text-xs font-medium text-slate-500">
          #{row.id}
        </span>
      ),
    },
    {
      key: "name",
      label: "ACADEMIC SESSION",
      render: (row) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
            <CalendarDays size={15} strokeWidth={1.8} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-slate-800 sm:text-sm">
              {row.name || "Unnamed session"}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              ID: {row.id}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "start_date",
      label: "START DATE",
      render: (row) => (
        <span className="whitespace-nowrap text-xs text-slate-600">
          {row.start_date || "—"}
        </span>
      ),
    },
    {
      key: "end_date",
      label: "END DATE",
      render: (row) => (
        <span className="whitespace-nowrap text-xs text-slate-600">
          {row.end_date || "—"}
        </span>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      render: (row) => {
        const active = row.status?.toLowerCase() === "active";

        return (
          <span
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-1 text-[11px] font-medium ${
              active
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-slate-50 text-slate-500"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                active ? "bg-emerald-500" : "bg-slate-400"
              }`}
            />
            {active ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      key: "is_current",
      label: "CURRENT SESSION",
      render: (row) => {
        // Active session is considered the current session.
        const isCurrent = row.status?.toLowerCase() === "active";

        return isCurrent ? (
          <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-teal-200 bg-teal-50 px-2 py-1 text-[11px] font-medium text-teal-700">
            <CheckCircle2 size={12} />
            Current
          </span>
        ) : (
          <span className="text-xs text-slate-300">—</span>
        );
      },
    },
  ];

  const getRowActions = useCallback(
    (row) => [
      {
        label: "Edit Session",
        icon: <Pencil size={14} />,
        onClick: (selectedRow) => onEdit(selectedRow || row),
      },
      {
        label: "Delete Session",
        icon: <Trash2 size={14} />,
        variant: "danger",
        onClick: (selectedRow) => onDelete(selectedRow || row),
      },
    ],
    [onEdit, onDelete],
  );

  return (
    <div className="min-w-0 overflow-hidden rounded-xl">
      <Table
        title="Session Directory"
        description="Manage academic sessions and their status."
        actionButton={
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Clock3
              size={14}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        }
        columns={columns}
        data={sessions}
        keyField="id"
        loading={loading}
        emptyMessage={
          searchTerm
            ? "No matching sessions found. Try another search."
            : "No academic sessions available. Add your first session to get started."
        }
        getRowActions={getRowActions}
        pagination={{
          page: currentPage,
          limit: itemsPerPage,
          total,
          last_page: totalPages,
        }}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        limitOptions={limitOptions}
      />
    </div>
  );
};

export default AcademicSessionsTable;
