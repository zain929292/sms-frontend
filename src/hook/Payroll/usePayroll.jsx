
import { useCallback, useEffect, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import {
  getPayrolls,
  createPayroll,
  updatePayroll,
  deletePayroll,
} from "../../redux/api_data/payrollApi/payrollApi";

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

export default function usePayroll() {
  const [payrolls, setPayrolls] = useState([]);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [stats, setStats] = useState({});

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Backend filters
  const [staffName, setStaffName] = useState("");
  const [salaryMonth, setSalaryMonth] = useState("");
  const [status, setStatus] = useState("");

  // Create / Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);

  // View modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewPayroll, setViewPayroll] = useState(null);

  // GET: Fetch payroll records
  const fetchPayrolls = useCallback(
    async (overrides = {}, showLoader = true) => {
      if (showLoader) setLoading(true);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        name: staffName.trim() || undefined,
        salary_month: salaryMonth || undefined,
        payment_status: status || undefined,
        ...overrides,
      };

      try {
        const response = await getPayrolls(params);
        const result = response?.data;

        setPayrolls(
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
          getErrorMessage(error, "Failed to fetch payroll records.")
        );

        setPayrolls([]);
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
      staffName,
      salaryMonth,
      status,
    ]
  );

  // Fetch when filters or pagination change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPayrolls();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchPayrolls]);

  // Modal handlers
  const openCreateModal = useCallback(() => {
    setSelectedPayroll(null);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((payroll) => {
    setSelectedPayroll(payroll);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedPayroll(null);
  }, []);

  const openViewModal = useCallback((payroll) => {
    setViewPayroll(payroll);
    setIsViewModalOpen(true);
  }, []);

  const closeViewModal = useCallback(() => {
    setViewPayroll(null);
    setIsViewModalOpen(false);
  }, []);

  // POST / PUT: Create or update payroll
  const handleSavePayroll = useCallback(
    async (formData) => {
      const userId = Number(
        formData.user_id ?? selectedPayroll?.user_id
      );

      if (!userId) {
        toast.error("Please select a staff member.");
        return false;
      }

      if (!formData.salary_month) {
        toast.error("Please select a salary month.");
        return false;
      }

      const deductions = Number(formData.deductions || 0);
      const paidAmount = Number(formData.paid_amount || 0);

      if (
        !Number.isFinite(deductions) ||
        !Number.isFinite(paidAmount) ||
        deductions < 0 ||
        paidAmount < 0
      ) {
        toast.error("Invalid payroll amount.");
        return false;
      }

      const payload = {
        user_id: userId,
        salary_month: formData.salary_month,
        deductions,
        paid_amount: paidAmount,
        payment_date: formData.payment_date || null,
        remarks: String(formData.remarks ?? "").trim(),
      };

      setSaving(true);

      try {
        if (selectedPayroll?.id) {
          await updatePayroll(selectedPayroll.id, payload);

          toast.success("Payroll updated successfully.");
        } else {
          await createPayroll(payload);

          toast.success("Payroll created successfully.");
        }

        closeModal();
        setCurrentPage(1);

        await fetchPayrolls({ page: 1 }, false);

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
              selectedPayroll
                ? "Failed to update payroll."
                : "Failed to create payroll."
            )
          );
        }

        return false;
      } finally {
        setSaving(false);
      }
    },
    [selectedPayroll, closeModal, fetchPayrolls]
  );

  // DELETE: Delete payroll
  const handleDelete = useCallback(
    async (payroll) => {
      if (!payroll?.id) {
        toast.error("Payroll ID is missing.");
        return;
      }

      const confirmed = window.confirm(
        `Are you sure you want to delete the payroll of ${
          payroll.name || "this staff member"
        }?`
      );

      if (!confirmed) return;

      setDeleting(true);

      try {
        await deletePayroll(payroll.id);

        toast.success("Payroll deleted successfully.");

        const nextPage =
          payrolls.length === 1 && currentPage > 1
            ? currentPage - 1
            : currentPage;

        setCurrentPage(nextPage);

        await fetchPayrolls(
          { page: nextPage },
          false
        );
      } catch (error) {
        toast.error(
          getErrorMessage(error, "Failed to delete payroll.")
        );
      } finally {
        setDeleting(false);
      }
    },
    [payrolls.length, currentPage, fetchPayrolls]
  );

  // Filter handlers
  const handleStaffNameChange = useCallback((event) => {
    setStaffName(event.target.value);
    setCurrentPage(1);
  }, []);

  const handleSalaryMonthChange = useCallback((event) => {
    setSalaryMonth(event.target.value);
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback((value) => {
    const nextStatus =
      typeof value === "string" ? value : value.target.value;

    setStatus(nextStatus);
    setCurrentPage(1);
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setStaffName("");
    setSalaryMonth("");
    setStatus("");
    setCurrentPage(1);
  }, []);

  const hasFilters = Boolean(
    staffName || salaryMonth || status
  );

  // Table actions
  const getRowActions = useCallback(
    (row) => [
      {
        label: "View Payroll",
        icon: <Eye size={14} />,
        onClick: (selectedRow) =>
          openViewModal(selectedRow || row),
      },
      {
        label: "Edit Payroll",
        icon: <Pencil size={14} />,
        onClick: (selectedRow) =>
          openEditModal(selectedRow || row),
      },
      {
        label: "Delete Payroll",
        icon: <Trash2 size={14} />,
        variant: "danger",
        onClick: (selectedRow) =>
          handleDelete(selectedRow || row),
      },
    ],
    [openViewModal, openEditModal, handleDelete]
  );

  return {
    payrolls,
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

    staffName,
    salaryMonth,
    status,

    handleStaffNameChange,
    handleSalaryMonthChange,
    handleStatusChange,
    handleClearAllFilters,
    hasFilters,

    isModalOpen,
    selectedPayroll,
    openCreateModal,
    openEditModal,
    closeModal,

    isViewModalOpen,
    viewPayroll,
    openViewModal,
    closeViewModal,

    handleSavePayroll,
    handleDelete,
    getRowActions,
    fetchPayrolls,
  };
}
