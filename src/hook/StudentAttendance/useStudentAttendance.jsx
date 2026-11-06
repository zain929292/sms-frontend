import { useCallback, useEffect, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

import studentAttendanceApi from "../../redux/api_data/studentAttendanceApi/studentAttendanceApi";
import studentApi from "../../redux/api_data/studentApi/studentApi";

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

export default function useStudentAttendance() {
  // Attendance states
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Student dropdown states
  const [studentOptions, setStudentOptions] = useState([]);
  const [studentLoading, setStudentLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

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

  // GET: Fetch student attendance
  const fetchAttendance = useCallback(
    async (studentName = "") => {
      setLoading(true);

      try {
        const [year, month] = selectedMonth
          ? selectedMonth.split("-")
          : ["", ""];

        const response =
          await studentAttendanceApi.getStudentAttendance({
            page: currentPage,
            limit: itemsPerPage,
            student_name: String(studentName ?? "").trim(),
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
        console.error(
          "Failed to fetch student attendance:",
          error
        );

        toast.error(
          getErrorMessage(
            error,
            "Failed to fetch student attendance."
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

  // GET: Fetch student dropdown options
// GET: Fetch student dropdown options
const fetchStudentOptions = useCallback(async () => {
  setStudentLoading(true);

  try {
    const response = await studentApi.getStudents({
      limit: 100,
    });

    const students = response.data?.data || [];

    const options = students.map((student) => ({
      value: student.id,
      label: String(student.name ?? ""),
      admission_number: student.admission_number,
      details: student,
    }));

    setStudentOptions(options);
  } catch (error) {
    console.error(
      "Failed to fetch student options:",
      error
    );

    toast.error(
      getErrorMessage(
        error,
        "Failed to fetch student options."
      )
    );

    setStudentOptions([]);
  } finally {
    setStudentLoading(false);
  }
}, []);

  // Local filtering for student dropdown suggestions
  const filteredStudents = studentOptions.filter((student) =>
    String(student.label ?? "")
      .toLowerCase()
      .includes(String(searchTerm ?? "").toLowerCase())
  );

  // Select student from dropdown
  const handleSelectStudent = useCallback((student) => {
    setSelectedStudent(student);
    setSearchTerm(String(student?.label ?? ""));
    setIsDropdownOpen(false);
    setCurrentPage(1);
  }, []);

  // Search input
  const handleSearchChange = useCallback((event) => {
    const value = event?.target?.value ?? "";

    setSearchTerm(String(value));
    setSelectedStudent(null);
    setIsDropdownOpen(true);
    setCurrentPage(1);
  }, []);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    setSelectedStudent(null);
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
    setSelectedStudent(null);
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
          await studentAttendanceApi.updateStudentAttendance(
            selectedAttendance.id,
            data
          );

          toast.success(
            "Student attendance updated successfully."
          );
        } else {
          await studentAttendanceApi.createStudentAttendance(data);

          toast.success(
            "Student attendance created successfully."
          );
        }

        closeModal();

        await fetchAttendance(searchTerm.trim());

        return true;
      } catch (error) {
        console.error(
          "Failed to save student attendance:",
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
              selectedAttendance
                ? "Failed to update student attendance."
                : "Failed to create student attendance."
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
        await studentAttendanceApi.deleteStudentAttendance(id);

        toast.success(
          "Student attendance deleted successfully."
        );

        await fetchAttendance(searchTerm.trim());

        return true;
      } catch (error) {
        console.error(
          "Failed to delete student attendance:",
          error
        );

        toast.error(
          getErrorMessage(
            error,
            "Failed to delete student attendance."
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
        "Student ID",
        "Student Name",
        "Attendance Date",
        "Status",
        "Remarks",
      ];

      const rows = attendance.map((item) => [
        item.id,
        item.student_id,
        item.student_name,
        item.attendance_date,
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
      link.download = "student-attendance.csv";
      link.click();

      URL.revokeObjectURL(url);

      toast.success(
        `Exported ${attendance.length} attendance records.`
      );
    } catch (error) {
      console.error(
        "Failed to export student attendance:",
        error
      );

      toast.error("Failed to export student attendance.");
    }
  }, [attendance]);

  // Derived data
  const displayedAttendance = attendance;
  const paginatedAttendance = attendance;

  const totalPages = Math.max(
    1,
    Number(pagination.last_page || 1)
  );

  // Month is the default filter
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

  // Fetch student dropdown options
  useEffect(() => {
    fetchStudentOptions();
  }, [fetchStudentOptions]);

  return {
    // Attendance
    attendance,
    displayedAttendance,
    paginatedAttendance,
    stats,
    loading,
    saving,
    deleting,

    // Student dropdown
    studentOptions,
    studentLoading,
    filteredStudents,
    isDropdownOpen,
    setIsDropdownOpen,
    selectedStudent,
    handleSelectStudent,

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
    fetchStudentOptions,
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