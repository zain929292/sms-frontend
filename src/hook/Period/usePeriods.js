
import { useCallback, useEffect, useState } from "react";
import api from "../../redux/config/Api.redux";
import toast from "react-hot-toast";

const getErrorMessage = (error, fallback) =>
  Object.values(error?.response?.data?.errors || {}).flat()[0] ||
  error?.response?.data?.message ||
  fallback;

const usePeriods = () => {
  const [periods, setPeriods] = useState([]);
  const [loadingPeriods, setLoadingPeriods] = useState(false);
  const [savingPeriod, setSavingPeriod] = useState(false);
  const [deletingPeriod, setDeletingPeriod] = useState(false);

  // Fetch Periods
  const fetchPeriods = useCallback(async () => {
    setLoadingPeriods(true);

    try {
      const response = await api.get("/period/details", {
        params: {
          limit: 100,
        },
      });

      const result = response?.data?.data;

      const periodList = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : [];

      setPeriods(
        [...periodList].sort(
          (a, b) =>
            Number(a.sort_order || 0) -
            Number(b.sort_order || 0)
        )
      );
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Failed to fetch periods.")
      );
    } finally {
      setLoadingPeriods(false);
    }
  }, []);

  // Create Period
  const createPeriod = async (payload) => {
    setSavingPeriod(true);

    try {
      await api.post("/period/create", payload);

      toast.success("Period created successfully.");

      await fetchPeriods();

      return true;
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Failed to create period.")
      );

      return false;
    } finally {
      setSavingPeriod(false);
    }
  };

  // Update Period
  const updatePeriod = async (id, payload) => {
    setSavingPeriod(true);

    try {
      await api.put(`/period/update/${id}`, payload);

      toast.success("Period updated successfully.");

      await fetchPeriods();

      return true;
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Failed to update period.")
      );

      return false;
    } finally {
      setSavingPeriod(false);
    }
  };

  // Delete Period
  const deletePeriod = async (id) => {
    setDeletingPeriod(true);

    try {
      await api.delete(`/period/delete/${id}`);

      toast.success("Period deleted successfully.");

      await fetchPeriods();

      return true;
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Failed to delete period.")
      );

      return false;
    } finally {
      setDeletingPeriod(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  return {
    periods,
    loadingPeriods,
    savingPeriod,
    deletingPeriod,
    fetchPeriods,
    createPeriod,
    updatePeriod,
    deletePeriod,
  };
};

export default usePeriods;
