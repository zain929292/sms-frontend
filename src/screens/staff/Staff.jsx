
import StaffModal from "../../utils/modals/staff/StaffModal";
import StaffViewModal from "../../utils/modals/staff/StaffViewModal";

import useStaff from "../../hook/Staff/useStaff";
import useUsers from "../../hook/Users/useUsers";

import StaffStats from "../../components/Staff/StaffStats";
import StaffHeader from "../../components/Staff/StaffHeader";
import StaffTableSection from "../../components/Staff/StaffTableSection";

export default function Staff() {
  const s = useStaff();
  const u = useUsers({limit:20});

  // Search
  const handleSearch = (value) => {
    s.setSearch(value);
    s.setPage(1);
  };

  // Clear filters
  const handleClearFilters = () => {
    s.setSearch("");
    s.setEmploymentType("");
    s.setPage(1);
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
      search: s.search,
      employment_type: s.employmentType,
    });
  };

  return (
    <div className="space-y-5">
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

      {/* Staff Table */}
      <StaffTableSection
        staff={s.staff}
        loading={s.loading}
        error={s.error}
        pagination={s.pagination ?? {}}

        searchValue={s.search}
        onSearch={handleSearch}

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
