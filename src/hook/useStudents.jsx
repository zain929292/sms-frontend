
import { useCallback, useEffect, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import Toast from "../utils/toast/toast.util";

import api from "../redux/config/Api.redux";
import { exportToExcel } from "../utils/export/Export.util";
import { STUDENT_EXPORT_COLUMNS } from "../redux/api_data/studentData/students.data";

const EMPTY_STATS = {
  total: 0,
  active: 0,
  inactive: 0,
};

const EMPTY_PAGINATION = {
  current_page: 1,
  per_page: 10,
  last_page: 1,
  total: 0,
};

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

const getValidationErrors = (error) => {
  const errors = error.response?.data?.errors;

  return errors
    ? Object.values(errors).flat().filter(Boolean)
    : [];
};

export default function useStudents() {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);

  const [viewStudent, setViewStudent] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // GET: Fetch students, backend filters, pagination and stats
  const fetchStudents = useCallback(
    async (params = {}, showLoader = true) => {
      if (showLoader) setLoading(true);

      try {
        const response = await api.get("/student/details", {
          params: {
            page: currentPage,
            limit: itemsPerPage,
            ...params,
          },
        });

        const result = response.data;

        setStudents(Array.isArray(result.data) ? result.data : []);

        setPagination(
          result.pagination ?? {
            ...EMPTY_PAGINATION,
            current_page: currentPage,
            per_page: itemsPerPage,
          }
        );

        setStats({
          total: Number(result.stats?.total ?? 0),
          active: Number(result.stats?.active ?? 0),
          inactive: Number(result.stats?.inactive ?? 0),
        });

        return result;
      } catch (error) {
        Toast.error(
          getErrorMessage(error, "Failed to fetch students.")
        );

        setStudents([]);
        setPagination({
          ...EMPTY_PAGINATION,
          current_page: currentPage,
          per_page: itemsPerPage,
        });
        setStats(EMPTY_STATS);

        return null;
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    [currentPage, itemsPerPage]
  );

  // Backend StudentFilter supports name, admission_number,
  // gender, city, state, status and religion.
  useEffect(() => {
    const timer = setTimeout(() => {
      const term = searchTerm.trim();

      fetchStudents(term ? { name: term } : {});
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchStudents, searchTerm]);

  // Data already comes filtered and paginated from Laravel.
  const filteredStudents = students;

  const displayedStudents = selectedStudentId
    ? students.filter(
        (student) =>
          String(student.id) === String(selectedStudentId)
      )
    : students;

  const paginatedStudents = students;

  const totalPages = Math.max(
    1,
    Number(pagination.last_page ?? 1)
  );

  // Modal handlers
  const openCreateModal = useCallback(() => {
    setSelectedStudent(null);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  }, []);

  const openViewModal = useCallback((student) => {
    setViewStudent(student);
    setIsViewModalOpen(true);
  }, []);

  const closeViewModal = useCallback(() => {
    setViewStudent(null);
    setIsViewModalOpen(false);
  }, []);

  // POST / PUT: Create or update student
  const handleSaveStudent = useCallback(
    async (formData) => {
      setSaving(true);

      try {
        const payload = {
          admission_number: String(
            formData.admission_number ?? ""
          ).trim(),
          name: String(formData.name ?? "").trim(),
          father_name: String(formData.father_name ?? "").trim(),
          phone: String(formData.phone ?? "").trim(),
          dob: formData.dob || null,
          gender: formData.gender || "male",
          religion: String(formData.religion ?? "Islam").trim(),
          address: String(formData.address ?? "").trim(),
          city: String(formData.city ?? "").trim(),
          state: String(formData.state ?? "").trim(),
          postal_code: String(formData.postal_code ?? "").trim(),
          admission_date: formData.admission_date || null,
          previous_school: String(
            formData.previous_school ?? ""
          ).trim(),
          previous_class: String(
            formData.previous_class ?? ""
          ).trim(),
          status: formData.status || "active",
          remarks: String(formData.remarks ?? "").trim(),
        };

        if (selectedStudent?.id) {
          await api.put(
            `/student/update/${selectedStudent.id}`,
            payload
          );
          Toast.success("Student updated successfully.");
        } else {
          await api.post("/student/create", payload);
          Toast.success("Student created successfully.");
        }

        closeModal();
        setSelectedStudentId(null);
        setSearchTerm("");
        setCurrentPage(1);

        // Refresh after a successful save.
        await fetchStudents(
          {
            page: 1,
            limit: itemsPerPage,
          },
          false
        );
      } catch (error) {
        const validationErrors = getValidationErrors(error);

        if (validationErrors.length) {
          validationErrors.forEach((message) =>
            Toast.error(message)
          );
        } else {
          Toast.error(
            getErrorMessage(
              error,
              selectedStudent
                ? "Failed to update student."
                : "Failed to create student."
            )
          );
        }
      } finally {
        setSaving(false);
      }
    },
    [selectedStudent, closeModal, fetchStudents, itemsPerPage]
  );

  // DELETE: Delete student
  const handleDelete = useCallback(
    async (student) => {
      if (!student?.id) {
        Toast.error("Student ID is missing.");
        return;
      }

      const confirmed = window.confirm(
        `Are you sure you want to delete ${
          student.name || "this student"
        }?`
      );

      if (!confirmed) return;

      setDeleting(true);

      try {
        await api.delete(`/student/delete/${student.id}`);

        Toast.success("Student deleted successfully.");

        setSelectedStudentId(null);
        setSearchTerm("");
        setCurrentPage(1);

        await fetchStudents(
          {
            page: 1,
            limit: itemsPerPage,
          },
          false
        );
      } catch (error) {
        Toast.error(
          getErrorMessage(error, "Failed to delete student.")
        );
      } finally {
        setDeleting(false);
      }
    },
    [fetchStudents, itemsPerPage]
  );

  // Search input
  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
    setSelectedStudentId(null);
    setIsDropdownOpen(true);
    setCurrentPage(1);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    setSelectedStudentId(null);
    setCurrentPage(1);
  }, []);

  const handleSelectStudent = useCallback((student) => {
    setSelectedStudentId(student.id);
    setSearchTerm(student.name || "");
    setIsDropdownOpen(false);
    setCurrentPage(1);
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedStudentId(null);
    setCurrentPage(1);
  }, []);

  // Export current displayed results
  const handleExport = useCallback(() => {
    if (!displayedStudents.length) {
      Toast.error("No students to export.");
      return;
    }

    exportToExcel(
      displayedStudents,
      "students_export",
      STUDENT_EXPORT_COLUMNS
    );

    Toast.success(
      `Exported ${displayedStudents.length} students.`
    );
  }, [displayedStudents]);

  // Table row actions
  const getRowActions = useCallback(
    (row) => [
      {
        label: "View Student",
        icon: <Eye size={14} />,
        onClick: (selectedRow) =>
          openViewModal(selectedRow || row),
      },
      {
        label: "Edit Student",
        icon: <Pencil size={14} />,
        onClick: (selectedRow) =>
          openEditModal(selectedRow || row),
      },
      {
        label: "Delete Student",
        icon: <Trash2 size={14} />,
        variant: "danger",
        onClick: (selectedRow) =>
          handleDelete(selectedRow || row),
      },
    ],
    [openViewModal, openEditModal, handleDelete]
  );

  return {
    students,
    stats,
    pagination,
    loading,
    saving,
    deleting,

    searchTerm,
    isDropdownOpen,
    setIsDropdownOpen,

    filteredStudents,
    displayedStudents,
    paginatedStudents,

    totalPages,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,

    activeCount: stats.active,
    inactiveCount: stats.inactive,

    isModalOpen,
    selectedStudent,
    viewStudent,
    isViewModalOpen,

    openViewModal,
    closeViewModal,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSaveStudent,
    handleDelete,

    handleSearchChange,
    handleClearSearch,
    handleSelectStudent,
    handleClearAllFilters,

    handleExport,
    getRowActions,
    fetchStudents,

    hasFilters: Boolean(searchTerm) || Boolean(selectedStudentId),
  };
}
