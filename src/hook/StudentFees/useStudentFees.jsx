
import { useCallback, useEffect, useState } from "react";
import { History, Eye, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import {
  getStudentFees,
  createStudentFee,
  updateStudentFee,
  deleteStudentFee,
} from "../../redux/api_data/studentFeeApi/studentFeeApi";

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

export default function useStudentFees() {
  const navigate = useNavigate();
  const [studentFees, setStudentFees] = useState([]);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [stats, setStats] = useState({});

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Backend filters
  const [studentName, setStudentName] = useState("");
  const [className, setClassName] = useState("");
  const [feeMonth, setFeeMonth] = useState("");
  const [status, setStatus] = useState("");

  // Create / Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);

  // View modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewFee, setViewFee] = useState(null);

  // GET: Fetch student fees
  const fetchStudentFees = useCallback(
    async (overrides = {}, showLoader = true) => {
      if (showLoader) setLoading(true);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        student_name: studentName.trim() || undefined,
        class_name: className.trim() || undefined,
        fee_month: feeMonth || undefined,
        status: status || undefined,
        ...overrides,
      };

      try {
        const response = await getStudentFees(params);
        const result = response?.data;

        setStudentFees(
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
          getErrorMessage(error, "Failed to fetch student fees.")
        );

        setStudentFees([]);
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
      studentName,
      className,
      feeMonth,
      status,
    ]
  );

  // Fetch when filters or pagination change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudentFees();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchStudentFees]);

  // Modal handlers
  const openCreateModal = useCallback(() => {
    setSelectedFee(null);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((fee) => {
    setSelectedFee(fee);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedFee(null);
  }, []);

  const openViewModal = useCallback((fee) => {
    setViewFee(fee);
    setIsViewModalOpen(true);
  }, []);

  const closeViewModal = useCallback(() => {
    setViewFee(null);
    setIsViewModalOpen(false);
  }, []);

  // POST / PUT: Create or update student fee
  const handleSaveStudentFee = useCallback(
    async (formData) => {
      const studentId = Number(
        formData.student_id ?? selectedFee?.student_id
      );

      if (!studentId) {
        toast.error("Please select a student.");
        return false;
      }

      if (!formData.fee_month) {
        toast.error("Please select a fee month.");
        return false;
      }

      if (!formData.payment_date) {
        toast.error("Please select a payment date.");
        return false;
      }

      // class_id is intentionally not sent.
      // Backend gets the student's latest enrollment and class.
      const payload = {
        student_id: studentId,
        fee_month: formData.fee_month,
        payment_date: formData.payment_date,
        discount: Number(formData.discount || 0),
        paid_amount: Number(formData.paid_amount || 0),
        remarks: String(formData.remarks ?? "").trim(),
      };

      setSaving(true);

      try {
        if (selectedFee?.id) {
          await updateStudentFee(selectedFee.id, payload);

          toast.success("Student fee updated successfully.");
        } else {
          await createStudentFee(payload);

          toast.success("Student fee created successfully.");
        }

        closeModal();
        setCurrentPage(1);

        await fetchStudentFees({ page: 1 }, false);

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
              selectedFee
                ? "Failed to update student fee."
                : "Failed to create student fee."
            )
          );
        }

        return false;
      } finally {
        setSaving(false);
      }
    },
    [selectedFee, closeModal, fetchStudentFees]
  );

  // DELETE: Delete student fee
  const handleDelete = useCallback(
    async (fee) => {
      if (!fee?.id) {
        toast.error("Student fee ID is missing.");
        return;
      }

      const confirmed = window.confirm(
        `Are you sure you want to delete the fee of ${
          fee.student_name || "this student"
        }?`
      );

      if (!confirmed) return;

      setDeleting(true);

      try {
        await deleteStudentFee(fee.id);

        toast.success("Student fee deleted successfully.");

        const nextPage =
          studentFees.length === 1 && currentPage > 1
            ? currentPage - 1
            : currentPage;

        setCurrentPage(nextPage);

        await fetchStudentFees(
          { page: nextPage },
          false
        );
      } catch (error) {
        toast.error(
          getErrorMessage(error, "Failed to delete student fee.")
        );
      } finally {
        setDeleting(false);
      }
    },
    [studentFees.length, currentPage, fetchStudentFees]
  );

  // Filter handlers
  const handleStudentNameChange = useCallback((event) => {
    setStudentName(event.target.value);
    setCurrentPage(1);
  }, []);

  const handleClassNameChange = useCallback((event) => {
    setClassName(event.target.value);
    setCurrentPage(1);
  }, []);

  const handleFeeMonthChange = useCallback((event) => {
    setFeeMonth(event.target.value);
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback((event) => {
    setStatus(event.target.value);
    setCurrentPage(1);
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setStudentName("");
    setClassName("");
    setFeeMonth("");
    setStatus("");
    setCurrentPage(1);
  }, []);

  const hasFilters = Boolean(
    studentName || className || feeMonth || status
  );

  // Table actions
  const getRowActions = useCallback(
    (row) => [
        {
        label: "View Fee History",
        icon: <History size={14} />,
        onClick: (selectedRow) => {
          const fee = selectedRow || row;

          navigate(`/finance/student-fee-history/${fee.student_id}`, {
            state: {
              studentName: fee.student_name,
            },
          });
        },
      },
      {
        label: "View Student Fee",
        icon: <Eye size={14} />,
        onClick: (selectedRow) =>
          openViewModal(selectedRow || row),
      },
      {
        label: "Edit Student Fee",
        icon: <Pencil size={14} />,
        onClick: (selectedRow) =>
          openEditModal(selectedRow || row),
      },
      {
        label: "Delete Student Fee",
        icon: <Trash2 size={14} />,
        variant: "danger",
        onClick: (selectedRow) =>
          handleDelete(selectedRow || row),
      },
    ],
    [ navigate, openViewModal, openEditModal, handleDelete]
  );

  return {
    studentFees,
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

    studentName,
    className,
    feeMonth,
    status,

    handleStudentNameChange,
    handleClassNameChange,
    handleFeeMonthChange,
    handleStatusChange,
    handleClearAllFilters,
    hasFilters,

    isModalOpen,
    selectedFee,
    openCreateModal,
    openEditModal,
    closeModal,

    isViewModalOpen,
    viewFee,
    openViewModal,
    closeViewModal,

    handleSaveStudentFee,
    handleDelete,
    getRowActions,
    fetchStudentFees,
  };
}
