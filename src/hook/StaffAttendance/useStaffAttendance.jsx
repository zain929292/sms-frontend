
import { useCallback, useEffect, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

import staffAttendanceApi from "../../redux/api_data/staffAttendanceApi/staffAttendanceApi";
import { getUsers } from "../../redux/api_data/userApi/userApi";
import { getRoles } from "../../redux/api_data/roleApi/roleApi";

// Initial month format: YYYY-MM
const getCurrentMonth = () => {
  const today = new Date();

  return `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}`;
};

const EMPTY_PAGINATION = {
  current_page: 1,
  per_page: 10,
  last_page: 1,
  total: 0,
};

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message ||
  error.message ||
  fallback;

const getValidationErrors = (error) => {
  const errors = error.response?.data?.errors;

  return errors
    ? Object.values(errors).flat().filter(Boolean)
    : [];
};

export default function useStaffAttendance() {
  // Attendance states
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Staff dropdown states
  const [staffOptions, setStaffOptions] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [attendanceDate, setAttendanceDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [pagination, setPagination] = useState({
    ...EMPTY_PAGINATION,
  });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewAttendance, setViewAttendance] = useState(null);

  // GET: Fetch attendance from backend
  const fetchAttendance = useCallback(
    async (userName = "") => {
      setLoading(true);

      try {
        const [year, month] = selectedMonth
          ? selectedMonth.split("-")
          : ["", ""];

        const response = await staffAttendanceApi.getStaffAttendance({
          page: currentPage,
          limit: itemsPerPage,
          user_name: String(userName ?? "").trim(),
          status: statusFilter,
          attendance_date: attendanceDate,
          month: month ? Number(month) : "",
          year: year ? Number(year) : "",
        });

        const result = response.data;

        setAttendance(
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
        console.error("Failed to fetch staff attendance:", error);

        toast.error(
          getErrorMessage(
            error,
            "Failed to fetch staff attendance."
          )
        );

        setAttendance([]);
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
      attendanceDate,
      selectedMonth,
    ]
  );

  // GET: Fetch staff dropdown options
  const fetchStaffOptions = useCallback(async () => {
    setStaffLoading(true);

    try {
      const [usersResponse, rolesResponse] = await Promise.all([
        getUsers({ limit: 70 }),
        getRoles(),
      ]);

      const users = usersResponse.data?.data || [];
      const roles = rolesResponse.data?.data || [];

      const staffRoleNames = roles
        .filter(
          (role) =>
            String(role.name ?? "").toLowerCase() !== "admin"
        )
        .map((role) =>
          String(role.name ?? "").toLowerCase()
        );

      const options = users
        .filter((user) =>
          staffRoleNames.includes(
            String(user.role_name ?? "").toLowerCase()
          )
        )
        .map((user) => ({
          value: user.id,
          label: String(user.name ?? ""),
          role: user.role_name,
          details: user.user_details,
        }));

      setStaffOptions(options);
    } catch (error) {
      console.error("Failed to fetch staff options:", error);

      toast.error(
        getErrorMessage(
          error,
          "Failed to fetch staff options."
        )
      );

      setStaffOptions([]);
    } finally {
      setStaffLoading(false);
    }
  }, []);

  // Local filtering for staff dropdown suggestions
  const filteredStaff = staffOptions.filter((staff) =>
    String(staff.label ?? "")
      .toLowerCase()
      .includes(String(searchTerm ?? "").toLowerCase())
  );

  // Select staff from dropdown
  const handleSelectStaff = useCallback((staff) => {
    setSelectedStaff(staff);
    setSearchTerm(String(staff?.label ?? ""));
    setIsDropdownOpen(false);
    setCurrentPage(1);
  }, []);

  // Search input - same event pattern as useStudents
  const handleSearchChange = useCallback((event) => {
    const value = event?.target?.value ?? "";

    setSearchTerm(String(value));
    setSelectedStaff(null);
    setIsDropdownOpen(true);
    setCurrentPage(1);
  }, []);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    setSelectedStaff(null);
    setIsDropdownOpen(false);
    setCurrentPage(1);
  }, []);

  // Status filter
  const handleStatusChange = useCallback((value) => {
    setStatusFilter(String(value ?? ""));
    setCurrentPage(1);
  }, []);

  // Daily date filter
  const handleDateChange = useCallback((value) => {
    setAttendanceDate(String(value ?? ""));
    setCurrentPage(1);
  }, []);

  // Month filter
  const handleMonthChange = useCallback((value) => {
    setSelectedMonth(String(value ?? ""));
    setAttendanceDate("");
    setCurrentPage(1);
  }, []);

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedStaff(null);
    setStatusFilter("");
    setAttendanceDate("");
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

  // Create attendance modal
  const openCreateModal = useCallback(() => {
    setSelectedAttendance(null);
    setIsModalOpen(true);
  }, []);

  // Edit attendance modal
  const openEditModal = useCallback((record) => {
    setSelectedAttendance(record);
    setIsModalOpen(true);
  }, []);

  // Close attendance modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedAttendance(null);
  }, []);

  // View attendance modal
  const openViewModal = useCallback((record) => {
    setViewAttendance(record);
    setIsViewModalOpen(true);
  }, []);

  const closeViewModal = useCallback(() => {
    setViewAttendance(null);
    setIsViewModalOpen(false);
  }, []);

  // POST / PUT: Create or update attendance
  const handleSaveAttendance = useCallback(
    async (data) => {
      setSaving(true);

      try {
        if (selectedAttendance?.id) {
          await staffAttendanceApi.updateStaffAttendance(
            selectedAttendance.id,
            data
          );

          toast.success(
            "Staff attendance updated successfully."
          );
        } else {
          await staffAttendanceApi.createStaffAttendance(data);

          toast.success(
            "Staff attendance created successfully."
          );
        }

        closeModal();

        await fetchAttendance(searchTerm.trim());

        return true;
      } catch (error) {
        console.error("Failed to save staff attendance:", error);

        const validationErrors = getValidationErrors(error);

        if (validationErrors.length) {
          validationErrors.forEach((message) => {
            toast.error(message);
          });
        } else {
          toast.error(
            getErrorMessage(
              error,
              selectedAttendance
                ? "Failed to update staff attendance."
                : "Failed to create staff attendance."
            )
          );
        }

        return false;
      } finally {
        setSaving(false);
      }
    },
    [
      selectedAttendance,
      closeModal,
      fetchAttendance,
      searchTerm,
    ]
  );

  // DELETE: Delete attendance
  const handleDeleteAttendance = useCallback(
    async (id) => {
      if (!id) {
        toast.error("Attendance ID is missing.");
        return false;
      }

      const confirmed = window.confirm(
        "Are you sure you want to delete this attendance record?"
      );

      if (!confirmed) return false;

      setDeleting(true);

      try {
        await staffAttendanceApi.deleteStaffAttendance(id);

        toast.success(
          "Staff attendance deleted successfully."
        );

        await fetchAttendance(searchTerm.trim());

        return true;
      } catch (error) {
        console.error("Failed to delete staff attendance:", error);

        toast.error(
          getErrorMessage(
            error,
            "Failed to delete staff attendance."
          )
        );

        return false;
      } finally {
        setDeleting(false);
      }
    },
    [fetchAttendance, searchTerm]
  );

  // Table row actions
  const getRowActions = useCallback(
    (row) => [
      {
        label: "View Attendance",
        icon: <Eye size={14} />,
        onClick: (selectedRow) =>
          openViewModal(selectedRow || row),
      },
      {
        label: "Edit Attendance",
        icon: <Pencil size={14} />,
        onClick: (selectedRow) =>
          openEditModal(selectedRow || row),
      },
      {
        label: "Delete Attendance",
        icon: <Trash2 size={14} />,
        variant: "danger",
        onClick: (selectedRow) =>
          handleDeleteAttendance((selectedRow || row).id),
      },
    ],
    [
      openViewModal,
      openEditModal,
      handleDeleteAttendance,
    ]
  );

  // Export attendance
  const handleExport = useCallback(() => {
    if (!attendance.length) {
      toast.error("No attendance records to export.");
      return;
    }

    try {
      const headers = [
        "ID",
        "User ID",
        "User Name",
        "Attendance Date",
        "Check In",
        "Check Out",
        "Status",
        "Remarks",
      ];

      const rows = attendance.map((item) => [
        item.id,
        item.user_id,
        item.user_name,
        item.attendance_date,
        item.check_in,
        item.check_out,
        item.status,
        item.remarks,
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
      link.download = "staff-attendance.csv";
      link.click();

      URL.revokeObjectURL(url);

      toast.success(
        `Exported ${attendance.length} attendance records.`
      );
    } catch (error) {
      console.error("Failed to export attendance:", error);

      toast.error("Failed to export attendance.");
    }
  }, [attendance]);

  // Derived data
  const displayedAttendance = attendance;
  const paginatedAttendance = attendance;

  const totalPages = Math.max(
    1,
    Number(pagination.last_page || 1)
  );

  // Month is the default filter, so exclude it from hasFilters
  const hasFilters = Boolean(
    searchTerm || statusFilter || attendanceDate
  );

  // Debounced backend search and filter
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAttendance(searchTerm.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchAttendance, searchTerm]);

  // Fetch staff dropdown options
  useEffect(() => {
    fetchStaffOptions();
  }, [fetchStaffOptions]);

  return {
    // Attendance
    attendance,
    displayedAttendance,
    paginatedAttendance,
    stats,
    loading,
    saving,
    deleting,

    // Staff dropdown
    staffOptions,
    staffLoading,
    filteredStaff,
    isDropdownOpen,
    setIsDropdownOpen,
    selectedStaff,
    handleSelectStaff,

    // Filters
    searchTerm,
    statusFilter,
    attendanceDate,
    selectedMonth,
    hasFilters,
    handleSearchChange,
    handleClearSearch,
    handleStatusChange,
    handleDateChange,
    handleMonthChange,
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
    fetchAttendance,
    fetchStaffOptions,
    handleExport,

    // Modal
    isModalOpen,
    selectedAttendance,
    openCreateModal,
    openEditModal,
    closeModal,

    isViewModalOpen,
    viewAttendance,
    openViewModal,
    closeViewModal,

    // Actions
    handleSaveAttendance,
    handleDeleteAttendance,
    getRowActions,
  };
}
