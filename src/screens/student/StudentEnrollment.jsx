
import { Plus } from "lucide-react";

import Table from "../../utils/table/Table.util";
import FilterBar from "../../utils/filter/FilterBar.util";

import StudentEnrollmentModal from "../../utils/modals/students/StudentEnrollmentModal";
import StudentEnrollmentViewModal from "../../utils/modals/students/StudentViewEnrollmentModal";

import useStudentEnrollments from "../../hook/useStudentEnrollments";
import StudentEnrollmentTableColumns from "../../components/StudentEnrollment/StudentEnrollmentTableColumns";

const ENROLLMENT_LIMIT_OPTIONS = [10, 25, 50, 100];

export default function StudentEnrollments() {
  const e = useStudentEnrollments();

  const filterConfig = {
    picker: {
      label: "Quick Enrollment Lookup",
      searchTerm: e.searchTerm,
      onSearchChange: e.handleSearchChange,
      onClearSearch: () => {
        e.handleSearchChange({ target: { value: "" } });
      },
      placeholder: "Search student, class, session...",
      isOpen: false,
      setIsOpen: () => {},
      items: e.filteredEnrollments,
      onSelectItem: (enrollment) => e.openViewModal(enrollment),
      emptyMessage: "No matching enrollments found.",
      itemRenderer: (enrollment) => (
        <>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-teal-700">
              {enrollment.student_name?.[0]?.toUpperCase() || "S"}
            </div>

            <div>
              <p className="text-xs font-bold text-slate-800">
                {enrollment.student_name || "Unknown Student"}
              </p>
              <p className="text-[11px] text-slate-500">
                Class: {enrollment.class_name || "—"}
              </p>
              <p className="text-[11px] text-slate-500">
                Session: {enrollment.academic_session || "—"}
              </p>
            </div>
          </div>

          <span className="text-xs text-slate-400">
            ID: {enrollment.id}
          </span>
        </>
      ),
    },

    hasFilters: Boolean(e.searchTerm),
    onClearAll: () => {
      e.handleSearchChange({ target: { value: "" } });
    },
  };

  return (
    <div className="space-y-5">
      {/* Enrollment Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--gray)] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Total Enrollments
            </p>
            <div className="rounded-xl bg-teal-50 p-2.5 text-[var(--primary)]">
              <Plus size={20} />
            </div>
          </div>
          <h3 className="mt-3 text-2xl font-bold text-slate-900">
            {e.enrollments.length}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            All recorded enrollments
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--gray)] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Active Enrollments
          </p>
          <h3 className="mt-3 text-2xl font-bold text-green-600">
            {e.activeCount}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Currently active records
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--gray)] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Promoted
          </p>
          <h3 className="mt-3 text-2xl font-bold text-blue-600">
            {e.enrollments.filter((item) => item.status === "promoted").length}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Previously promoted records
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--gray)] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Other Enrollments
          </p>
          <h3 className="mt-3 text-2xl font-bold text-slate-700">
            {e.enrollments.filter(
              (item) => ["completed", "withdrawn"].includes(item.status)
            ).length}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Completed or withdrawn
          </p>
        </div>
      </div>

      {/* Search */}
      <FilterBar {...filterConfig} />

      {/* Enrollment Table */}
      <Table
        title="Student Enrollment Management"
        actionButton={
          <button
            type="button"
            onClick={e.openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[var(--secondary)] active:scale-95"
          >
            <Plus size={18} />
            Enroll Student
          </button>
        }
        columns={StudentEnrollmentTableColumns()}
        data={e.paginatedEnrollments}
        keyField="id"
        loading={e.loading}
        getRowActions={e.getRowActions}
        pagination={{
          page: e.currentPage,
          limit: e.itemsPerPage,
          total: e.filteredEnrollments.length,
          last_page: e.totalPages,
        }}
        onPageChange={e.setCurrentPage}
        onLimitChange={(limit) => {
          e.setItemsPerPage(limit);
          e.setCurrentPage(1);
        }}
        limitOptions={ENROLLMENT_LIMIT_OPTIONS}
      />

      {/* Create / Edit Enrollment */}
      <StudentEnrollmentModal
        isOpen={e.isModalOpen}
        onClose={e.closeModal}
        enrollmentData={e.selectedEnrollment}
        onSubmit={e.handleSaveEnrollment}
        saving={e.saving}
      />

      {/* View Enrollment */}
      <StudentEnrollmentViewModal
        isOpen={e.isViewModalOpen}
        onClose={e.closeViewModal}
        enrollment={e.viewEnrollment}
      />
    </div>
  );
}
