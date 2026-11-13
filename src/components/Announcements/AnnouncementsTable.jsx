
import { useCallback } from "react";
import {
  Bell,
  CalendarDays,
  Clock3,
  Pencil,
  Trash2,
} from "lucide-react";

import Table from "../../utils/table/Table.util";

const AnnouncementsTable = ({
  announcements = [],
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
      key: "notice",
      label: "ANNOUNCEMENT",
      render: (row) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
            <Bell size={15} strokeWidth={1.8} />
          </div>

          <div className="min-w-0">
            <p className="line-clamp-2 text-xs font-semibold leading-5 text-slate-800 sm:text-sm">
              {row.notice || "No announcement notice"}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              ID: {row.id}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "audience",
      label: "AUDIENCE",
      render: (row) => (
        <span className="inline-flex whitespace-nowrap rounded-md border border-teal-100 bg-teal-50 px-2 py-1 text-[11px] font-medium capitalize text-teal-700">
          {row.audience || "—"}
        </span>
      ),
    },
    {
      key: "publish_date",
      label: "PUBLISH DATE",
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-slate-600">
          <CalendarDays size={13} className="text-slate-400" />
          {row.publish_date || "—"}
        </span>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      render: (row) => {
        const status = row.status?.toLowerCase();

        const styles = {
          published:
            "border-emerald-200 bg-emerald-50 text-emerald-700",
          draft:
            "border-amber-200 bg-amber-50 text-amber-700",
          inactive:
            "border-slate-200 bg-slate-50 text-slate-500",
        };

        const dotStyles = {
          published: "bg-emerald-500",
          draft: "bg-amber-500",
          inactive: "bg-slate-400",
        };

        return (
          <span
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-1 text-[11px] font-medium capitalize ${
              styles[status] || styles.inactive
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                dotStyles[status] || dotStyles.inactive
              }`}
            />
            {status || "Unknown"}
          </span>
        );
      },
    },
  ];

  const getRowActions = useCallback(
    (row) => [
      {
        label: "Edit Announcement",
        icon: <Pencil size={14} />,
        onClick: (selectedRow) => onEdit(selectedRow || row),
      },
      {
        label: "Delete Announcement",
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
        title="Announcement Directory"
        description="Manage school announcements, audiences and publishing status."
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
        data={announcements}
        keyField="id"
        loading={loading}
        emptyMessage={
          searchTerm
            ? "No matching announcements found. Try another search."
            : "No announcements available. Add your first announcement to get started."
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

export default AnnouncementsTable;
