import FilterBar from "../../utils/filter/FilterBar.util";
import Table from "../../utils/table/Table.util";

import LeaveRequestHeader from "../../components/LeaveRequest/LeaveRequestHeader";
import LeaveRequestStats from "../../components/LeaveRequest/LeaveRequestStats";
import LeaveRequestTableColumns from "../../components/LeaveRequest/LeaveRequestTableColumns";
import LeaveRequestDateTabs from "../../components/LeaveRequest/LeaveRequestDateTabs";
import LeaveRequestSearchItem from "../../components/LeaveRequest/LeaveRequestSearchItem";
import LeaveRequestMonthFilter from "../../components/LeaveRequest/LeaveRequestMonthFilter";

import LeaveRequestModal from "../../utils/modals/leaveRequest/LeaveRequestModal";
import LeaveApprovalModal from "../../utils/modals/leaveRequest/LeaveApprovalModal";
// import LeaveRequestViewModal from "../../utils/modals/leaveRequest/LeaveRequestViewModal";

import useLeaveRequest from "../../hook/LeaveRequest/useLeaveRequest";

export default function LeaveRequest() {
  const s = useLeaveRequest();

  // Filter Configuration
  const filterConfig = {
    picker: {
      label: "Search Applicant",
      searchTerm: s.searchTerm,
      onSearchChange: s.handleSearchChange,
      onClearSearch: s.handleClearSearch,
      placeholder: "Search applicant name...",
      isOpen: s.isDropdownOpen,
      setIsOpen: s.setIsDropdownOpen,
      items: s.filteredLeaveRequests || [],
      onSelectItem: s.handleSelectLeaveRequest,
      emptyMessage: "No matching leave requests found.",

      itemRenderer: (leaveRequest) => (
        <LeaveRequestSearchItem leaveRequest={leaveRequest} />
      ),
    },

    filters: [
      {
        label: "Status",
        value: s.statusFilter,
        onChange: s.handleStatusChange,
        options: [
          { label: "All Status", value: "" },
          { label: "Pending", value: "pending" },
          { label: "Approved", value: "approved" },
          { label: "Rejected", value: "rejected" },
        ],
      },
      {
        label: "Leave Type",
        value: s.leaveTypeFilter,
        onChange: s.handleLeaveTypeChange,
        options: [
          { label: "All Leave Types", value: "" },
          { label: "Casual", value: "casual" },
          { label: "Sick", value: "sick" },
          { label: "Annual", value: "annual" },
          { label: "Emergency", value: "emergency" },
          { label: "Other", value: "other" },
        ],
      },
    ],

    exportConfig: {
      onClick: s.handleExport,
      count: s.displayedLeaveRequests?.length || 0,
      label: "Export",
      showCount: true,
    },

    hasFilters: s.hasFilters,
    onClearAll: s.handleClearAllFilters,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <LeaveRequestHeader
        totalRequests={s.stats.total || 0}
        pendingRequests={s.stats.pending || 0}
        approvedRequests={s.stats.approved || 0}
        onAddLeaveRequest={s.openCreateModal}
      />

      {/* Month and Date Filters */}
      <div className="space-y-3">
        <div className="w-full sm:w-56">
          <LeaveRequestMonthFilter
            selectedMonth={s.selectedMonth}
            onMonthChange={s.handleMonthChange}
          />
        </div>

        <LeaveRequestDateTabs
          selectedMonth={s.selectedMonth}
          selectedDate={s.selectedDate}
          onDateChange={s.handleDateChange}
        />
      </div>

      {/* Statistics */}
      <LeaveRequestStats stats={s.stats} />

      {/* Search, Filters and Export */}
      <FilterBar {...filterConfig} />

      {/* Leave Request Table */}
      <Table
        title="Leave Requests"
        columns={LeaveRequestTableColumns()}
        data={s.paginatedLeaveRequests || []}
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
      <LeaveRequestModal
        isOpen={s.isModalOpen}
        onClose={s.closeModal}
        leaveRequestData={s.selectedLeaveRequest}
        onSubmit={s.handleSaveLeaveRequest}
        userOptions={s.userOptions || []}
        saving={s.saving}
      />

      {/* View Modal */}
      {/* <LeaveRequestViewModal
        isOpen={s.isViewModalOpen}
        onClose={s.closeViewModal}
        leaveRequest={s.viewLeaveRequest}
      /> */}

      {/* Approval Modal */}
      <LeaveApprovalModal
        isOpen={s.isApprovalModalOpen}
        onClose={s.closeApprovalModal}
        leaveRequest={s.selectedApprovalRequest}
        onSubmit={s.handleApproval}
        approving={s.approving}
      />
    </div>
  );
}