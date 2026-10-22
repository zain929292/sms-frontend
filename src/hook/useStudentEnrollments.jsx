
import { useCallback, useEffect, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../redux/config/Api.redux";

const getList = (response) => {
  const payload = response?.data;

  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.enrollments)) return payload.enrollments;
  if (Array.isArray(payload)) return payload;

  return [];
};

const getEntity = (response) => {
  const payload = response?.data;
  return payload?.data?.enrollment ?? payload?.enrollment ??
    payload?.data ?? payload;
};

const getError = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

export default function useStudentEnrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewEnrollment, setViewEnrollment] = useState(null);

  const fetchEnrollments = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);

    try {
      const response = await api.get("/student-enrollment/details");
      setEnrollments(getList(response));
    } catch (error) {
      toast.error(getError(error, "Failed to fetch enrollments."));
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const term = searchTerm.trim().toLowerCase();

  const filteredEnrollments = enrollments.filter((item) =>
    [
      item.id,
      item.student_name,
      item.class_name,
      item.academic_session,
      item.enrollment_date,
      item.status,
      item.remarks,
    ].some((value) => String(value ?? "").toLowerCase().includes(term))
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEnrollments.length / itemsPerPage)
  );

  const paginatedEnrollments = filteredEnrollments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeCount = enrollments.filter(
    (item) => item.status === "active"
  ).length;

  const openCreateModal = useCallback(() => {
    setSelectedEnrollment(null);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((item) => {
    setSelectedEnrollment(item);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedEnrollment(null);
  }, []);

  const openViewModal = useCallback((item) => {
    setViewEnrollment(item);
    setIsViewModalOpen(true);
  }, []);

  const closeViewModal = useCallback(() => {
    setViewEnrollment(null);
    setIsViewModalOpen(false);
  }, []);

  const handleSaveEnrollment = useCallback(async (formData) => {
    setSaving(true);

    try {
      const payload = {
        student_id: Number(formData.student_id),
        class_id: Number(formData.class_id),
        academic_session_id: Number(formData.academic_session_id),
        enrollment_date: formData.enrollment_date || null,
        status: formData.status,
        remarks: String(formData.remarks ?? "").trim() || null,
      };

      if (selectedEnrollment?.id) {
        await api.put(
          `/student-enrollment/update/${selectedEnrollment.id}`,
          payload
        );
        toast.success("Enrollment updated successfully.");
      } else {
        await api.post("/student-enrollment/create", payload);
        toast.success("Student enrolled successfully.");
      }

      closeModal();
      setCurrentPage(1);
      await fetchEnrollments(false);
    } catch (error) {
      const errors = error.response?.data?.errors;

      if (errors) {
        Object.values(errors).flat().filter(Boolean).forEach((message) => {
          toast.error(message);
        });
      } else {
        toast.error(
          getError(error, "Failed to save student enrollment.")
        );
      }
    } finally {
      setSaving(false);
    }
  }, [selectedEnrollment, closeModal, fetchEnrollments]);

  const handleDelete = useCallback(async (item) => {
    if (!item?.id) return toast.error("Enrollment ID is missing.");

    if (!window.confirm(
      `Are you sure you want to delete the enrollment for ${item.student_name || "this student"}?`
    )) return;

    setDeleting(true);

    try {
      await api.delete(`/student-enrollment/delete/${item.id}`);
      toast.success("Enrollment deleted successfully.");
      await fetchEnrollments(false);
    } catch (error) {
      toast.error(getError(error, "Failed to delete enrollment."));
    } finally {
      setDeleting(false);
    }
  }, [fetchEnrollments]);

  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  }, []);

  const getRowActions = useCallback((row) => [
    {
      label: "View Enrollment",
      icon: <Eye size={14} />,
      onClick: (selectedRow) => openViewModal(selectedRow || row),
    },
    {
      label: "Edit Enrollment",
      icon: <Pencil size={14} />,
      onClick: (selectedRow) => openEditModal(selectedRow || row),
    },
    {
      label: "Delete Enrollment",
      icon: <Trash2 size={14} />,
      variant: "danger",
      onClick: (selectedRow) => handleDelete(selectedRow || row),
    },
  ], [openViewModal, openEditModal, handleDelete]);

  return {
    enrollments,
    loading,
    saving,
    deleting,
    searchTerm,
    filteredEnrollments,
    paginatedEnrollments,
    totalPages,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    activeCount,
    isModalOpen,
    selectedEnrollment,
    isViewModalOpen,
    viewEnrollment,
    openCreateModal,
    openEditModal,
    closeModal,
    openViewModal,
    closeViewModal,
    handleSaveEnrollment,
    handleDelete,
    handleSearchChange,
    getRowActions,
    fetchEnrollments,
  };
}
