import FilterBar from "../../utils/filter/FilterBar.util";
import Table from "../../utils/table/Table.util";

import StudentAttendanceHeader from "../../components/StudentAttendance/StudentAttendanceHeader";
import StudentAttendanceStats from "../../components/StudentAttendance/StudentAttendanceStats";
import StudentAttendanceTableColumns from "../../components/StudentAttendance/StudentAttendanceTableColumns";
import StudentAttendanceDateTabs from "../../components/StudentAttendance/StudentAttendanceDateTabs";
import StudentAttendanceSearchItem from "../../components/StudentAttendance/StudentAttendanceSearchItem";
import StudentAttendanceMonthFilter from "../../components/StudentAttendance/StudentAttendanceMonthFilter";

import StudentAttendanceModal from "../../utils/modals/studentAttendance/StudentAttendanceModal";
import StudentAttendanceViewModal from "../../utils/modals/studentAttendance/StudentAttendanceViewModal";

import useStudentAttendance from "../../hook/StudentAttendance/useStudentAttendance";

export default function StudentAttendance() {
  const s = useStudentAttendance();

  // Filter Configuration
  const filterConfig = {
    picker: {
      label: "Search Student",
      searchTerm: s.searchTerm,
      onSearchChange: s.handleSearchChange,
      onClearSearch: s.handleClearSearch,
      placeholder: "Search student name...",
      isOpen: s.isDropdownOpen,
      setIsOpen: s.setIsDropdownOpen,
      items: s.filteredStudents || [],
      onSelectItem: s.handleSelectStudent,
      emptyMessage: "No matching students found.",

      itemRenderer: (student) => (
        <StudentAttendanceSearchItem student={student} />
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
      <StudentAttendanceHeader
        studentCount={
          s.stats.total || s.studentOptions?.length || 0
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
          <StudentAttendanceMonthFilter
            selectedMonth={s.selectedMonth}
            onMonthChange={s.handleMonthChange}
          />
        </div>

        <StudentAttendanceDateTabs
          selectedMonth={s.selectedMonth}
          attendanceDate={s.attendanceDate}
          onDateChange={s.handleDateChange}
        />
      </div>

      {/* Statistics */}
      <StudentAttendanceStats stats={s.stats} />

      {/* Search and Export */}
      <FilterBar {...filterConfig} />

      {/* Attendance Table */}
      <Table
        title="Student Attendance"
        columns={StudentAttendanceTableColumns()}
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
      <StudentAttendanceModal
        isOpen={s.isModalOpen}
        onClose={s.closeModal}
        attendanceData={s.selectedAttendance}
        onSubmit={s.handleSaveAttendance}
        studentOptions={s.studentOptions}
        saving={s.saving}
      />

      {/* View Modal */}
      <StudentAttendanceViewModal
        isOpen={s.isViewModalOpen}
        onClose={s.closeViewModal}
        attendance={s.viewAttendance}
      />

    </div>
  );
}