
import Table from "../../utils/table/Table.util";
import FilterBar from "../../utils/filter/FilterBar.util";
import StudentEnrollmentTableColumns from "./StudentEnrollmentTableColumns";

const getClassTitle = (classes, selectedClassTab) => {
  const selectedClass = classes.find(
    (item) => String(item.id) === selectedClassTab
  );

  const name = selectedClass?.name;

  const formattedName = name
    ? name.charAt(0).toUpperCase() + name.slice(1)
    : "Class";

  return `${formattedName} - Active Enrollments`;
};

export default function EnrollmentTableSection({
  enrollment,
  limitOptions,
}) {
  const filterConfig = {
    picker: {
      label: "Quick Enrollment Lookup",
      searchTerm: enrollment.searchTerm,
      onSearchChange: enrollment.handleSearchChange,
      onClearSearch: enrollment.handleClearSearch,
      placeholder: "Search by student name...",
      isOpen: false,
      setIsOpen: () => {},
      items: enrollment.enrollments,
      onSelectItem: (item) => enrollment.openViewModal(item),
      emptyMessage: "No matching enrollments found.",

      itemRenderer: (item) => (
        <>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-teal-700">
              {item.student_name?.[0]?.toUpperCase() || "S"}
            </div>

            <div>
              <p className="text-xs font-bold text-slate-800">
                {item.student_name || "Unknown Student"}
              </p>

              <p className="text-xs font-bold text-slate-800">
                {item.roll_number || "Unknown Roll Number"}
              </p>

              <p className="text-[11px] text-slate-500">
                Class: {item.class_name || "—"}
              </p>

              <p className="text-[11px] text-slate-500">
                Session: {item.academic_session || "—"}
              </p>
            </div>
          </div>

          <span className="text-xs text-slate-400">
            ID: {item.id}
          </span>
        </>
      ),
    },

    hasFilters: Boolean(enrollment.searchTerm),
    onClearAll: enrollment.handleClearFilters,
  };

  const title =
    enrollment.selectedClassTab === "all"
      ? "All Enrollments"
      : getClassTitle(
          enrollment.classes,
          enrollment.selectedClassTab
        );

  return (
    <>
      <FilterBar {...filterConfig} />

      <Table
        title={title}
        columns={StudentEnrollmentTableColumns()}
        data={enrollment.enrollments}
        keyField="id"
        loading={enrollment.loading}
        getRowActions={enrollment.getRowActions}
        pagination={{
          page: enrollment.pagination.current_page,
          limit: enrollment.pagination.per_page,
          total: enrollment.pagination.total,
          last_page: enrollment.pagination.last_page,
        }}
        onPageChange={enrollment.setCurrentPage}
        onLimitChange={enrollment.handleLimitChange}
        limitOptions={limitOptions}
      />
    </>
  );
}
