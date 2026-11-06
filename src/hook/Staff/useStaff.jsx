
import { useCallback, useEffect, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import staffApi from "../../redux/api_data/staffApi/staffApi";

const EMPTY_STATS = {
  total_teachers: 0,
  permanent_teachers: 0,
  qualified_teachers: 0,
  contract_teachers: 0,
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

export default function useStaff() {
  const [staff, setStaff] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);

  const [viewStaff, setViewStaff] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [employmentType, setEmploymentType] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // GET: Fetch staff with backend filters, pagination and stats
  const fetchStaff = useCallback(
    async (params = {}, showLoader = true) => {
      if (showLoader) setLoading(true);

      try {
        const response = await staffApi.getStaff({
          page,
          limit,
          ...params,
        });

        const result = response.data;

        const records = Array.isArray(result.data)
          ? result.data.map((user) => ({
              ...user,
              ...(user.user_details || {}),
              id: user.user_details?.id ?? user.id,
              user_id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              role_name: user.role_name,
            }))
          : [];

        setStaff(records);

        setPagination(
          result.pagination ?? {
            ...EMPTY_PAGINATION,
            current_page: page,
            per_page: limit,
          }
        );

        setStats({
          total_teachers: Number(
            result.stats?.total_teachers ?? 0
          ),
          permanent_teachers: Number(
            result.stats?.permanent_teachers ?? 0
          ),
          qualified_teachers: Number(
            result.stats?.qualified_teachers ?? 0
          ),
          contract_teachers: Number(
            result.stats?.contract_teachers ?? 0
          ),
          ...result.stats,
        });

        return result;
      } catch (error) {
        toast.error(
          getErrorMessage(error, "Failed to fetch staff.")
        );

        setStaff([]);
        setPagination({
          ...EMPTY_PAGINATION,
          current_page: page,
          per_page: limit,
        });
        setStats(EMPTY_STATS);

        return null;
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    [page, limit]
  );

  // Backend filters: search and employment type
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStaff({
        search: search.trim(),
        employment_type: employmentType,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchStaff, search, employmentType]);

  // Data already comes filtered and paginated from Laravel
  const filteredStaff = staff;
  const displayedStaff = staff;
  const paginatedStaff = staff;

  const totalPages = Math.max(
    1,
    Number(pagination.last_page ?? 1)
  );

  // Modal handlers
  const openCreateModal = useCallback(() => {
    setSelectedStaff(null);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((row) => {
    setSelectedStaff(row);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedStaff(null);
  }, []);

  const openViewModal = useCallback((row) => {
    setViewStaff(row);
    setIsViewModalOpen(true);
  }, []);

  const closeViewModal = useCallback(() => {
    setViewStaff(null);
    setIsViewModalOpen(false);
  }, []);

  // POST / PUT: Create or update staff
  const handleSaveStaff = useCallback(
    async (formData) => {
      setSaving(true);

      try {
        if (selectedStaff?.id) {
          await staffApi.updateStaff(
            selectedStaff.id,
            formData
          );

          toast.success("Staff updated successfully.");
        } else {
          await staffApi.createStaff(formData);

          toast.success("Staff created successfully.");
        }

        closeModal();
        setSearch("");
        setEmploymentType("");
        setPage(1);

        await fetchStaff(
          {
            page: 1,
            limit,
            search: "",
            employment_type: "",
          },
          false
        );
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
              selectedStaff
                ? "Failed to update staff."
                : "Failed to create staff."
            )
          );
        }
      } finally {
        setSaving(false);
      }
    },
    [selectedStaff, closeModal, fetchStaff, limit]
  );

  // DELETE: Delete staff
  const handleDeleteStaff = useCallback(
    async (row) => {
      if (!row?.id) {
        toast.error("Staff ID is missing.");
        return;
      }

      const confirmed = window.confirm(
        `Are you sure you want to delete ${
          row.name || "this staff"
        }?`
      );

      if (!confirmed) return;

      setDeleting(true);

      try {
        await staffApi.deleteStaff(row.id);

        toast.success("Staff deleted successfully.");

        const nextPage =
          page > 1 && staff.length === 1 ? page - 1 : page;

        if (nextPage !== page) {
          setPage(nextPage);
        } else {
          await fetchStaff(
            {
              page,
              limit,
              search,
              employment_type: employmentType,
            },
            false
          );
        }
      } catch (error) {
        toast.error(
          getErrorMessage(error, "Failed to delete staff.")
        );
      } finally {
        setDeleting(false);
      }
    },
    [
      page,
      limit,
      staff,
      search,
      employmentType,
      fetchStaff,
    ]
  );

  // Search handler
  const handleSearchChange = useCallback((value) => {
    setSearch(
      typeof value === "string"
        ? value
        : value.target.value
    );
    setPage(1);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearch("");
    setPage(1);
  }, []);

  // Employment type filter
  const handleEmploymentTypeChange = useCallback((value) => {
    setEmploymentType(value);
    setPage(1);
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setSearch("");
    setEmploymentType("");
    setPage(1);
  }, []);

  // Table row actions
  const getRowActions = useCallback(
    (row) => [
      {
        label: "View Staff",
        icon: <Eye size={14} />,
        onClick: (selectedRow) =>
          openViewModal(selectedRow || row),
      },
      {
        label: "Edit Staff",
        icon: <Pencil size={14} />,
        onClick: (selectedRow) =>
          openEditModal(selectedRow || row),
      },
      {
        label: "Delete Staff",
        icon: <Trash2 size={14} />,
        variant: "danger",
        onClick: (selectedRow) =>
          handleDeleteStaff(selectedRow || row),
      },
    ],
    [openViewModal, openEditModal, handleDeleteStaff]
  );

  return {
    staff,
    stats,
    pagination,
    loading,
    saving,
    deleting,
    error: null,

    // Filters
    search,
    setSearch,
    employmentType,
    setEmploymentType,
    handleSearchChange,
    handleClearSearch,
    handleEmploymentTypeChange,
    handleClearAllFilters,

    // Table data
    filteredStaff,
    displayedStaff,
    paginatedStaff,
    totalPages,

    // Pagination
    page,
    setPage,
    limit,
    setLimit,

    // Modal states
    isModalOpen,
    selectedStaff,
    viewStaff,
    isViewModalOpen,

    // Modal handlers
    openCreateModal,
    openEditModal,
    closeModal,
    openViewModal,
    closeViewModal,
    setViewStaff,

    // CRUD
    fetchStaff,
    setStaff,
    handleSaveStaff,
    handleDeleteStaff,

    // Table actions
    getRowActions,

    hasFilters: Boolean(search) || Boolean(employmentType),
  };
}
