
import { useState } from "react";

import StaffModal from "../../utils/modals/staff/StaffModal";
import StaffViewModal from "../../utils/modals/staff/StaffViewModal";

import FilterBar from "../../utils/filter/FilterBar.util";

import useStaff from "../../hook/Staff/useStaff";
import useUsers from "../../hook/Users/useUsers";

import StaffStats from "../../components/Staff/StaffStats";
import StaffHeader from "../../components/Staff/StaffHeader";
import StaffTableSection from "../../components/Staff/StaffTableSection";

export default function Staff() {
  const s = useStaff();
  const u = useUsers({ limit: 20 });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Quick Staff Lookup
  const handleSelectStaff = (item) => {
    s.setSearch(item.name || "");
    s.setPage(1);
    setIsDropdownOpen(false);
  };

  // Clear all filters
  const handleClearFilters = () => {
    s.handleClearAllFilters();
    setIsDropdownOpen(false);
  };

  // Export Staff CSV
  const handleExport = () => {
    const headers = [
      "Name",
      "Email",
      "Role",
      "Phone",
      "Qualification",
      "Specialization",
      "Experience",
      "Employment Type",
      "Joining Date",
    ];

    const rows = s.displayedStaff.map((staff) => [
      staff.name,
      staff.email,
      staff.role_name,
      staff.phone,
      staff.qualification,
      staff.specialization,
      staff.experience,
      staff.employment_type,
      staff.joining_date,
    ]);

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) =>
        row.map(escapeCSV).join(",")
      ),
    ].join("\n");

    const blob = new Blob(
      ["\uFEFF" + csvContent],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `staff-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // Filter Configuration
  const filterConfig = {
    picker: {
      label: "Quick Staff Lookup",
      searchTerm: s.search,
      onSearchChange: s.handleSearchChange,
      onClearSearch: s.handleClearSearch,
      placeholder: "Search by name, phone, qualification...",
      isOpen: isDropdownOpen,
      setIsOpen: setIsDropdownOpen,
      items: s.staff,
      onSelectItem: handleSelectStaff,
      emptyMessage: "No matching staff found.",

      itemRenderer: (staff) => (
        <div className="flex items-center justify-between gap-3 w-full">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-700">
              {staff.name?.[0]?.toUpperCase() || "S"}
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-slate-800">
                {staff.name || "N/A"}
              </p>

              <p className="truncate text-[11px] text-slate-500">
                {staff.phone || staff.email || "No contact"}
              </p>
            </div>
          </div>

          <span className="shrink-0 text-xs text-slate-400 capitalize">
            {staff.role_name || "Staff"}
          </span>
        </div>
      ),
    },

    // Employment Type Filter
    customFilters: (
      <div className="min-w-[170px]">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
          Employment Type
        </label>

        <select
          value={s.employmentType}
          onChange={(e) =>
            s.handleEmploymentTypeChange(e.target.value)
          }
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
        >
          <option value="">All Employment Types</option>
          <option value="permanent">Permanent</option>
          <option value="contract">Contract</option>
          <option value="part_time">Part Time</option>
        </select>
      </div>
    ),

    exportConfig: {
      onClick: handleExport,
      count: s.displayedStaff.length,
      label: "Export",
      showCount: true,
    },

    hasFilters: s.hasFilters,
    onClearAll: handleClearFilters,
  };

  // Pagination
  const handlePageChange = (newPage) => {
    s.setPage(newPage);
  };

  const handleLimitChange = (newLimit) => {
    s.setLimit(Number(newLimit));
    s.setPage(1);
  };

  // Refresh
  const handleRefresh = () => {
    s.fetchStaff({
      page: s.page,
      limit: s.limit,
      search: s.search.trim(),
      employment_type: s.employmentType,
    });
  };

  return (
    <div className="space-y-4">

      {/* Header */}
      <StaffHeader
        onAddStaff={s.openCreateModal}
        staffCount={s.pagination?.total ?? s.staff.length}
      />

      {/* Statistics */}
      <StaffStats
        stats={s.stats}
        users={u.users}
        roles={u.roles}
      />

      {/* Filters */}
      <FilterBar {...filterConfig} />

      {/* Staff Table */}
      <StaffTableSection
        staff={s.staff}
        loading={s.loading}
        error={s.error}
        pagination={s.pagination ?? {}}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        onClearFilters={handleClearFilters}
        onRefresh={handleRefresh}
        onView={s.setViewStaff}
        onEdit={s.openEditModal}
        onDelete={s.handleDeleteStaff}
      />

      {/* Create / Edit Modal */}
      <StaffModal
        open={s.isModalOpen}
        staff={s.selectedStaff}
        users={u.users || []}
        saving={s.saving}
        onClose={s.closeModal}
        onSave={s.handleSaveStaff}
      />

      {/* View Modal */}
      <StaffViewModal
        staff={s.viewStaff}
        onClose={s.closeViewModal}
      />

    </div>
  );
}
