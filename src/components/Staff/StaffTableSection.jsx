
import { useState, useCallback } from "react";
import {
  Eye,
  Pencil,
  Trash2,
  RefreshCw,
  X,
} from "lucide-react";

import Table from "../../utils/table/Table.util";
import StaffFilters from "./StaffFilters";

const StaffTableSection = ({
  staff = [],
  loading = false,
  error = null,

  pagination = {},
  onPageChange,
  onLimitChange,

  searchValue = "",
  onSearch,

  onClearFilters,
  onRefresh,

  onView,
  onEdit,
  onDelete,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Staff table columns
  const columns = [
    {
      key: "name",
      label: "Staff",
      width: "200px",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          {row.photo ? (
            <img
              src={row.photo}
              alt={row.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center text-xs font-semibold">
              {row.name?.charAt(0)?.toUpperCase() || "S"}
            </div>
          )}

          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-700 truncate">
              {row.name || "N/A"}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {row.email || "No email"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "role_name",
      label: "Role",
      render: (row) => {
        const role = row.role_name?.toLowerCase();

        const roleStyles = {
          admin: "bg-purple-50 text-purple-700",
          principal: "bg-indigo-50 text-indigo-700",
          teacher: "bg-teal-50 text-teal-700",
          accountant: "bg-amber-50 text-amber-700",
          receptionist: "bg-blue-50 text-blue-700",
        };

        return (
          <span
            className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold capitalize ${
              roleStyles[role] || "bg-slate-100 text-slate-600"
            }`}
          >
            {row.role_name || "N/A"}
          </span>
        );
      },
    },
    {
      key: "phone",
      label: "Phone",
      render: (row) => (
        <span className="text-xs text-slate-600">
          {row.phone || "N/A"}
        </span>
      ),
    },
    {
      key: "qualification",
      label: "Qualification",
      render: (row) => (
        <span className="text-xs text-slate-600">
          {row.qualification || "N/A"}
        </span>
      ),
    },
    {
      key: "employment_type",
      label: "Employment",
      render: (row) => {
        const styles = {
          permanent: "bg-emerald-50 text-emerald-700",
          contract: "bg-amber-50 text-amber-700",
          part_time: "bg-blue-50 text-blue-700",
        };

        return (
          <span
            className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium capitalize ${
              styles[row.employment_type] ||
              "bg-slate-100 text-slate-600"
            }`}
          >
            {row.employment_type?.replace("_", " ") || "N/A"}
          </span>
        );
      },
    },
    {
      key: "joining_date",
      label: "Joining Date",
      render: (row) => (
        <span className="text-xs text-slate-600">
          {row.joining_date || "N/A"}
        </span>
      ),
    },
  ];

  // Table row actions
  const getRowActions = useCallback(
    (row) => [
      {
        label: "View Staff",
        icon: <Eye size={14} />,
        onClick: (selectedRow) =>
          onView?.(selectedRow || row),
      },
      {
        label: "Edit Staff",
        icon: <Pencil size={14} />,
        onClick: (selectedRow) =>
          onEdit?.(selectedRow || row),
      },
      {
        label: "Delete Staff",
        icon: <Trash2 size={14} />,
        variant: "danger",
        onClick: (selectedRow) =>
          onDelete?.(selectedRow || row),
      },
    ],
    [onView, onEdit, onDelete]
  );

  // Quick Staff Lookup
  const handleSelectStaff = (item) => {
    const staffName = item.user?.name ?? item.name ?? "";

    onSearch?.(staffName);
    setIsDropdownOpen(false);
  };

  // Existing StaffFilters
  const filterControls = (
    <StaffFilters
      searchTerm={searchValue}
      isDropdownOpen={isDropdownOpen}
      setIsDropdownOpen={setIsDropdownOpen}
      matches={staff}
      onSearchChange={onSearch}
      onClearSearch={() => onSearch?.("")}
      onSelectStaff={handleSelectStaff}
      onClearAll={onClearFilters}
      hasFilters={Boolean(searchValue)}
    />
  );

  // Refresh button
  const actionButton = (
    <button
      type="button"
      onClick={onRefresh}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition"
    >
      <RefreshCw
        size={13}
        className={loading ? "animate-spin" : ""}
      />
      Refresh
    </button>
  );

  return (
    <div className="space-y-2">
      {/* Error */}
      {error && (
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-red-50 border border-red-100 text-red-600">
          <p className="text-xs">{error}</p>

          <button
            type="button"
            onClick={onClearFilters}
            className="hover:text-red-800"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Reusable Table */}
      <Table
        title="Staff Management"
        description="Manage and view staff members."
        actionButton={actionButton}
        filterControls={filterControls}
        onClearFilters={onClearFilters}
        columns={columns}
        data={staff}
        keyField="id"
        loading={loading}
        emptyMessage="No staff members found."
        getRowActions={getRowActions}
        pagination={pagination}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        limitOptions={[10, 25, 50, 100]}
      />
    </div>
  );
};

export default StaffTableSection;
