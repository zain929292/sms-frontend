
import { useCallback, useEffect, useState } from "react";
import {
  Eye,
  Pencil,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";

import leaveRequestApi from "../../redux/api_data/leaveRequestApi/leaveRequestApi";
import { getUsers } from "../../redux/api_data/userApi/userApi";

// Initial month format: YYYY-MM
const getCurrentMonth = () => {
  const today = new Date();

  return `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}`;
};

// Empty pagination
const EMPTY_PAGINATION = {
  current_page: 1,
  per_page: 10,
  last_page: 1,
  total: 0,
};

// Error message
const getErrorMessage = (error, fallback) =>
  error.response?.data?.message ||
  error.message ||
  fallback;

// Validation errors
const getValidationErrors = (error) => {
  const errors = error.response?.data?.errors;

  return errors
    ? Object.values(errors).flat().filter(Boolean)
    : [];
};

export default function useLeaveRequest({
  canApprove = false,
} = {}) {
  // Leave request states
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [approving, setApproving] = useState(false);

  // User dropdown states
  const [userOptions, setUserOptions] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Applicant dropdown states
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedLeaveRequestApplicant, setSelectedLeaveRequestApplicant] =
    useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("");

  // Month and date filters
  const [selectedMonth, setSelectedMonth] = useState(
    getCurrentMonth
  );
  const [selectedDate, setSelectedDate] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [pagination, setPagination] = useState({
    ...EMPTY_PAGINATION,
  });

  // Create / Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeaveRequest, setSelectedLeaveRequest] =
    useState(null);

  // View modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewLeaveRequest, setViewLeaveRequest] = useState(null);

  // Approval modal
  const [isApprovalModalOpen, setIsApprovalModalOpen] =
    useState(false);
  const [selectedApprovalRequest, setSelectedApprovalRequest] =
    useState(null);

  // GET: Fetch leave requests from backend
  const fetchLeaveRequests = useCallback(
    async (userName = "") => {
      setLoading(true);

      try {
        const [year, month] = selectedMonth
          ? selectedMonth.split("-")
          : ["", ""];

        const response =
          await leaveRequestApi.getLeaveRequests({
            page: currentPage,
            limit: itemsPerPage,
            user_name: String(userName ?? "").trim(),
            status: statusFilter,
            leave_type: leaveTypeFilter,
            date: selectedDate,
            month: month ? Number(month) : "",
            year: year ? Number(year) : "",
          });

        const result = response.data;

        setLeaveRequests(
          Array.isArray(result.data) ? result.data : []
        );

        setStats(result.stats || {});

        setPagination({
          current_page: result.pagination?.current_page || 1,
          per_page: result.pagination?.per_page || itemsPerPage,
          last_page: result.pagination?.last_page || 1,
          total: result.pagination?.total || 0,
        });

        return result;
      } catch (error) {
        console.error(
          "Failed to fetch leave requests:",
          error
        );

        toast.error(
          getErrorMessage(
            error,
            "Failed to fetch leave requests."
          )
        );

        setLeaveRequests([]);
        setStats({});

        setPagination({
          ...EMPTY_PAGINATION,
          current_page: currentPage,
          per_page: itemsPerPage,
        });

        return null;
      } finally {
        setLoading(false);
      }
    },
    [
      currentPage,
      itemsPerPage,
      statusFilter,
      leaveTypeFilter,
      selectedMonth,
      selectedDate,
    ]
  );

  // GET: Fetch users for create / edit modal
  const fetchUserOptions = useCallback(async () => {
    setUsersLoading(true);

    try {
      const response = await getUsers({ limit: 70 });

      const users = response.data?.data || [];

      const options = users.map((user) => ({
        value: user.id,
        label: String(user.name ?? ""),
        role: user.role_name,
      }));

      setUserOptions(options);
    } catch (error) {
      console.error(
        "Failed to fetch user options:",
        error
      );

      toast.error(
        getErrorMessage(
          error,
          "Failed to fetch users."
        )
      );

      setUserOptions([]);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // Local filtering for applicant dropdown
  const filteredLeaveRequests = leaveRequests.filter(
    (request) =>
      String(request.user_name ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  // Select applicant from dropdown
  const handleSelectLeaveRequest = useCallback(
    (request) => {
      setSelectedLeaveRequestApplicant(request);

      setSearchTerm(
        String(request?.user_name ?? "")
      );

      setIsDropdownOpen(false);
      setCurrentPage(1);
    },
    []
  );

  // Search input
  const handleSearchChange = useCallback((event) => {
    const value = event?.target?.value ?? "";

    setSearchTerm(String(value));
    setSelectedLeaveRequestApplicant(null);
    setIsDropdownOpen(true);
    setCurrentPage(1);
  }, []);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    setSelectedLeaveRequestApplicant(null);
    setIsDropdownOpen(false);
    setCurrentPage(1);
  }, []);

  // Status filter
  const handleStatusChange = useCallback((value) => {
    setStatusFilter(String(value ?? ""));
    setCurrentPage(1);
  }, []);

  // Leave type filter
  const handleLeaveTypeChange = useCallback((value) => {
    setLeaveTypeFilter(String(value ?? ""));
    setCurrentPage(1);
  }, []);

  // Daily date filter
  const handleDateChange = useCallback((value) => {
    setSelectedDate(String(value ?? ""));
    setCurrentPage(1);
  }, []);

  // Month filter
  const handleMonthChange = useCallback((value) => {
    setSelectedMonth(String(value ?? ""));
    setSelectedDate("");
    setCurrentPage(1);
  }, []);

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedLeaveRequestApplicant(null);
    setStatusFilter("");
    setLeaveTypeFilter("");
    setSelectedDate("");
    setSelectedMonth(getCurrentMonth());
    setCurrentPage(1);
  }, []);

  // Clear all filters
  const handleClearAllFilters = useCallback(() => {
    handleClearFilters();
    setIsDropdownOpen(false);
  }, [handleClearFilters]);

  // Pagination limit
  const handleLimitChange = useCallback((value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  }, []);

  // Create leave request modal
  const openCreateModal = useCallback(() => {
    setSelectedLeaveRequest(null);
    setIsModalOpen(true);
  }, []);

  // Edit leave request modal
  const openEditModal = useCallback((record) => {
    setSelectedLeaveRequest(record);
    setIsModalOpen(true);
  }, []);

  // Close create / edit modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedLeaveRequest(null);
  }, []);

  // View leave request modal
  const openViewModal = useCallback((record) => {
    setViewLeaveRequest(record);
    setIsViewModalOpen(true);
  }, []);

  // Close view modal
  const closeViewModal = useCallback(() => {
    setViewLeaveRequest(null);
    setIsViewModalOpen(false);
  }, []);

  // Open approval modal
  const openApprovalModal = useCallback(
    (record) => {
      if (!canApprove) {
        toast.error(
          "You are not allowed to approve leave requests."
        );
        return;
      }

      if (record?.status !== "pending") {
        toast.error(
          "Only pending requests can be approved."
        );
        return;
      }

      setSelectedApprovalRequest(record);
      setIsApprovalModalOpen(true);
    },
    [canApprove]
  );

  // Close approval modal
  const closeApprovalModal = useCallback(() => {
    setIsApprovalModalOpen(false);
    setSelectedApprovalRequest(null);
  }, []);

  // POST / PUT: Create or update leave request
  const handleSaveLeaveRequest = useCallback(
    async (data) => {
      setSaving(true);

      try {
        if (selectedLeaveRequest?.id) {
          await leaveRequestApi.updateLeaveRequest(
            selectedLeaveRequest.id,
            data
          );

          toast.success(
            "Leave request updated successfully."
          );
        } else {
          await leaveRequestApi.createLeaveRequest(data);

          toast.success(
            "Leave request created successfully."
          );
        }

        closeModal();

        await fetchLeaveRequests(searchTerm.trim());

        return true;
      } catch (error) {
        console.error(
          "Failed to save leave request:",
          error
        );

        const validationErrors = getValidationErrors(error);

        if (validationErrors.length) {
          validationErrors.forEach((message) => {
            toast.error(message);
          });
        } else {
          toast.error(
            getErrorMessage(
              error,
              selectedLeaveRequest
                ? "Failed to update leave request."
                : "Failed to create leave request."
            )
          );
        }

        return false;
      } finally {
        setSaving(false);
      }
    },
    [
      selectedLeaveRequest,
      closeModal,
      fetchLeaveRequests,
      searchTerm,
    ]
  );

  // DELETE: Delete leave request
  const handleDeleteLeaveRequest = useCallback(
    async (id) => {
      if (!id) {
        toast.error("Leave request ID is missing.");
        return false;
      }

      const confirmed = window.confirm(
        "Are you sure you want to delete this leave request?"
      );

      if (!confirmed) return false;

      setDeleting(true);

      try {
        await leaveRequestApi.deleteLeaveRequest(id);

        toast.success(
          "Leave request deleted successfully."
        );

        await fetchLeaveRequests(searchTerm.trim());

        return true;
      } catch (error) {
        console.error(
          "Failed to delete leave request:",
          error
        );

        toast.error(
          getErrorMessage(
            error,
            "Failed to delete leave request."
          )
        );

        return false;
      } finally {
        setDeleting(false);
      }
    },
    [fetchLeaveRequests, searchTerm]
  );

  // PUT: Approve / Reject leave request
  const handleApproval = useCallback(
    async (data) => {
      if (!canApprove) {
        toast.error(
          "You are not allowed to approve leave requests."
        );
        return false;
      }

      if (!selectedApprovalRequest?.id) {
        toast.error("Leave request ID is missing.");
        return false;
      }

      if (selectedApprovalRequest.status !== "pending") {
        toast.error(
          "This leave request is no longer pending."
        );
        return false;
      }

      setApproving(true);

      try {
        await leaveRequestApi.approveLeaveRequest(
          selectedApprovalRequest.id,
          data
        );

        toast.success(
          data.status === "approved"
            ? "Leave request approved successfully."
            : "Leave request rejected successfully."
        );

        closeApprovalModal();

        await fetchLeaveRequests(searchTerm.trim());

        return true;
      } catch (error) {
        console.error(
          "Failed to process leave approval:",
          error
        );

        const validationErrors = getValidationErrors(error);

        if (validationErrors.length) {
          validationErrors.forEach((message) => {
            toast.error(message);
          });
        } else {
          toast.error(
            getErrorMessage(
              error,
              "Failed to process leave request."
            )
          );
        }

        return false;
      } finally {
        setApproving(false);
      }
    },
    [
      canApprove,
      selectedApprovalRequest,
      closeApprovalModal,
      fetchLeaveRequests,
      searchTerm,
    ]
  );

  // Table row actions
  const getRowActions = useCallback(
    (row) => {
      const actions = [
        {
          label: "View Leave Request",
          icon: <Eye size={14} />,
          onClick: (selectedRow) =>
            openViewModal(selectedRow || row),
        },
      ];

      if (row.status === "pending") {
        actions.push(
          {
            label: "Edit Leave Request",
            icon: <Pencil size={14} />,
            onClick: (selectedRow) =>
              openEditModal(selectedRow || row),
          },
          {
            label: "Delete Leave Request",
            icon: <Trash2 size={14} />,
            variant: "danger",
            onClick: (selectedRow) =>
              handleDeleteLeaveRequest(
                (selectedRow || row).id
              ),
          }
        );

        if (canApprove) {
          actions.push({
            label: "Approve / Reject",
            icon: <CheckCircle size={14} />,
            onClick: (selectedRow) =>
              openApprovalModal(selectedRow || row),
          });
        }
      }

      return actions;
    },
    [
      canApprove,
      openViewModal,
      openEditModal,
      handleDeleteLeaveRequest,
      openApprovalModal,
    ]
  );

  // Export leave requests
  const handleExport = useCallback(() => {
    if (!leaveRequests.length) {
      toast.error("No leave requests to export.");
      return;
    }

    try {
      const headers = [
        "ID",
        "User ID",
        "User Name",
        "Leave Type",
        "Start Date",
        "End Date",
        "Total Days",
        "Reason",
        "Status",
        "Approved By",
        "Approved At",
        "Approval Remarks",
      ];

      const rows = leaveRequests.map((item) => [
        item.id,
        item.user_id,
        item.user_name,
        item.leave_type,
        item.start_date,
        item.end_date,
        item.total_days,
        item.reason,
        item.status,
        item.approved_by_name,
        item.approved_at,
        item.approval_remarks,
      ]);

      const csv = [headers, ...rows]
        .map((row) =>
          row
            .map(
              (value) =>
                `"${String(value ?? "").replace(/"/g, '""')}"`
            )
            .join(",")
        )
        .join("\n");

      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "leave-requests.csv";
      link.click();

      URL.revokeObjectURL(url);

      toast.success(
        `Exported ${leaveRequests.length} leave requests.`
      );
    } catch (error) {
      console.error(
        "Failed to export leave requests:",
        error
      );

      toast.error("Failed to export leave requests.");
    }
  }, [leaveRequests]);

  // Derived data
  const displayedLeaveRequests = leaveRequests;
  const paginatedLeaveRequests = leaveRequests;

  const totalPages = Math.max(
    1,
    Number(pagination.last_page || 1)
  );

  // Month is default filter
  const hasFilters = Boolean(
    searchTerm ||
    statusFilter ||
    leaveTypeFilter ||
    selectedDate
  );

  // Debounced backend search and filters
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeaveRequests(searchTerm.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchLeaveRequests, searchTerm]);

  // Fetch users for modal
  useEffect(() => {
    fetchUserOptions();
  }, [fetchUserOptions]);

  return {
    // Leave requests
    leaveRequests,
    displayedLeaveRequests,
    paginatedLeaveRequests,
    stats,
    loading,
    saving,
    deleting,
    approving,

    // User dropdown
    userOptions,
    usersLoading,

    // Applicant dropdown
    isDropdownOpen,
    setIsDropdownOpen,
    selectedLeaveRequestApplicant,
    filteredLeaveRequests,
    handleSelectLeaveRequest,

    // Filters
    searchTerm,
    statusFilter,
    leaveTypeFilter,
    selectedMonth,
    selectedDate,
    hasFilters,
    handleSearchChange,
    handleClearSearch,
    handleStatusChange,
    handleLeaveTypeChange,
    handleMonthChange,
    handleDateChange,
    handleClearFilters,
    handleClearAllFilters,

    // Pagination
    pagination,
    currentPage,
    itemsPerPage,
    totalPages,
    setCurrentPage,
    setItemsPerPage,
    handleLimitChange,

    // Fetch and export
    fetchLeaveRequests,
    fetchUserOptions,
    handleExport,

    // Create / Edit modal
    isModalOpen,
    selectedLeaveRequest,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSaveLeaveRequest,

    // View modal
    isViewModalOpen,
    viewLeaveRequest,
    openViewModal,
    closeViewModal,

    // Approval modal
    isApprovalModalOpen,
    selectedApprovalRequest,
    openApprovalModal,
    closeApprovalModal,
    handleApproval,

    // Actions
    getRowActions,
  };
}
