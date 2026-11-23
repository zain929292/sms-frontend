/**
 * @file Roles.jsx
 * @module Screens/Roles
 * @description Role management screen (CRUD only, no permissions) with stat cards.
 */

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Shield,
  FileText,
  Clock,
  Activity,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";

import {
  fetchRoles,
  deleteRole,
  clearRoleState,
} from "../../redux/slices/Roles.slice.redux";
import Table from "../../utils/table/Table.util";
import StatCard from "../../utils/cards/Stat.card.util";
import FilterBar from "../../utils/filter/FilterBar.util";
import RoleModal from "../../utils/modals/role-modal/Role.modal.util";
import { exportToExcel } from "../../utils/export/Export.util";

/* -------------------------------------------------------------------------- */
/*                                Constants                                   */
/* -------------------------------------------------------------------------- */

const LIMIT_OPTIONS = [5, 10, 20, 50, 100];

const EXPORT_COLUMNS = [
  { key: "id", label: "Role ID" },
  { key: "name", label: "Role Name" },
  { key: "description", label: "Description" },
  { key: "created_at", label: "Created At" },
];

const matchesSearch = (r, term) => {
  if (!term) return true;
  const s = term.toLowerCase();
  return (
    String(r.id).includes(term) ||
    r.name?.toLowerCase().includes(s) ||
    r.description?.toLowerCase().includes(s)
  );
};

const formatDate = (d) => (!d ? "" : new Date(d).toLocaleDateString());

const isCreatedThisMonth = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  );
};

/* -------------------------------------------------------------------------- */
/*                              Component                                     */
/* -------------------------------------------------------------------------- */

