
import { useCallback, useEffect, useState } from "react";
import { getRolePermission } from "../../redux/api_data/role&permissionApi/RolePermissionAPi";

export const useRolePermissions = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchModules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const roleId = user?.role;

      console.log("Stored User:", user);
      console.log("Role ID:", roleId);

      if (roleId == null) {
        setModules([]);
        setError("User role not found");
        return;
      }

      const response = await getRolePermission({
        role_id: roleId,
      });

      setModules(response.data?.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch modules"
      );
      setModules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  return {
    modules,
    loading,
    error,
    fetchModules,
  };
};
