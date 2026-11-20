
import { useCallback, useEffect, useState } from "react";
import api from "../../redux/config/Api.redux";
import toast from "react-hot-toast";

const getErrorMessage = (error, fallback) =>
  Object.values(error?.response?.data?.errors || {}).flat()[0] ||
  error?.response?.data?.message ||
  fallback;

const useExamDates = (examId = "") => {
  const [examDates, setExamDates] = useState([]);
  const [loadingExamDates, setLoadingExamDates] = useState(false);
  const [savingExamDate, setSavingExamDate] = useState(false);
  const [deletingExamDate, setDeletingExamDate] = useState(false);

  // Fetch Exam Dates
  const fetchExamDates = useCallback(async () => {
    setLoadingExamDates(true);

    try {
      const response = await api.get("/exam-dates/details", {
        params: {
          exam_id: examId || undefined,
          limit: 100,
        },
      });

      const result = response?.data?.data;

      const dateList = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : [];

      setExamDates(dateList);
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Failed to fetch exam dates.")
      );
    } finally {
      setLoadingExamDates(false);
    }
  }, [examId]);

  // Create Exam Date
  const createExamDate = async (payload) => {
    setSavingExamDate(true);

    try {
      await api.post("/exam-dates/create", payload);

      toast.success("Exam date created successfully.");

      await fetchExamDates();

      return true;
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Failed to create exam date.")
      );

      return false;
    } finally {
      setSavingExamDate(false);
    }
  };

  // Update Exam Date
  const updateExamDate = async (id, payload) => {
    setSavingExamDate(true);

    try {
      await api.put(`/exam-dates/update/${id}`, payload);

      toast.success("Exam date updated successfully.");

      await fetchExamDates();

      return true;
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Failed to update exam date.")
      );

      return false;
    } finally {
      setSavingExamDate(false);
    }
  };

  // Delete Exam Date
  const deleteExamDate = async (id) => {
    setDeletingExamDate(true);

    try {
      await api.delete(`/exam-dates/delete/${id}`);

      toast.success("Exam date deleted successfully.");

      await fetchExamDates();

      return true;
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Failed to delete exam date.")
      );

      return false;
    } finally {
      setDeletingExamDate(false);
    }
  };

  useEffect(() => {
    fetchExamDates();
  }, [fetchExamDates]);

  return {
    examDates,
    loadingExamDates,
    savingExamDate,
    deletingExamDate,
    fetchExamDates,
    createExamDate,
    updateExamDate,
    deleteExamDate,
  };
};

export default useExamDates;
