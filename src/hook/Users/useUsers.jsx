import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { UserRound,Eye, Pencil, Trash2 } from "lucide-react";

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../redux/api_data/userApi/userApi";

import useRoles from "../Role/useRoles";

const EMPTY_FILTERS = {
  name: "",
  email: "",
  phone: "",
  role: "",
  status: "",
};

const EMPTY_STATS = {
  total_users: 0,
  total_teachers: 0,
  other_staff: 0,
  contract_teachers: 0,
  qualified_teachers: 0,
  permanent_teachers: 0,
};

const EMPTY_PAGINATION = {
  current_page: 1,
  per_page: 10,
  last_page: 1,
  total: 0,
};

export default function useUsers(options = {}) {
  const {
    limit = 10,
    onAddStaffDetails,
  } = options;

  // --------------------------------
  // STATES
  // --------------------------------

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);

  const [pagination, setPagination] = useState({
    ...EMPTY_PAGINATION,
    per_page: limit,
  });

  const [filters, setFilters] = useState({ ...EMPTY_FILTERS });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(limit);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Create / Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // View modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewUser, setViewUser] = useState(null);

  // --------------------------------
  // ROLES
  // --------------------------------

  const {
    roles,
    loading: rolesLoading,
    error: rolesError,
    fetchRoles,
  } = useRoles();

  // --------------------------------
  // FETCH USERS
  // --------------------------------

  const fetchUsers = useCallback(
    async (overrides = {}) => {
      setLoading(true);

      try {
        const activeFilters = overrides.filters || filters;

        const params = {
          page: overrides.page ?? currentPage,
          limit: overrides.limit ?? itemsPerPage,
        };

        Object.entries(activeFilters).forEach(([key, value]) => {
          if (value !== "" && value !== null && value !== undefined) {
            params[key] = value;
          }
        });

        const response = await getUsers(params);
        const result = response.data;

        setUsers(result.data || []);

        setStats({
          ...EMPTY_STATS,
          ...(result.stats || {}),
        });

        setPagination({
          current_page: result.pagination?.current_page || 1,
          per_page: result.pagination?.per_page || itemsPerPage,
          last_page: result.pagination?.last_page || 1,
          total: result.pagination?.total || 0,
        });
      } catch (error) {
        console.error("Failed to fetch users:", error);

        toast.error(
          error.response?.data?.message || "Failed to fetch users"
        );

        setUsers([]);
        setStats(EMPTY_STATS);

        setPagination({
          ...EMPTY_PAGINATION,
          per_page: itemsPerPage,
        });
      } finally {
        setLoading(false);
      }
    },
    [currentPage, itemsPerPage, filters]
  );

  // --------------------------------
  // DEBOUNCED FETCH
  // --------------------------------

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchUsers]);

  // --------------------------------
  // FILTER HANDLERS
  // --------------------------------

  const handleFilterChange = useCallback((key, value) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
    }));

    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback(
    (value) => {
      const searchValue =
        typeof value === "string"
          ? value
          : value?.target?.value || "";

      handleFilterChange("name", searchValue);
    },
    [handleFilterChange]
  );

  const handleClearFilters = useCallback(() => {
    setFilters({ ...EMPTY_FILTERS });
    setCurrentPage(1);
    setIsDropdownOpen(false);
  }, []);

  // --------------------------------
  // PAGINATION
  // --------------------------------

  const handlePageChange = useCallback((page) => {
    setCurrentPage(Number(page));
  }, []);

  const handleLimitChange = useCallback((limit) => {
    setItemsPerPage(Number(limit));
    setCurrentPage(1);
  }, []);

  // --------------------------------
  // CREATE MODAL
  // --------------------------------

  const openCreateModal = useCallback(() => {
    setSelectedUser(null);
    setIsModalOpen(true);
  }, []);

  // --------------------------------
  // EDIT MODAL
  // --------------------------------

  const openEditModal = useCallback((user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedUser(null);
  }, []);

  // --------------------------------
  // VIEW MODAL
  // --------------------------------

  const openViewModal = useCallback((user) => {
    setViewUser(user);
    setIsViewModalOpen(true);
    setIsDropdownOpen(false);
  }, []);

  const closeViewModal = useCallback(() => {
    setIsViewModalOpen(false);
    setViewUser(null);
  }, []);

// --------------------------------
// ADD STAFF DETAILS
// --------------------------------