const Roles = () => {
  const dispatch = useDispatch();

  const roles = useSelector((s) => s.roles?.roles ?? []);
  const loading = useSelector((s) => s.roles?.loading ?? false);

  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  /* ------------------------------- Effects ------------------------------- */

  useEffect(() => {
    dispatch(fetchRoles());
    return () => dispatch(clearRoleState());
  }, [dispatch]);

  /* ------------------------------- Derived ------------------------------- */

  const roleList = useMemo(
    () => roles.map((r) => ({ ...r, id: r.id || r._id })),
    [roles],
  );

  const filteredRoles = useMemo(
    () => roleList.filter((r) => matchesSearch(r, searchTerm)),
    [roleList, searchTerm],
  );

  const tableDisplayRoles = useMemo(() => {
    if (selectedRoleId) {
      return roleList.filter((r) => r.id === selectedRoleId);
    }
    return filteredRoles;
  }, [roleList, filteredRoles, selectedRoleId]);

  const paginatedRoles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return tableDisplayRoles.slice(start, start + itemsPerPage);
  }, [tableDisplayRoles, currentPage, itemsPerPage]);

  const totalPages = Math.max(
    1,
    Math.ceil(tableDisplayRoles.length / itemsPerPage),
  );

  const hasFilters = Boolean(searchTerm || selectedRoleId);

  /* ------------------------------- Stats --------------------------------- */

  const stats = useMemo(() => {
    const total = tableDisplayRoles.length;
    let withDesc = 0;
    let recentThisMonth = 0;
    let totalDescLength = 0;
    let descCount = 0;

    for (const r of tableDisplayRoles) {
      if (r.description && r.description.trim()) {
        withDesc++;
        totalDescLength += r.description.trim().length;
        descCount++;
      }
      if (isCreatedThisMonth(r.created_at)) recentThisMonth++;
    }

    const safe = total || 1;
    return {
      total,
      withDesc,
      recentThisMonth,
      avgDescLength: descCount ? Math.round(totalDescLength / descCount) : 0,
      coverageRate: total ? Math.round((withDesc / safe) * 100) : 0,
      recentRate: total ? Math.round((recentThisMonth / safe) * 100) : 0,
    };
  }, [tableDisplayRoles]);

  /* ------------------------------ Handlers ------------------------------- */

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    setSelectedRoleId(null);
    setIsDropdownOpen(true);
    setCurrentPage(1);
  }, []);

  const handleSelectSuggestion = useCallback((role) => {
    setSelectedRoleId(role.id);
    setSearchTerm(role.name || "");
    setIsDropdownOpen(false);
    setCurrentPage(1);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    setSelectedRoleId(null);
    setCurrentPage(1);
  }, []);

  const handleClearAll = useCallback(() => {
    setSearchTerm("");
    setSelectedRoleId(null);
    setCurrentPage(1);
  }, []);

  const handleLimitChange = useCallback((n) => {
    setItemsPerPage(n);
    setCurrentPage(1);
  }, []);

  const handleOpenCreate = useCallback(() => {
    setSelectedRole(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((role) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedRole(null);
  }, []);

  const handleDelete = useCallback(
    async (id, name) => {
      if (!window.confirm(`Delete role "${name}"?`)) return;

      const result = await dispatch(deleteRole(id));
      if (deleteRole.fulfilled.match(result)) {
        toast.success("Role deleted successfully.");
        if (selectedRoleId === id) {
          setSelectedRoleId(null);
          setSearchTerm("");
        }
      } else {
        toast.error(result.payload || "Failed to delete role.");
      }
    },
    [dispatch, selectedRoleId],
  );

  const handleExport = useCallback(() => {
    if (!tableDisplayRoles.length) {
      toast.error("No roles to export.");
      return;
    }

    const data = tableDisplayRoles.map((r) => ({
      id: r.id,
      name: r.name || "",
      description: r.description || "",
      created_at: formatDate(r.created_at),
    }));

    const filename = `roles_export_${new Date().toISOString().split("T")[0]}`;
    exportToExcel(data, filename, EXPORT_COLUMNS);
    toast.success(`Exported ${data.length} roles.`);
  }, [tableDisplayRoles]);

  /* ------------------------------ Columns -------------------------------- */

  const columns = useMemo(
    () => [
      {
        key: "id",
        label: "ID",
        width: "70px",
        render: (row) => (
          <span className="font-semibold text-slate-800 text-xs">
            {row.id ?? "-"}
          </span>
        ),
      },
      {
        key: "name",
        label: "ROLE NAME",
        render: (row) => (
          <span className="font-bold text-slate-900 text-xs capitalize flex items-center gap-2">
            <Shield size={14} className="text-[#00A3AD]" />
            {row.name || "-"}
          </span>
        ),
      },
      {
        key: "description",
        label: "DESCRIPTION",
        render: (row) => (
          <span
            className="text-slate-600 text-xs max-w-[320px] truncate block"
            title={row.description}
          >
            {row.description || "-"}
          </span>
        ),
      },
      {
        key: "created_at",
        label: "CREATED AT",
        render: (row) => (
          <span className="text-slate-500 text-xs">
            {row.created_at
              ? new Date(row.created_at).toLocaleDateString()
              : "-"}
          </span>
        ),
      },
    ],
    [],
  );

  const getRowActions = useCallback(
    (row) => [
      {
        label: "Edit Role",
        icon: <Pencil size={14} />,
        onClick: (r) => handleOpenEdit(r),
      },
      {
        label: "Delete Role",
        icon: <Trash2 size={14} />,
        variant: "danger",
        onClick: (r) => handleDelete(r.id, r.name),
      },
    ],
    [handleOpenEdit, handleDelete],
  );

  /* --------------------------- Filter config ----------------------------- */

  const filterConfig = useMemo(
    () => ({
      picker: {
        label: "Quick Role Lookup",
        searchTerm,
        onSearchChange: handleSearchChange,
        onClearSearch: handleClearSearch,
        placeholder: "Search by role name or description...",
        isOpen: isDropdownOpen,
        setIsOpen: setIsDropdownOpen,
        items: filteredRoles,
        onSelectItem: handleSelectSuggestion,
        emptyMessage: "No matching roles found.",
        itemRenderer: (role) => (
          <>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-teal-50 text-[#00A3AD] flex items-center justify-center font-bold text-xs">
                {role.name?.[0]?.toUpperCase() || "R"}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 capitalize">
                  {role.name}
                </p>
                <p className="text-[11px] text-slate-500 truncate max-w-[250px]">
                  {role.description || "No description"}
                </p>
              </div>
            </div>
            <span className="text-xs text-slate-400">ID: {role.id}</span>
          </>
        ),
      },
      exportConfig: {
        onClick: handleExport,
        count: tableDisplayRoles.length,
        label: "Export",
        showCount: true,
      },
      hasFilters,
      onClearAll: handleClearAll,
    }),
    [
      searchTerm,
      isDropdownOpen,
      filteredRoles,
      tableDisplayRoles.length,
      hasFilters,
      handleSearchChange,
      handleClearSearch,
      handleSelectSuggestion,
      handleExport,
      handleClearAll,
    ],
  );

  /* ---------------------------- Stats config ----------------------------- */

  const filterTag = hasFilters ? (
    <span className="ml-1 text-[10px] font-normal text-slate-400">
      (filtered)
    </span>
  ) : null;

  const statCards = useMemo(
    () => [
      {
        key: "total",
        title: <>Total Roles {filterTag}</>,
        value: stats.total,
        icon: Shield,
        color: "teal",
        subtitle: "Defined system roles",
      },
      {
        key: "withDesc",
        title: <>With Description {filterTag}</>,
        value: stats.withDesc,
        icon: FileText,
        color: "emerald",
        subtitle: `${stats.coverageRate}% documentation coverage`,
        progressPct: stats.coverageRate,
        progressColor: "bg-emerald-500",
      },
      {
        key: "recent",
        title: <>Created This Month {filterTag}</>,
        value: stats.recentThisMonth,
        icon: Clock,
        color: "violet",
        subtitle: stats.recentThisMonth > 0 ? "New this month" : "No new roles",
        progressPct: stats.recentRate,
        progressColor: "bg-violet-500",
      },
      {
        key: "avgDesc",
        title: <>Avg Description Length {filterTag}</>,
        value: stats.avgDescLength,
        icon: Activity,
        color: "blue",
        subtitle:
          stats.avgDescLength > 0 ? "characters per role" : "No descriptions",
      },
    ],
    [stats, filterTag],
  );

  /* ------------------------------- Render -------------------------------- */

  return (
    <div className="space-y-4">
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.key} {...card} />
        ))}
      </div>

      <FilterBar {...filterConfig} />

      <Table
        title="Role Management"
        actionButton={
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 bg-[#00A3AD] hover:bg-[#008C94] text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-sm"
            type="button"
          >
            <Plus size={18} />
            Create Role
          </button>
        }
        columns={columns}
        data={paginatedRoles}
        keyField="id"
        loading={loading}
        getRowActions={getRowActions}
        pagination={{
          page: currentPage,
          limit: itemsPerPage,
          total: tableDisplayRoles.length,
          last_page: totalPages,
        }}
        onPageChange={setCurrentPage}
        onLimitChange={handleLimitChange}
        limitOptions={LIMIT_OPTIONS}
      />

      <RoleModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        roleData={selectedRole}
      />
    </div>
  );
};

export default Roles;
