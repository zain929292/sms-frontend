import { useCallback } from "react";
import { BookOpen, Pencil, RefreshCw, Trash2 } from "lucide-react";
import Table from "../../utils/table/Table.util";

const ClassesTable = ({
  classes = [],
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
      render: (row) => <span className="text-xs font-medium text-slate-500">#{row.id}</span>,
    },
    {
      key: "name",
      label: "CLASS NAME",
      render: (row) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
            <BookOpen size={15} />
          </span>
          <span className="truncate text-xs font-semibold text-slate-800 sm:text-sm">
            {row.name || "Unnamed class"}
          </span>
        </div>
      ),
    },
    {
      key: "section",
      label: "SECTION",
      render: (row) => <span className="text-xs text-slate-600">{row.section || "—"}</span>,
    },
    {
      key: "status",
      label: "STATUS",
      render: (row) => {
        const active = row.status?.toLowerCase() === "active";
        return (
          <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-1 text-[11px] font-medium ${
            active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-500"
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-slate-400"}`} />
            {active ? "Active" : "Inactive"}
          </span>
        );
      },
    },
  ];

  const getRowActions = useCallback(
    (row) => [
      { label: "Edit Class", icon: <Pencil size={14} />, onClick: (selectedRow) => onEdit(selectedRow || row) },
      { label: "Delete Class", icon: <Trash2 size={14} />, variant: "danger", onClick: (selectedRow) => onDelete(selectedRow || row) },
    ],
    [onEdit, onDelete],
  );

  return (
    <div className="min-w-0 overflow-hidden rounded-xl">
      <Table
        title="Class Directory"
        description="View and manage school classes."
        actionButton={
          <button
            type="button"
            disabled={loading}
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        }
        columns={columns}
        data={classes}
        keyField="id"
        loading={loading}
        emptyMessage={searchTerm ? "No matching classes found. Try another search." : "No classes available. Add your first class to get started."}
        getRowActions={getRowActions}
        pagination={{ page: currentPage, limit: itemsPerPage, total, last_page: totalPages }}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        limitOptions={limitOptions}
      />
    </div>
  );
};

export default ClassesTable;
