
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import {
  getExams,
  createExam,
  updateExam,
  deleteExam,
} from "../../redux/api_data/examApi/examApi";

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

export default function useExam() {
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [stats, setStats] = useState({});

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Backend filters
  const [examName, setExamName] = useState("");
  const [examType, setExamType] = useState("");
  const [status, setStatus] = useState("");
  const [academicSessionId, setAcademicSessionId] = useState("");

  // Create / Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);

  // GET: Fetch exams
  const fetchExams = useCallback(
    async (overrides = {}, showLoader = true) => {
      if (showLoader) setLoading(true);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        name: examName.trim() || undefined,
        exam_type: examType || undefined,
        status: status || undefined,
        academic_session_id: academicSessionId || undefined,
        ...overrides,
      };

      try {
        const response = await getExams(params);
        const result = response?.data;

        setExams(
          Array.isArray(result?.data) ? result.data : []
        );

        setPagination(
          result?.pagination ?? {
            ...EMPTY_PAGINATION,
            current_page: params.page,
            per_page: params.limit,
          }
        );

        setStats(result?.stats ?? {});

        return result;
      } catch (error) {
        toast.error(
          getErrorMessage(error, "Failed to fetch examinations.")
        );

        setExams([]);
        setPagination({
          ...EMPTY_PAGINATION,
          current_page: params.page,
          per_page: params.limit,
        });
        setStats({});

        return null;
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    [
      currentPage,
      itemsPerPage,
      examName,
      examType,
      status,
      academicSessionId,
    ]
  );

  // Fetch when filters or pagination change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExams();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchExams]);

  // Create modal
  const openCreateModal = useCallback(() => {
    setSelectedExam(null);
    setIsModalOpen(true);
  }, []);

  // Edit modal
  const openEditModal = useCallback((exam) => {
    setSelectedExam(exam);
    setIsModalOpen(true);
  }, []);

  // Close modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedExam(null);
  }, []);

  // Navigate to Exam Details page
  const navigateToExamDetails = useCallback(
    (exam) => {
      if (!exam?.id) {
        toast.error("Examination ID is missing.");
        return;
      }

      navigate(`/academics/exam-details/${exam.id}`);
    },
    [navigate]
  );

  // POST / PUT: Create or update exam
  const handleSaveExam = useCallback(
    async (formData) => {
      if (!String(formData.name ?? "").trim()) {
        toast.error("Please enter the exam name.");
        return false;
      }

      if (!formData.exam_type) {
        toast.error("Please select an exam type.");
        return false;
      }

      if (!formData.scope) {
        toast.error("Please select an examination scope.");
        return false;
      }

      if (
        formData.scope === "selected_classes" &&
        (!Array.isArray(formData.class_ids) ||
          formData.class_ids.length === 0)
      ) {
        toast.error("Please select at least one class.");
        return false;
      }

      if (!formData.start_date || !formData.end_date) {
        toast.error("Please select the exam start and end dates.");
        return false;
      }

      if (formData.end_date < formData.start_date) {
        toast.error("End date cannot be earlier than start date.");
        return false;
      }

      const payload = {
        name: String(formData.name).trim(),
        exam_type: formData.exam_type,

        academic_session_id: formData.academic_session_id
          ? Number(formData.academic_session_id)
          : null,

        scope: formData.scope,

        class_ids:
          formData.scope === "selected_classes"
            ? formData.class_ids.map(Number)
            : [],

        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status,
        description:
          String(formData.description ?? "").trim() || null,
      };

      setSaving(true);

      try {
        if (selectedExam?.id) {
          await updateExam(selectedExam.id, payload);
          toast.success("Examination updated successfully.");
        } else {
          await createExam(payload);
          toast.success("Examination created successfully.");
        }

        closeModal();
        setCurrentPage(1);

        await fetchExams({ page: 1 }, false);

        return true;
      } catch (error) {
        const validationErrors = getValidationErrors(error);

        if (validationErrors.length) {
          validationErrors.forEach((message) =>
            toast.error(message)
          );
        } else {
          toast.error(
            getErrorMessage(
              error,
              selectedExam
                ? "Failed to update examination."
                : "Failed to create examination."
            )
          );
        }

        return false;
      } finally {
        setSaving(false);
      }
    },
    [selectedExam, closeModal, fetchExams]
  );

  // DELETE: Delete exam
  const handleDelete = useCallback(
    async (exam) => {
      if (!exam?.id) {
        toast.error("Examination ID is missing.");
        return;
      }

      const confirmed = window.confirm(
        `Are you sure you want to delete "${exam.name || "this examination"}"?`
      );

      if (!confirmed) return;

      setDeleting(true);

      try {
        await deleteExam(exam.id);

        toast.success("Examination deleted successfully.");

        const nextPage =
          exams.length === 1 && currentPage > 1
            ? currentPage - 1
            : currentPage;

        setCurrentPage(nextPage);

        await fetchExams({ page: nextPage }, false);
      } catch (error) {
        toast.error(
          getErrorMessage(error, "Failed to delete examination.")
        );
      } finally {
        setDeleting(false);
      }
    },
    [exams.length, currentPage, fetchExams]
  );

  // Filter handlers
  const handleExamNameChange = useCallback((event) => {
    setExamName(event.target.value);
    setCurrentPage(1);
  }, []);

  const handleExamTypeChange = useCallback((value) => {
    const nextValue =
      typeof value === "string" ? value : value.target.value;

    setExamType(nextValue);
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback((value) => {
    const nextValue =
      typeof value === "string" ? value : value.target.value;

    setStatus(nextValue);
    setCurrentPage(1);
  }, []);

  const handleAcademicSessionChange = useCallback((value) => {
    const nextValue =
      typeof value === "string" ? value : value.target.value;

    setAcademicSessionId(nextValue);
    setCurrentPage(1);
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setExamName("");
    setExamType("");
    setStatus("");
    setAcademicSessionId("");
    setCurrentPage(1);
  }, []);

  const hasFilters = Boolean(
    examName || examType || status || academicSessionId
  );

  // Table actions
  const getRowActions = useCallback(
    (row) => [
      {
        label: "View Examination",
        icon: <Eye size={14} />,
        onClick: (selectedRow) =>
          navigateToExamDetails(selectedRow || row),
      },
      {
        label: "Edit Examination",
        icon: <Pencil size={14} />,
        onClick: (selectedRow) =>
          openEditModal(selectedRow || row),
      },
      {
        label: "Delete Examination",
        icon: <Trash2 size={14} />,
        variant: "danger",
        onClick: (selectedRow) =>
          handleDelete(selectedRow || row),
      },
    ],
    [navigateToExamDetails, openEditModal, handleDelete]
  );

  return {
    exams,
    stats,
    pagination,

    loading,
    saving,
    deleting,

    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,

    totalPages: Math.max(
      1,
      Number(pagination.last_page || 1)
    ),

    examName,
    examType,
    status,
    academicSessionId,

    handleExamNameChange,
    handleExamTypeChange,
    handleStatusChange,
    handleAcademicSessionChange,
    handleClearAllFilters,
    hasFilters,

    isModalOpen,
    selectedExam,
    openCreateModal,
    openEditModal,
    closeModal,

    navigateToExamDetails,

    handleSaveExam,
    handleDelete,
    getRowActions,
    fetchExams,
  };
}
