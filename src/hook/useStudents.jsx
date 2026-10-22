
import { useCallback, useEffect, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

import api from "../redux/config/Api.redux";
import { exportToExcel } from "../utils/export/Export.util";
import { STUDENT_EXPORT_COLUMNS } from "../redux/api_data/studentData/students.data";

const getStudentList = (response) => {
  const payload = response?.data;

  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.students)) return payload.students;
  if (Array.isArray(payload)) return payload;

  return [];
};

const getStudentEntity = (response) => {
  const payload = response?.data;

  return (
    payload?.data?.student ??
    payload?.student ??
    payload?.data?.data ??
    payload?.data ??
    payload
  );
};

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

const getValidationErrors = (error) => {
  const errors = error.response?.data?.errors;

  if (!errors) return [];

  return Object.values(errors).flat().filter(Boolean);
};

export default function useStudents() {
  const [students, setStudents] = useState([]);
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

  // GET: Fetch students
  const fetchStudents = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);

    try {
      const response = await api.get("/student/details");
      setStudents(getStudentList(response));
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to fetch students."));
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Search and filtering
  const term = searchTerm.trim().toLowerCase();

  const filteredStudents = !term
    ? students
    : students.filter((student) =>
        [
          student.id,
          student.admission_number,
          student.name,
          student.gender,
          student.dob,
          student.religion,
          student.address,
          student.city,
          student.state,
          student.postal_code,
        ].some((value) =>
          String(value ?? "").toLowerCase().includes(term)
        )
      );

  const displayedStudents = selectedStudentId
    ? filteredStudents.filter(
        (student) => String(student.id) === String(selectedStudentId)
      )
    : filteredStudents;

  const totalPages = Math.max(
    1,
    Math.ceil(displayedStudents.length / itemsPerPage)
  );

  const paginatedStudents = displayedStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeCount = displayedStudents.filter(
    (student) => student.status === "active"
  ).length;

  const inactiveCount = displayedStudents.length - activeCount;

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
            admission_number: String(formData.admission_number ?? "").trim(),
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
            previous_school: String(formData.previous_school ?? "").trim(),
            previous_class: String(formData.previous_class ?? "").trim(),
            status: formData.status || "active",
            remarks: String(formData.remarks ?? "").trim(),
          };

        if (selectedStudent?.id) {
          await api.put(`/student/update/${selectedStudent.id}`, payload);
          toast.success("Student updated successfully.");
        } else {
          await api.post("/student/create", payload);
          toast.success("Student created successfully.");
        }

        closeModal();
        setCurrentPage(1);
        await fetchStudents(false);
      } catch (error) {
        const validationErrors = getValidationErrors(error);

        if (validationErrors.length) {
          validationErrors.forEach((message) => toast.error(message));
        } else {
          toast.error(
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
    [selectedStudent, closeModal, fetchStudents]
  );

  // DELETE: Delete student
  const handleDelete = useCallback(
    async (student) => {
      if (!student?.id) {
        toast.error("Student ID is missing.");
        return;
      }

      const confirmed = window.confirm(
        `Are you sure you want to delete ${student.name || "this student"}?`
      );

      if (!confirmed) return;

      setDeleting(true);

      try {
        await api.delete(`/student/delete/${student.id}`);

        setSelectedStudentId((current) =>
          String(current) === String(student.id) ? null : current
        );

        setSearchTerm((current) =>
          current === student.name ? "" : current
        );

        setCurrentPage(1);
        toast.success("Student deleted successfully.");

        await fetchStudents(false);
      } catch (error) {
        toast.error(
          getErrorMessage(error, "Failed to delete student.")
        );
      } finally {
        setDeleting(false);
      }
    },
    [fetchStudents]
  );

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

  const handleExport = useCallback(() => {
    if (!displayedStudents.length) {
      toast.error("No students to export.");
      return;
    }

    exportToExcel(
      displayedStudents,
      "students_export",
      STUDENT_EXPORT_COLUMNS
    );

    toast.success(`Exported ${displayedStudents.length} students.`);
  }, [displayedStudents]);

  const getRowActions = useCallback(
    (row) => [
      {
        label: "View Student",
        icon: <Eye size={14} />,
        onClick: (selectedRow) => openViewModal(selectedRow || row),
      },
      {
        label: "Edit Student",
        icon: <Pencil size={14} />,
        onClick: (selectedRow) => openEditModal(selectedRow || row),
      },
      {
        label: "Delete Student",
        icon: <Trash2 size={14} />,
        variant: "danger",
        onClick: (selectedRow) => handleDelete(selectedRow || row),
      },
    ],
    [openViewModal, openEditModal, handleDelete]
  );

  return {
    students,
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
    activeCount,
    inactiveCount,
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
