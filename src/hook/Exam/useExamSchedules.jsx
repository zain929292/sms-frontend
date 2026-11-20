
import { useCallback, useEffect, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import {
  getExamSchedules,
  createExamSchedule,
  updateExamSchedule,
  deleteExamSchedule,
} from "../../redux/api_data/examApi/examScheduleApi";

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

export default function useExamSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [stats, setStats] = useState({});

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Backend filters
  const [examId, setExamId] = useState("");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [examDate, setExamDate] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Create / Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // View modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewSchedule, setViewSchedule] = useState(null);

  // GET: Fetch exam schedules
  const fetchSchedules = useCallback(
    async (overrides = {}, showLoader = true) => {
      if (showLoader) setLoading(true);

      const params = {
        page: currentPage,
        limit: itemsPerPage,

        exam_id: examId || undefined,
        class_id: classId || undefined,
        subject_id: subjectId || undefined,
        exam_date_id: examDate || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,

        ...overrides,
      };

      try {
        const response = await getExamSchedules(params);
        const result = response?.data;
        const paginatedData = result?.data;

        setSchedules(
          Array.isArray(paginatedData?.data)
            ? paginatedData.data
            : Array.isArray(paginatedData)
              ? paginatedData
              : []
        );

        setPagination({
          current_page: paginatedData?.current_page ?? params.page,
          per_page: paginatedData?.per_page ?? params.limit,
          last_page: paginatedData?.last_page ?? 1,
          total: paginatedData?.total ?? 0,
        });

        setStats(result?.stats ?? {});

        return result;
      } catch (error) {
        toast.error(
          getErrorMessage(error, "Failed to fetch exam schedules.")
        );

        setSchedules([]);

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
      examId,
      classId,
      subjectId,
      examDate,
      dateFrom,
      dateTo,
    ]
  );

  // Fetch when filters or pagination change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSchedules();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchSchedules]);

  // Set examination ID from URL
  const handleExamChange = useCallback((value) => {
    setExamId(String(value || ""));
    setCurrentPage(1);
  }, []);

  // Open create modal with selected class and exam date
  const openCreateModal = useCallback(
    (defaultValues = {}) => {
      setSelectedSchedule({
        exam_id: String(defaultValues.exam_id || examId || ""),
        class_id: String(defaultValues.class_id || ""),
        exam_date_id: String(defaultValues.exam_date_id || ""),
      });

      setIsModalOpen(true);
    },
    [examId]
  );

  // Open edit modal
  const openEditModal = useCallback((schedule) => {
    setSelectedSchedule(schedule);
    setIsModalOpen(true);
  }, []);

  // Close create / edit modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedSchedule(null);
  }, []);

  // Open view modal
  const openViewModal = useCallback((schedule) => {
    setViewSchedule(schedule);
    setIsViewModalOpen(true);
  }, []);

  // Close view modal
  const closeViewModal = useCallback(() => {
    setViewSchedule(null);
    setIsViewModalOpen(false);
  }, []);

  // POST / PUT: Create or update schedule
  const handleSaveSchedule = useCallback(
    async (formData) => {
      const selectedExamId = formData.exam_id || examId;

      if (!selectedExamId) {
        toast.error("Examination ID is missing.");
        return false;
      }

      if (!formData.class_id) {
        toast.error("Class ID is missing.");
        return false;
      }

      if (!formData.exam_date_id) {
        toast.error("Exam date ID is missing.");
        return false;
      }

      if (!formData.subject_id) {
        toast.error("Please select a subject.");
        return false;
      }

      const totalMarks = Number(formData.total_marks);
      const passingMarks = Number(formData.passing_marks);

      if (!Number.isFinite(totalMarks) || totalMarks <= 0) {
        toast.error("Total marks must be greater than zero.");
        return false;
      }

      if (
        !Number.isFinite(passingMarks) ||
        passingMarks < 0 ||
        passingMarks > totalMarks
      ) {
        toast.error("Passing marks cannot exceed total marks.");
        return false;
      }

      const payload = {
        exam_id: Number(selectedExamId),
        class_id: Number(formData.class_id),
        exam_date_id: Number(formData.exam_date_id),
        subject_id: Number(formData.subject_id),
        syllabus: String(formData.syllabus ?? "").trim() || null,
        total_marks: totalMarks,
        passing_marks: passingMarks,
      };

      setSaving(true);

      try {
        if (selectedSchedule?.id) {
          await updateExamSchedule(selectedSchedule.id, payload);

          toast.success("Exam schedule updated successfully.");
        } else {
          await createExamSchedule(payload);

          toast.success("Exam schedule created successfully.");
        }

        closeModal();

        setCurrentPage(1);

        await fetchSchedules({ page: 1 }, false);

        return true;
      } catch (error) {
        const validationErrors = getValidationErrors(error);

        if (validationErrors.length) {
          validationErrors.forEach((message) => toast.error(message));
        } else {
          toast.error(
            getErrorMessage(
              error,
              selectedSchedule?.id
                ? "Failed to update exam schedule."
                : "Failed to create exam schedule."
            )
          );
        }

        return false;
      } finally {
        setSaving(false);
      }
    },
    [
      examId,
      selectedSchedule,
      closeModal,
      fetchSchedules,
    ]
  );

  // DELETE: Delete schedule
  const handleDelete = useCallback(
    async (schedule) => {
      if (!schedule?.id) {
        toast.error("Exam schedule ID is missing.");
        return;
      }

      const confirmed = window.confirm(
        "Are you sure you want to delete this exam schedule?"
      );

      if (!confirmed) return;

      setDeleting(true);

      try {
        await deleteExamSchedule(schedule.id);

        toast.success("Exam schedule deleted successfully.");

        const nextPage =
          schedules.length === 1 && currentPage > 1
            ? currentPage - 1
            : currentPage;

        setCurrentPage(nextPage);

        await fetchSchedules({ page: nextPage }, false);
      } catch (error) {
        toast.error(
          getErrorMessage(error, "Failed to delete exam schedule.")
        );
      } finally {
        setDeleting(false);
      }
    },
    [schedules.length, currentPage, fetchSchedules]
  );

  // Filter handlers
  const handleClassChange = useCallback((value) => {
    setClassId(value);
    setCurrentPage(1);
  }, []);

  const handleSubjectChange = useCallback((value) => {
    setSubjectId(value);
    setCurrentPage(1);
  }, []);

  const handleExamDateChange = useCallback((value) => {
    setExamDate(value);
    setCurrentPage(1);
  }, []);

  const handleDateFromChange = useCallback((value) => {
    setDateFrom(value);
    setCurrentPage(1);
  }, []);

  const handleDateToChange = useCallback((value) => {
    setDateTo(value);
    setCurrentPage(1);
  }, []);

  // Clear optional filters, preserve examination ID
  const handleClearAllFilters = useCallback(() => {
    setClassId("");
    setSubjectId("");
    setExamDate("");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  }, []);

  const hasFilters = Boolean(
    classId || subjectId || examDate || dateFrom || dateTo
  );

  // Table actions
  const getRowActions = useCallback(
    (row) => [
      {
        label: "View Exam Schedule",
        icon: <Eye size={14} />,
        onClick: (selectedRow) =>
          openViewModal(selectedRow || row),
      },
      {
        label: "Edit Exam Schedule",
        icon: <Pencil size={14} />,
        onClick: (selectedRow) =>
          openEditModal(selectedRow || row),
      },
      {
        label: "Delete Exam Schedule",
        icon: <Trash2 size={14} />,
        variant: "danger",
        onClick: (selectedRow) =>
          handleDelete(selectedRow || row),
      },
    ],
    [openViewModal, openEditModal, handleDelete]
  );

  return {
    schedules,
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

    examId,
    classId,
    subjectId,
    examDate,
    dateFrom,
    dateTo,

    handleExamChange,
    handleClassChange,
    handleSubjectChange,
    handleExamDateChange,
    handleDateFromChange,
    handleDateToChange,
    handleClearAllFilters,
    hasFilters,

    isModalOpen,
    selectedSchedule,
    openCreateModal,
    openEditModal,
    closeModal,

    isViewModalOpen,
    viewSchedule,
    openViewModal,
    closeViewModal,

    handleSaveSchedule,
    handleDelete,
    getRowActions,
    fetchSchedules,
  };
}
