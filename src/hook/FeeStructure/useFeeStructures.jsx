
import { useCallback, useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import {
  getFeeStructures,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
} from "../../redux/api_data/feeStructureApi/feeStructureApi";

import errorMessage from "../../utils/errorMessage/errorMessage";

const EMPTY_PAGINATION = {
  current_page: 1,
  per_page: 10,
  last_page: 1,
  total: 0,
};

export default function useFeeStructures() {
  const [feeStructures, setFeeStructures] = useState([]);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedFrequency, setSelectedFrequency] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFeeStructure, setSelectedFeeStructure] = useState(null);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  // Fetch fee structures with backend filters and pagination
  const fetchFeeStructures = useCallback(
    async (params = {}, showLoader = true) => {
      if (showLoader) setLoading(true);

      try {
        const response = await getFeeStructures(
          currentPage,
          itemsPerPage,
          {
            name: searchTerm.trim() || undefined,
            class_id: selectedClass || undefined,
            frequency: selectedFrequency || undefined,
            status: selectedStatus || undefined,
            ...params,
          }
        );

        const result = response.data;

        setFeeStructures(
          Array.isArray(result.data) ? result.data : []
        );

        setPagination(
          result.pagination || {
            ...EMPTY_PAGINATION,
            current_page: currentPage,
            per_page: itemsPerPage,
            total: result.data?.length || 0,
          }
        );

        setStats({
          total: result.stats?.total || 0,
          active: result.stats?.active || 0,
          inactive: result.stats?.inactive || 0,
        });

        return result;
      } catch (error) {
        toast.error(
          errorMessage(error) || "Failed to fetch fee structures."
        );

        setFeeStructures([]);
        return null;
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    [
      currentPage,
      itemsPerPage,
      searchTerm,
      selectedClass,
      selectedFrequency,
      selectedStatus,
    ]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFeeStructures();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchFeeStructures]);

  // Modal handlers
  const openCreateModal = useCallback(() => {
    setSelectedFeeStructure(null);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((feeStructure) => {
    setSelectedFeeStructure(feeStructure);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedFeeStructure(null);
  }, []);

  // Create / Update
  const handleSaveFeeStructure = useCallback(
    async (payload) => {
      setSaving(true);

      try {
        if (selectedFeeStructure?.id) {
          await updateFeeStructure(
            selectedFeeStructure.id,
            payload
          );

          toast.success("Fee structure updated successfully.");
        } else {
          await createFeeStructure(payload);

          toast.success("Fee structure created successfully.");
        }

        closeModal();
        setCurrentPage(1);

        if (currentPage === 1) {
          await fetchFeeStructures(
            { page: 1 },
            false
          );
        }

        return true;
      } catch (error) {
        toast.error(errorMessage(error));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [
      selectedFeeStructure,
      closeModal,
      currentPage,
      fetchFeeStructures,
    ]
  );

  // Delete
  const handleDelete = useCallback(
    async (feeStructure) => {
      if (!feeStructure?.id) {
        toast.error("Fee structure ID is missing.");
        return;
      }

      const confirmed = window.confirm(
        `Are you sure you want to delete ${
          feeStructure.name || "this fee structure"
        }?`
      );

      if (!confirmed) return;

      setDeleting(true);

      try {
        await deleteFeeStructure(feeStructure.id);

        toast.success("Fee structure deleted successfully.");

        const nextPage =
          feeStructures.length === 1 && currentPage > 1
            ? currentPage - 1
            : currentPage;

        setCurrentPage(nextPage);

        if (nextPage === currentPage) {
          await fetchFeeStructures({}, false);
        }
      } catch (error) {
        toast.error(errorMessage(error));
      } finally {
        setDeleting(false);
      }
    },
    [
      feeStructures.length,
      currentPage,
      fetchFeeStructures,
    ]
  );

  // Clear filters
  const handleClearAllFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedClass("");
    setSelectedFrequency("");
    setSelectedStatus("");
    setCurrentPage(1);
  }, []);

  const hasFilters = Boolean(
    searchTerm ||
    selectedClass ||
    selectedFrequency ||
    selectedStatus
  );

  // Table row actions
  const getRowActions = useCallback(
    (row) => [
      {
        label: "Edit Fee Structure",
        icon: <Pencil size={14} />,
        onClick: (selectedRow) =>
          openEditModal(selectedRow || row),
      },
      {
        label: "Delete Fee Structure",
        icon: <Trash2 size={14} />,
        variant: "danger",
        onClick: (selectedRow) =>
          handleDelete(selectedRow || row),
      },
    ],
    [openEditModal, handleDelete]
  );

  return {
    feeStructures,
    stats,
    pagination,

    loading,
    saving,
    deleting,

    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,

    searchTerm,
    setSearchTerm,
    selectedClass,
    setSelectedClass,
    selectedFrequency,
    setSelectedFrequency,
    selectedStatus,
    setSelectedStatus,

    isModalOpen,
    selectedFeeStructure,
    openCreateModal,
    openEditModal,
    closeModal,

    handleSaveFeeStructure,
    handleDelete,
    getRowActions,

    fetchFeeStructures,

    hasFilters,
    handleClearAllFilters,

    totalPages: Math.max(1, Number(pagination.last_page || 1)),
  };
}
