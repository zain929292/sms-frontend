
import { useState } from "react";
import toast from "react-hot-toast";

import {
  createUser,
  updateUser,
  deleteUser,
} from "../../../redux/api_data/userApi/userApi";

export default function useUserActions({
  selectedUser,
  closeModal,
  fetchUsers,
}) {
  const [saving, setSaving] = useState(false);

  const handleSaveUser = async (formData) => {
    setSaving(true);

    try {
      const payload = { ...formData };

      if (selectedUser) {
        await updateUser(selectedUser.id, payload);
        toast.success("User updated successfully");
      } else {
        await createUser(payload);
        toast.success("User created successfully");
      }

      closeModal();
      await fetchUsers();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Unable to save user";

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Delete user "${user.name}"?`)) {
      return;
    }

    try {
      await deleteUser(user.id);

      toast.success("User deleted successfully");
      await fetchUsers();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to delete user"
      );
    }
  };

  return {
    saving,
    handleSaveUser,
    handleDeleteUser,
  };
}
