
import { useCallback } from "react";
import {
  BookOpen,
  Pencil,
  RefreshCw,
  Trash2,
} from "lucide-react";
import Table from "../../utils/table/Table.util";

const SubjectsTable = ({
  subjects = [],
  total = 0,
  currentPage = 1,
  itemsPerPage = 10,
  totalPages = 1,
  loading = false,
  searchTerm = "",
  onRefresh,
  onPageChange,
  onLimitChange,
  onEdit,
  onDelete,
  limitOptions = [5, 10, 20, 50, 100],
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
      label: "SUBJECT NAME",
      render: (row) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
            <BookOpen size={15} />
          </span>

          <span className="truncate text-xs font-semibold text-slate-800 sm:text-sm">
            {row.name || "Unnamed subject"}
          </span>
        </div>
      ),
    },
    {
      key: "description",
      label: "DESCRIPTION",
      render: (row) => (
        <span className="line-clamp-2 max-w-xs text-xs text-slate-600 sm:text-sm">
          {row.description || "—"}
        </span>
      ),
    },
    {
      key: "type",
      label: "TYPE",
      render: (row) => (
        <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium capitalize text-slate-600">
          {row.type || "Not specified"}
        </span>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      render: (row) => {
        const active =
          row.status?.toLowerCase() === "active";

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
                active
                  ? "bg-emerald-500"
                  : "bg-slate-400"
              }`}
            />

            {active ? "Active" : "Inactive"}
          </span>
        );
      },
    },
  ];

  const getRowActions = useCallback(
    (row) => [
      {
        label: "Edit Subject",
        icon: <Pencil size={14} />,
        onClick: (selectedRow) =>
          onEdit(selectedRow || row),
      },
      {
        label: "Delete Subject",
        icon: <Trash2 size={14} />,
        variant: "danger",
        onClick: (selectedRow) =>
          onDelete(selectedRow || row),
      },
    ],
    [onEdit, onDelete]
  );

  return (
    <div className="min-w-0 overflow-hidden rounded-xl">
      <Table
        title="Subject Directory"
        description="View and manage school subjects."
        actionButton={
          <button
            type="button"
            disabled={loading}
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        }
        columns={columns}
        data={subjects}
        keyField="id"
        loading={loading}
        emptyMessage={
          searchTerm
            ? "No matching subjects found. Try another search."
            : "No subjects available. Add your first subject to get started."
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

export default SubjectsTable;
