
import { useCallback, useEffect, useState } from "react";
import api from "../redux/config/Api.redux";
import Toast from "../utils/toast/Toast.util";

const API_URL = "/timetable";

const errorMessage = (error) => {
  const data = error?.response?.data;

  return (
    Object.values(data?.errors || {}).flat()[0] ||
    data?.message ||
    data?.error ||
    "Something went wrong."
  );
};

const useTimetable = () => {
  const [timetables, setTimetables] = useState([]);
  const [classTabCounts, setClassTabCounts] = useState({});
  const [selectedDay, setSelectedDay] = useState("regular");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch Timetable
  const fetchTimetable = useCallback(
    async (day = selectedDay) => {
      setLoading(true);

      try {
        const allRecords = [];
        let page = 1;
        let lastPage = 1;
        let counts = {};

        do {
          const response = await api.get(`${API_URL}/details`, {
            params: {
              day,
              page,
              limit: 500,
            },
          });

          const data = response?.data;
          const result = data?.data;

          const records = Array.isArray(result)
            ? result
            : Array.isArray(result?.data)
              ? result.data
              : [];

          allRecords.push(...records);

          counts = data?.class_tab_counts || counts;

          lastPage = Number(
            data?.pagination?.last_page ??
              result?.last_page ??
              1
          );

          page++;
        } while (page <= lastPage);

        setTimetables(allRecords);
        setClassTabCounts(counts);
      } catch (error) {
        Toast.error(
          "Failed to Load Timetable",
          errorMessage(error)
        );
      } finally {
        setLoading(false);
      }
    },
    [selectedDay]
  );

  useEffect(() => {
    fetchTimetable(selectedDay);
  }, [fetchTimetable, selectedDay]);

  // Create Timetable
  const createTimetable = async (payload) => {
    setSaving(true);

    const toastId = Toast.loading("Creating timetable...");

    try {
      await api.post(`${API_URL}/create`, payload);

      Toast.dismiss(toastId);

      Toast.success(
        "Timetable Created",
        "Timetable has been added successfully."
      );

      await fetchTimetable();
      return true;
    } catch (error) {
      Toast.dismiss(toastId);

      Toast.error(
        "Failed to Create Timetable",
        errorMessage(error)
      );

      return false;
    } finally {
      setSaving(false);
    }
  };

  // Update Timetable
  const updateTimetable = async (id, payload) => {
    setSaving(true);

    const toastId = Toast.loading("Updating timetable...");

    try {
      await api.put(`${API_URL}/update/${id}`, payload);

      Toast.dismiss(toastId);

      Toast.success(
        "Timetable Updated",
        "Timetable has been updated successfully."
      );

      await fetchTimetable();
      return true;
    } catch (error) {
      Toast.dismiss(toastId);

      Toast.error(
        "Failed to Update Timetable",
        errorMessage(error)
      );

      return false;
    } finally {
      setSaving(false);
    }
  };

  // Delete Timetable
  const deleteTimetable = async (id) => {
    const toastId = Toast.loading("Deleting timetable...");

    try {
      await api.delete(`${API_URL}/delete/${id}`);

      Toast.dismiss(toastId);

      Toast.success(
        "Timetable Deleted",
        "Timetable has been deleted successfully."
      );

      await fetchTimetable();
      return true;
    } catch (error) {
      Toast.dismiss(toastId);

      Toast.error(
        "Failed to Delete Timetable",
        errorMessage(error)
      );

      return false;
    }
  };

  return {
    timetables,
    classTabCounts,
    selectedDay,
    setSelectedDay,
    loading,
    saving,
    fetchTimetable,
    createTimetable,
    updateTimetable,
    deleteTimetable,
  };
};

export default useTimetable;
