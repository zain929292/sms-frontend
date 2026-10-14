/**
 * @file Users.jsx
 * @module Screens/Users
 * @description User & staff list with stat cards, quick lookup, CSV export,
 *              and client-side pagination for instant per-page changes.
 */

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Plus,
  ShieldCheck,
  Users as UsersIcon,
  Stethoscope,
  UserCog,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";

import { getAllUsers } from "../../redux/slices/Auth.slice.redux";
import Table from "../../utils/table/Table.util";
import StatCard from "../../utils/cards/Stat.card.util";
import FilterBar from "../../utils/filter/FilterBar.util";
import UserModal from "../../utils/modals/user-modal/AddUser.modal.util";
import { exportToExcel } from "../../utils/export/Export.util";

/* -------------------------------------------------------------------------- */
/*                                Constants                                   */
/* -------------------------------------------------------------------------- */

const LIMIT_OPTIONS = [5, 8, 10, 20, 50, 100];

const EXPORT_COLUMNS = [
  { key: "id", label: "User ID" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
];

const matchesSearch = (u, term) => {
  if (!term) return true;
  const l = term.toLowerCase();
  return (
    String(u.id).includes(term) ||
    u.name?.toLowerCase().includes(l) ||
    u.email?.toLowerCase().includes(l) ||
    u.role?.toLowerCase().includes(l)
  );
};

/* -------------------------------------------------------------------------- */
/*                              Component                                     */
/* -------------------------------------------------------------------------- */

const Users = () => {
  const dispatch = useDispatch();

  /* ------------------------------ Selectors ------------------------------ */

  const users = useSelector((s) => s.auth?.users ?? []);
  const usersLoading = useSelector((s) => s.auth?.usersLoading ?? false);

  /* ------------------------------- UI state ------------------------------ */

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /* ------------------------------- Effects ------------------------------- */
  // Fetch ALL users once — client-side pagination handles slicing
  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  /* ------------------------------- Derived ------------------------------- */

  // 1) Filtered list (search + optional selected user)
  const filteredUsers = useMemo(() => {
    if (selectedUserId) {
      return users.filter((u) => u.id === selectedUserId);
    }
    return users.filter((u) => matchesSearch(u, searchTerm));
  }, [users, searchTerm, selectedUserId]);

  // 2) Paginated slice for the table
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  // 3) Total pages
  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / itemsPerPage),
  );

  // 4) Stats from the *filtered* list (not the paginated slice)
  const stats = useMemo(() => {
    const total = filteredUsers.length;
    let doctors = 0;
    let admins = 0;
    let staff = 0;

    for (const u of filteredUsers) {
      const r = (u.role || "").toLowerCase();
      if (r === "doctor") doctors++;
      else if (r === "admin") admins++;
      else staff++;
    }

    const safe = total || 1;
    return {
      total,
      doctors,
      admins,
      staff,
      doctorRate: total ? Math.round((doctors / safe) * 100) : 0,
      adminRate: total ? Math.round((admins / safe) * 100) : 0,
    };
  }, [filteredUsers]);

  const hasFilters = Boolean(searchTerm || selectedUserId);

  /* ------------------------------ Handlers ------------------------------- */

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    setSelectedUserId(null);
    setIsDropdownOpen(true);
    setCurrentPage(1);
  }, []);

  const handleSelectSuggestion = useCallback((user) => {
    setSelectedUserId(user.id);
    setSearchTerm(user.name || "");
    setIsDropdownOpen(false);
    setCurrentPage(1);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    setSelectedUserId(null);
    setCurrentPage(1);
  }, []);

  const handleClearAll = useCallback(() => {
    setSearchTerm("");
    setSelectedUserId(null);
    setCurrentPage(1);
  }, []);

  const handleLimitChange = useCallback((n) => {
    setItemsPerPage(n);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handleOpenCreateModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleExport = useCallback(() => {
    if (!filteredUsers.length) {
      toast.error("No users to export.");
      return;
    }

    const exportData = filteredUsers.map((u) => ({
      id: u.id,
      name: u.name || "",
      email: u.email || "",
      role: u.role || "",
    }));

    const filename = `users_export_${new Date().toISOString().split("T")[0]}`;
    exportToExcel(exportData, filename, EXPORT_COLUMNS);
    toast.success(`Exported ${exportData.length} users.`);
  }, [filteredUsers]);

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
        label: "NAME",
        render: (row) => (
          <span className="font-bold text-slate-900 text-xs">
            {row.name || "-"}
          </span>
        ),
      },
      {
        key: "email",
        label: "EMAIL",
        render: (row) => (
          <span className="text-slate-700 text-xs">{row.email || "-"}</span>
        ),
      },
      {
        key: "role",
        label: "ROLE",
        render: (row) => (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-50 border border-cyan-200/60 text-xs font-bold text-cyan-700 uppercase">
            <ShieldCheck size={12} />
            {row.role || "-"}
          </span>
        ),
      },
    ],
    [],
  );

  /* --------------------------- Filter config ----------------------------- */

  const filterConfig = useMemo(
    () => ({
      picker: {
        label: "Quick User Filter",
        searchTerm,
        onSearchChange: handleSearchChange,
        onClearSearch: handleClearSearch,
        placeholder: "Search by name, email, or role...",
        isOpen: isDropdownOpen,
        setIsOpen: setIsDropdownOpen,
        items: filteredUsers,
        onSelectItem: handleSelectSuggestion,
        emptyMessage: "No matching users found.",
        itemRenderer: (u) => (
          <>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold text-xs">
                {u.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">{u.name}</p>
                <p className="text-[10px] text-slate-500">
                  {u.email} • {u.role}
                </p>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              ID: {u.id}
            </span>
          </>
        ),
      },
      exportConfig: {
        onClick: handleExport,
        count: filteredUsers.length,
        label: "Export",
        showCount: true,
      },
      hasFilters,
      onClearAll: handleClearAll,
    }),
    [
      searchTerm,
      isDropdownOpen,
      filteredUsers,
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
        title: <>Total Users {filterTag}</>,
        value: stats.total,
        icon: UsersIcon,
        color: "teal",
        subtitle: "Active accounts",
      },
      {
        key: "doctors",
        title: <>Doctors {filterTag}</>,
        value: stats.doctors,
        icon: Stethoscope,
        color: "emerald",
        subtitle: `${stats.doctorRate}% of total`,
        progressPct: stats.doctorRate,
        progressColor: "bg-emerald-500",
      },
      {
        key: "admins",
        title: <>Admins {filterTag}</>,
        value: stats.admins,
        icon: ShieldCheck,
        color: "violet",
        subtitle: `${stats.adminRate}% of total`,
        progressPct: stats.adminRate,
        progressColor: "bg-violet-500",
      },
      {
        key: "staff",
        title: <>Other Staff {filterTag}</>,
        value: stats.staff,
        icon: UserCog,
        color: "blue",
        subtitle: "Reception, pharmacy, lab…",
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

      {/* Filter bar (search + export + clear all) */}
      <FilterBar {...filterConfig} />

      {/* Main table with client-side pagination */}
      <Table
        title="User Management"
        actionButton={
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 bg-[#00A3AD] hover:bg-[#008C94] text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm active:scale-95"
          >
            <Plus size={18} />
            Add User
          </button>
        }
        hideSearch
        columns={columns}
        data={paginatedUsers}
        keyField="id"
        loading={usersLoading}
        pagination={{
          page: currentPage,
          limit: itemsPerPage,
          total: filteredUsers.length,
          last_page: totalPages,
        }}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        limitOptions={LIMIT_OPTIONS}
      />

      {/* Create / edit modal */}
      <UserModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
};

export default Users;