const openAddModal = useCallback(
  (user) => {
    setViewUser(null);
    setIsViewModalOpen(false);

    onAddStaffDetails?.(user);
  },
  [onAddStaffDetails]
);
  // --------------------------------
  // DELETE USER
  // --------------------------------

  const handleDeleteUser = useCallback(
    async (user) => {
      if (!window.confirm(`Delete user "${user.name}"?`)) {
        return;
      }

      try {
        await deleteUser(user.id);

        toast.success("User deleted successfully");

        await fetchUsers();
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Unable to delete user"
        );
      }
    },
    [fetchUsers]
  );

  // --------------------------------
  // ROW ACTIONS
  // --------------------------------

const getRowActions = useCallback(
  (row) => [
    {
      label: "View User",
      icon: <Eye size={14} />,
      onClick: (selectedRow) =>
        openViewModal(selectedRow || row),
    },
    {
      label: "Manage More Details",
      icon: <UserRound size={14} />,
      onClick: (selectedRow) =>
        openAddModal(selectedRow || row),
    },
    {
      label: "Edit User",
      icon: <Pencil size={14} />,
      onClick: (selectedRow) =>
        openEditModal(selectedRow || row),
    },
    {
      label: "Delete User",
      icon: <Trash2 size={14} />,
      variant: "danger",
      onClick: (selectedRow) =>
        handleDeleteUser(selectedRow || row),
    },
  ],
  [
    openViewModal,
    openAddModal,
    openEditModal,
    handleDeleteUser,
  ]
);

  // --------------------------------
  // SAVE USER
  // --------------------------------

  const handleSaveUser = useCallback(
    async (formData) => {
      setSaving(true);

      try {
        if (selectedUser?.id) {
          await updateUser(selectedUser.id, formData);

          toast.success("User updated successfully");
        } else {
          await createUser(formData);

          toast.success("User created successfully");
        }

        closeModal();

        const clearedFilters = { ...EMPTY_FILTERS };

        setFilters(clearedFilters);
        setCurrentPage(1);

        await fetchUsers({
          page: 1,
          filters: clearedFilters,
        });
      } catch (error) {
        const errors = error.response?.data?.errors;

        if (errors) {
          Object.values(errors).flat().forEach((message) => {
            toast.error(message);
          });
        } else {
          toast.error(
            error.response?.data?.message || "Unable to save user"
          );
        }
      } finally {
        setSaving(false);
      }
    },
    [selectedUser, closeModal, fetchUsers]
  );

  // --------------------------------
  // CSV EXPORT
  // --------------------------------

  const handleExport = useCallback(() => {
    if (!users.length) {
      toast.error("No users available to export");
      return;
    }

    const headers = [
      "ID",
      "Name",
      "Email",
      "Role",
      "Phone",
      "Gender",
      "CNIC",
      "Qualification",
      "Experience",
      "Employment Type",
    ];

    const rows = users.map((user) => [
      user.id,
      user.name,
      user.email,
      user.role_name,
      user.user_details?.phone,
      user.user_details?.gender,
      user.user_details?.cnic,
      user.user_details?.qualification,
      user.user_details?.experience,
      user.user_details?.employment_type,
    ]);

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "users.csv";
    link.click();

    URL.revokeObjectURL(url);

    toast.success("Users exported successfully");
  }, [users]);

  // --------------------------------
  // RETURN
  // --------------------------------

  return {
    // Data
    users,
    stats,
    pagination,
    filters,

    // Loading
    loading,
    saving,

    // Pagination
    currentPage,
    itemsPerPage,
    setCurrentPage,
    setItemsPerPage,
    handlePageChange,
    handleLimitChange,

    // Dropdown
    isDropdownOpen,
    setIsDropdownOpen,

    // Filters
    handleFilterChange,
    handleSearchChange,
    handleClearFilters,

    // Modals
    isModalOpen,
    selectedUser,
    openCreateModal,
    openEditModal,
    closeModal,

    isViewModalOpen,
    viewUser,
    openAddModal,
    openViewModal,
    closeViewModal,

    // Actions
    getRowActions,
    handleSaveUser,
    handleDeleteUser,

    // Export
    handleExport,

    // Roles
    roles,
    rolesLoading,
    rolesError,
    fetchRoles,

    // Fetch
    fetchUsers,

    // Status
    hasFilters: Object.values(filters).some(Boolean),
  };
}
