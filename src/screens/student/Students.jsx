import { Plus } from "lucide-react";

import Table from "../../utils/table/Table.util";
import StudentModal from "../../utils/modals/students/StudentModal";
import FilterBar from "../../utils/filter/FilterBar.util";
import StudentStats from "../../components/Students/StudentStats";
import StudentTableColumns from "../../components/Students/StudentTableColumns";
import useStudents from "../../hook/useStudents";
import { STUDENT_LIMIT_OPTIONS } from "../../redux/api_data/studentData/students.data";
import StudentViewModal from "../../utils/modals/students/StudentViewModal";

export default function Students() {
  const s = useStudents();

  const filterConfig = {
    picker: {
      label: "Quick Student Lookup",
      searchTerm: s.searchTerm,
      onSearchChange: s.handleSearchChange,
      onClearSearch: s.handleClearSearch,
      placeholder: "Search by student name, admission number, city...",
      isOpen: s.isDropdownOpen,
      setIsOpen: s.setIsDropdownOpen,
      items: s.filteredStudents,
      onSelectItem: s.handleSelectStudent,
      emptyMessage: "No matching students found.",
      itemRenderer: (student) => (
        <>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-700">
              {student.name?.[0]?.toUpperCase() || "S"}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">{student.name}</p>
              <p className="text-[11px] text-slate-500">Admission: {student.admission_number || "N/A"}</p>
            </div>
          </div>
          <span className="text-xs text-slate-400">ID: {student.id}</span>
        </>
      ),
    },
    exportConfig: {
      onClick: s.handleExport,
      count: s.displayedStudents.length,
      label: "Export",
      showCount: true,
    },
    hasFilters: s.hasFilters,
    onClearAll: s.handleClearAllFilters,
  };

  return (
    <div className="space-y-4">
      <StudentStats total={s.displayedStudents.length} active={s.activeCount} inactive={s.inactiveCount} />
      <FilterBar {...filterConfig} />
      <Table
        title="Student Management"
        actionButton={
          <button type="button" onClick={s.openCreateModal} className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[var(--secondary)] active:scale-95">
            <Plus size={18} />
            Add Student
          </button>
        }
        columns={StudentTableColumns()}
        data={s.paginatedStudents}
        keyField="id"
        loading={false}
        getRowActions={s.getRowActions}
        pagination={{ page: s.currentPage, limit: s.itemsPerPage, total: s.displayedStudents.length, last_page: s.totalPages }}
        onPageChange={s.setCurrentPage}
        onLimitChange={(limit) => { s.setItemsPerPage(limit); s.setCurrentPage(1); }}
        limitOptions={STUDENT_LIMIT_OPTIONS}
      />
  
      <StudentModal 
        isOpen={s.isModalOpen} 
        onClose={s.closeModal} 
        studentData={s.selectedStudent} 
        onSubmit={s.handleSaveStudent} 
        />
      <StudentViewModal
        isOpen={s.isViewModalOpen}
        onClose={s.closeViewModal}
        student={s.viewStudent}
      />

    </div>
  );
}
