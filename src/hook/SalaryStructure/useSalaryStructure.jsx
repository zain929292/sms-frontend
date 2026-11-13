
import { useCallback, useEffect, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import {
  getSalaryStructures,
  createSalaryStructure,
  updateSalaryStructure,
  deleteSalaryStructure,
} from "../../redux/api_data/salaryStructureApi/salaryStructureApi";

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

export default function useSalaryStructure() {
  const [salaryStructures, setSalaryStructures] = useState([]);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [stats, setStats] = useState({});

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Backend filters
  const [staffName, setStaffName] = useState("");
  const [status, setStatus] = useState("");

  // Create / Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSalaryStructure, setSelectedSalaryStructure] =
    useState(null);

  // View modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewSalaryStructure, setViewSalaryStructure] =
    useState(null);

  // GET: Fetch salary structures
  const fetchSalaryStructures = useCallback(
    async (overrides = {}, showLoader = true) => {
      if (showLoader) setLoading(true);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        name: staffName.trim() || undefined,
        status: status || undefined,
        ...overrides,
      };

      try {
        const response = await getSalaryStructures(params);
        const result = response?.data;

        setSalaryStructures(
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
          getErrorMessage(
            error,
            "Failed to fetch salary structures."
          )
        );

        setSalaryStructures([]);
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
    [currentPage, itemsPerPage, staffName, status]
  );

  // Fetch when filters or pagination change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSalaryStructures();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchSalaryStructures]);

  // Modal handlers
  const openCreateModal = useCallback(() => {
    setSelectedSalaryStructure(null);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((salaryStructure) => {
    setSelectedSalaryStructure(salaryStructure);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedSalaryStructure(null);
  }, []);

  const openViewModal = useCallback((salaryStructure) => {
    setViewSalaryStructure(salaryStructure);
    setIsViewModalOpen(true);
  }, []);

  const closeViewModal = useCallback(() => {
    setViewSalaryStructure(null);
    setIsViewModalOpen(false);
  }, []);

  // POST / PUT: Create or update salary structure
  const handleSaveSalaryStructure = useCallback(
    async (formData) => {
      const userId = Number(
        formData.user_id ?? selectedSalaryStructure?.user_id
      );

      const basicSalary = Number(formData.basic_salary);
      const allowances = Number(formData.allowances || 0);

      if (!userId) {
        toast.error("Please select a staff member.");
        return false;
      }

      if (
        !Number.isFinite(basicSalary) ||
        basicSalary < 0 ||
        formData.basic_salary === ""
      ) {
        toast.error("Please enter a valid basic salary.");
        return false;
      }

      if (!Number.isFinite(allowances) || allowances < 0) {
        toast.error("Please enter valid allowances.");
        return false;
      }

      const payload = {
        user_id: userId,
        basic_salary: basicSalary,
        allowances,
        status: formData.status || "active",
        remarks: String(formData.remarks ?? "").trim() || null,
      };

      setSaving(true);

      try {
        if (selectedSalaryStructure?.id) {
          await updateSalaryStructure(
            selectedSalaryStructure.id,
            payload
          );

          toast.success(
            "Salary structure updated successfully."
          );
        } else {
          await createSalaryStructure(payload);

          toast.success(
            "Salary structure created successfully."
          );
        }

        closeModal();
        setCurrentPage(1);

        await fetchSalaryStructures({ page: 1 }, false);

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
              selectedSalaryStructure
                ? "Failed to update salary structure."
                : "Failed to create salary structure."
            )
          );
        }

        return false;
      } finally {
        setSaving(false);
      }
    },
    [
      selectedSalaryStructure,
      closeModal,
      fetchSalaryStructures,
    ]
  );

  // DELETE: Delete salary structure
  const handleDelete = useCallback(
    async (salaryStructure) => {
      if (!salaryStructure?.id) {
        toast.error("Salary structure ID is missing.");
        return;
      }

      const confirmed = window.confirm(
        `Are you sure you want to delete the salary structure of ${
          salaryStructure.user_name || "this staff member"
        }?`
      );

      if (!confirmed) return;

      setDeleting(true);

      try {
        await deleteSalaryStructure(salaryStructure.id);

        toast.success(
          "Salary structure deleted successfully."
        );

        const nextPage =
          salaryStructures.length === 1 && currentPage > 1
            ? currentPage - 1
            : currentPage;

        setCurrentPage(nextPage);

        await fetchSalaryStructures(
          { page: nextPage },
          false
        );
      } catch (error) {
        toast.error(
          getErrorMessage(
            error,
            "Failed to delete salary structure."
          )
        );
      } finally {
        setDeleting(false);
      }
    },
    [salaryStructures.length, currentPage, fetchSalaryStructures]
  );

  // Filter handlers
  const handleStaffNameChange = useCallback((event) => {
    setStaffName(event.target.value);
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
    setStatus("");
    setCurrentPage(1);
  }, []);

  const hasFilters = Boolean(staffName || status);

  // Table actions
  const getRowActions = useCallback(
    (row) => [
      {
        label: "View Salary Structure",
        icon: <Eye size={14} />,
        onClick: (selectedRow) =>
          openViewModal(selectedRow || row),
      },
      {
        label: "Edit Salary Structure",
        icon: <Pencil size={14} />,
        onClick: (selectedRow) =>
          openEditModal(selectedRow || row),
      },
      {
        label: "Delete Salary",
        icon: <Trash2 size={14} />,
        variant: "danger",
        onClick: (selectedRow) =>
          handleDelete(selectedRow || row),
      },
    ],
    [openViewModal, openEditModal, handleDelete]
  );

  return {
    salaryStructures,
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
    status,

    handleStaffNameChange,
    handleStatusChange,
    handleClearAllFilters,
    hasFilters,

    isModalOpen,
    selectedSalaryStructure,
    openCreateModal,
    openEditModal,
    closeModal,

    isViewModalOpen,
    viewSalaryStructure,
    openViewModal,
    closeViewModal,

    handleSaveSalaryStructure,
    handleDelete,
    getRowActions,
    fetchSalaryStructures,
  };
}
