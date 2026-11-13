import { useState } from "react";

import UserModal from "../../utils/modals/users/UserModal";
import UserViewModal from "../../utils/modals/users/UserViewModal";
import StaffModal from "../../utils/modals/staff/StaffModal";
import FilterBar from "../../utils/filter/FilterBar.util";

import useUsers from "../../hook/Users/useUsers";
import useStaff from "../../hook/Staff/useStaff";

import UsersSummaryCards from "../../components/Users/UsersSummaryCards";
import UsersHeader from "../../components/Users/UsersHeader";
import UsersTableSection from "../../components/Users/UsersTableSection";

const USER_LIMIT_OPTIONS = [10, 25, 50, 100];

export default function Users() {
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [selectedStaffUser, setSelectedStaffUser] = useState(null);

  const s = useStaff();

  const handleAddStaffDetails = (user) => {
    u.closeViewModal();
    setSelectedStaffUser(user);
    setIsStaffModalOpen(true);
  };

  const u = useUsers({
    onAddStaffDetails: handleAddStaffDetails,
  });

  const handleCloseStaffModal = () => {
    setIsStaffModalOpen(false);
    setSelectedStaffUser(null);
  };

  // Export current page users
  const handleExport = () => {
    if (!u.users.length) return;

    const headers = ["ID", "Name", "Email", "Role"];

    const rows = u.users.map((user) => [
      user.id,
      user.name || "",
      user.email || "",
      user.role_name || "",
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
  };

  const filterConfig = {
    searches: [
      {
        key: "user-search",
        label: "Search Users",
        value: u.searchTerm,
        onChange: u.handleSearchChange,
        onClear: () => u.handleSearchChange(""),
        placeholder: "Search user name or email...",
      },
    ],
    exportConfig: {
      onClick: handleExport,
      count: u.users.length,
      label: "Export",
      showCount: true,
    },
    hasFilters: u.hasFilters,
    onClearAll: u.handleClearFilters,
  };

  return (
    <div className="space-y-5">
      <UsersHeader onAddClick={u.openCreateModal} userCount={u.stats.total_users} />

      <UsersSummaryCards stats={u.stats} />

      <FilterBar {...filterConfig} />

      <UsersTableSection
        user={u}
        limitOptions={USER_LIMIT_OPTIONS}
      />

      <UserModal
        open={u.isModalOpen}
        user={u.selectedUser}
        roles={u.roles}
        saving={u.saving}
        onClose={u.closeModal}
        onSubmit={u.handleSaveUser}
      />

      <UserViewModal
        isOpen={u.isViewModalOpen}
        onClose={u.closeViewModal}
        user={u.viewUser}
        onAddStaffDetails={u.openAddModal}
      />

      <StaffModal
        open={isStaffModalOpen}
        staff={
          selectedStaffUser
            ? {
                ...selectedStaffUser.user_details,
                user_id: selectedStaffUser.id,
                name: selectedStaffUser.name,
                user_name: selectedStaffUser.name,
              }
            : null
        }
        users={u.users}
        saving={s.saving}
        onClose={handleCloseStaffModal}
        onSave={s.handleSaveStaff}
      />
    </div>
  );
}