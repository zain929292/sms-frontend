
import UserModal from "../../utils/modals/users/UserModal";
import UserViewModal from "../../utils/modals/users/UserViewModal";

import useUsers from "../../hook/Users/useUsers";

import UsersSummaryCards from "../../components/Users/UsersSummaryCards";
import UsersHeader from "../../components/Users/UsersHeader";
import UsersTableSection from "../../components/Users/UsersTableSection";

const USER_LIMIT_OPTIONS = [10, 25, 50, 100];

export default function Users() {
  const u = useUsers();

  return (
    <div className="space-y-5">
      <UsersSummaryCards stats={u.stats} />

      <UsersHeader onAddClick={u.openCreateModal} />

      <UsersTableSection
        user={u}
        limitOptions={USER_LIMIT_OPTIONS}
      />

      <UserModal
        open={u.isModalOpen}
        user={u.selectedUser}
        saving={u.saving}
        onClose={u.closeModal}
        onSubmit={u.handleSaveUser}
      />

      <UserViewModal
        isOpen={u.isViewModalOpen}
        onClose={u.closeViewModal}
        user={u.viewUser}
      />
    </div>
  );
}
