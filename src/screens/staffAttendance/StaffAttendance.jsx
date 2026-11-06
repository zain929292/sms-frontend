
import FilterBar from "../../utils/filter/FilterBar.util";
import Table from "../../utils/table/Table.util";

import StaffAttendanceHeader from "../../components/StaffAttendance/StaffAttendanceHeader";
import StaffAttendanceStats from "../../components/StaffAttendance/StaffAttendanceStats";
import StaffAttendanceTableColumns from "../../components/StaffAttendance/StaffAttendanceTableColumns";
import StaffAttendanceDateTabs from "../../components/StaffAttendance/StaffAttendanceDateTabs";
import StaffAttendanceSearchItem from "../../components/StaffAttendance/StaffAttendanceSearchItem";
import StaffAttendanceMonthFilter from "../../components/StaffAttendance/StaffAttendanceMonthFilter";

import StaffAttendanceModal from "../../utils/modals/staffAttendance/StaffAttendanceModal";
import StaffAttendanceViewModal from "../../utils/modals/staffAttendance/StaffAttendanceViewModal";

import useStaffAttendance from "../../hook/StaffAttendance/useStaffAttendance";

export default function StaffAttendance() {
  const s = useStaffAttendance();

  // Filter Configuration
  const filterConfig = {
    picker: {
      label: "Search Staff",
      searchTerm: s.searchTerm,
      onSearchChange: s.handleSearchChange,
      onClearSearch: s.handleClearSearch,
      placeholder: "Search staff name...",
      isOpen: s.isDropdownOpen,
      setIsOpen: s.setIsDropdownOpen,
      items: s.filteredStaff || [],
      onSelectItem: s.handleSelectStaff,
      emptyMessage: "No matching staff found.",

      itemRenderer: (staff) => (
        <StaffAttendanceSearchItem staff={staff} />
      ),
    },

    exportConfig: {
      onClick: s.handleExport,
      count: s.displayedAttendance?.length || 0,
      label: "Export",
      showCount: true,
    },

    hasFilters: s.hasFilters,
    onClearAll: s.handleClearAllFilters,
  };

  return (
    <div className="space-y-4">

      {/* Header */}
      <StaffAttendanceHeader
        staffCount={
          s.stats.total || s.staffOptions?.length || 0
        }
        attendanceDate={
          s.attendanceDate
            ? new Date(`${s.attendanceDate}T00:00:00`).toLocaleDateString(
                "en-US",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }
              )
            : "Select attendance date"
        }
        onAddAttendance={s.openCreateModal}
      />

      {/* Month and Date Filters */}
      <div className="space-y-3">
        <div className="w-full sm:w-56">
          <StaffAttendanceMonthFilter
            selectedMonth={s.selectedMonth}
            onMonthChange={s.handleMonthChange}
          />
        </div>

        <StaffAttendanceDateTabs
          selectedMonth={s.selectedMonth}
          attendanceDate={s.attendanceDate}
          onDateChange={s.handleDateChange}
        />
      </div>

      {/* Statistics */}
      <StaffAttendanceStats stats={s.stats} />

      {/* Search and Export */}
      <FilterBar {...filterConfig} />

      {/* Attendance Table */}
      <Table
        title="Staff Attendance"
        columns={StaffAttendanceTableColumns()}
        data={s.paginatedAttendance || []}
        keyField="id"
        loading={s.loading}
        getRowActions={s.getRowActions}
        pagination={{
          page: s.currentPage,
          limit: s.itemsPerPage,
          total: s.pagination.total,
          last_page: s.totalPages,
        }}
        onPageChange={s.setCurrentPage}
        onLimitChange={s.handleLimitChange}
        limitOptions={[10, 25, 50, 100]}
      />

      {/* Create / Edit Modal */}
      <StaffAttendanceModal
        isOpen={s.isModalOpen}
        onClose={s.closeModal}
        attendanceData={s.selectedAttendance}
        onSubmit={s.handleSaveAttendance}
        staffOptions={s.staffOptions}
        saving={s.saving}
      />

      {/* View Modal */}
      <StaffAttendanceViewModal
        isOpen={s.isViewModalOpen}
        onClose={s.closeViewModal}
        attendance={s.viewAttendance}
      />

    </div>
  );
}
