import { useCallback, useState } from "react";
import useUsersList from "./Components/useUsersList";
import useUserActions from "./Components/useUserActions";
import useRoles from "../Role/useRoles";

export default function useUsers(options = {}) {
  const {
    users,
    stats,
    loading,
    pagination,
    fetchUsers,
    searchTerm,
    handleSearchChange,
    handleClearFilters,
    handlePageChange,
    handleLimitChange,
  } = useUsersList(options);

  // Roles API
  const {
    roles,
    loading: rolesLoading,
    error: rolesError,
    fetchRoles,
  } = useRoles();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewUser, setViewUser] = useState(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedUser(null);
  }, []);

  const openCreateModal = useCallback(() => {
    setSelectedUser(null);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  }, []);

  const openViewModal = useCallback((user) => {
    setViewUser(user);
    setIsViewModalOpen(true);
  }, []);

  const closeViewModal = useCallback(() => {
    setViewUser(null);
    setIsViewModalOpen(false);
  }, []);

  const actions = useUserActions({
    selectedUser,
    closeModal,
    fetchUsers,
  });

  return {
    users,
    stats,
    loading,
    pagination,
    fetchUsers,

    roles,
    rolesLoading,
    rolesError,
    fetchRoles,

    searchTerm,
    handleSearchChange,
    handleClearFilters,
    handlePageChange,
    handleLimitChange,

    isDropdownOpen,
    setIsDropdownOpen,

    isModalOpen,
    selectedUser,
    openCreateModal,
    openEditModal,
    closeModal,

    isViewModalOpen,
    viewUser,
    openViewModal,
    closeViewModal,

    ...actions,
  };
}