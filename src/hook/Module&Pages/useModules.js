import { useCallback, useEffect, useState } from "react";
import { getModules } from "../../redux/api_data/moduleApi/moduleApi";

export const useModules = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchModules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getModules();

      setModules(response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch modules");
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