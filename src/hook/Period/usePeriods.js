
import { useCallback, useEffect, useState } from "react";
import api from "../../redux/config/Api.redux";
import toast from "react-hot-toast";

const usePeriods = () => {
  const [periods, setPeriods] = useState([]);
  const [loadingPeriods, setLoadingPeriods] = useState(false);

  const fetchPeriods = useCallback(async () => {
    setLoadingPeriods(true);

    try {
      const response = await api.get("/period/details", {
        params: {
          status: "active",
          limit: 100,
        },
      });

      const result = response?.data?.data;

      setPeriods(
        (Array.isArray(result) ? result : []).sort(
          (a, b) => a.sort_order - b.sort_order
        )
      );
    } catch (error) {
      const message =
        Object.values(error?.response?.data?.errors || {}).flat()[0] ||
        error?.response?.data?.message ||
        "Failed to fetch periods.";

      toast.error(message);
    } finally {
      setLoadingPeriods(false);
    }
  }, []);

  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  return {
    periods,
    loadingPeriods,
    fetchPeriods,
  };
};

export default usePeriods;
