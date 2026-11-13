
import FilterBar from "../../utils/filter/FilterBar.util";

import StudentAttendanceHeader from "../../components/StudentAttendance/StudentAttendanceHeader";
import StudentAttendanceStats from "../../components/StudentAttendance/StudentAttendanceStats";
import StudentAttendanceSearchItem from "../../components/StudentAttendance/StudentAttendanceSearchItem";
import StudentAttendanceMonthFilter from "../../components/StudentAttendance/StudentAttendanceMonthFilter";
import StudentAttendanceClassTabs from "../../components/StudentAttendance/StudentAttendanceClassTabs";
import StudentAttendanceTableSection from "../../components/StudentAttendance/StudentAttendanceTableSection";
import StudentAttendanceDateTabs from "../../components/StudentAttendance/StudentAttendanceDateTabs";

import StudentAttendanceModal from "../../utils/modals/studentAttendance/StudentAttendanceModal";

import useStudentAttendance from "../../hook/StudentAttendance/useStudentAttendance";

export default function StudentAttendance() {
  const s = useStudentAttendance();

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
        studentCount={s.activeCount || 0}
        attendanceDate={s.attendanceDate}
        onAddAttendance={s.openCreateModal}
      />

      {/* Statistics */}
      <StudentAttendanceStats stats={s.stats} />

      {/* Month and Date Filters */}
      <div className="space-y-3">
          <div className="w-full sm:w-56">
            <StudentAttendanceMonthFilter
              selectedMonth={s.selectedMonth}
              onMonthChange={s.handleMonthChange}
            />
          </div>

        {/* Date Tabs */}
        <StudentAttendanceDateTabs
          selectedMonth={s.selectedMonth}
          attendanceDate={s.attendanceDate}
          onDateChange={s.handleDateChange}
        />
      </div>

      {/* Search and Export */}
      <FilterBar {...filterConfig} />

      {/* Class Tabs */}
      <StudentAttendanceClassTabs
        classes={s.classes || []}
        selectedClassTab={s.selectedClassTab}
        activeCount={s.activeCount || 0}
        classTabCounts={s.classTabCounts || {}}
        onClassTabChange={s.handleClassTabChange}
      />

      {/* Attendance Register */}
      <StudentAttendanceTableSection s={s} />

      {/* Create / Edit Modal */}
      <StudentAttendanceModal
        isOpen={s.isModalOpen}
        onClose={s.closeModal}
        attendanceData={s.selectedAttendance}
        onSubmit={s.handleSaveAttendance}
        studentOptions={s.studentOptions}
        saving={s.saving}
      />
    </div>
  );
}
