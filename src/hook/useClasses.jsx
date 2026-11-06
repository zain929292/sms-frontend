import { useCallback, useEffect, useState } from "react";
import api from "../redux/config/Api.redux";
import toast from "react-hot-toast";

const API_URL = "/class";

const errorMessage = (error) => {
  const data = error?.response?.data;
  const firstValidationError = Object.values(data?.errors || {}).flat()[0];

  return (
    firstValidationError ||
    data?.message ||
    data?.error ||
    "Something went wrong."
  );
};

const useClasses = () => {
  const [classes, setClasses] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    last_page: 1,
    total: 0,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchClasses = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);

    try {
      const response = await api.get(`${API_URL}/details`, {
        params: { page, limit },
      });

      const responseData = response?.data;
      const result = responseData?.data;

      setClasses(
        Array.isArray(result)
          ? result
          : Array.isArray(result?.data)
            ? result.data
            : []
      );

      if (responseData?.pagination) {
        setPagination(responseData.pagination);
      } else {
        // Fallback agar API paginatedResponse use nahi kar rahi.
        setPagination({
          current_page: page,
          per_page: limit,
          last_page: 1,
          total: Array.isArray(result) ? result.length : 0,
        });
      }
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses(pagination.current_page, pagination.per_page);
  }, [fetchClasses, pagination.current_page, pagination.per_page]);

  const createClass = async (payload) => {
    setSaving(true);

    try {
      await api.post(`${API_URL}/create`, payload);
      toast.success("Class created successfully.");

      await fetchClasses(pagination.current_page, pagination.per_page);
      return true;
    } catch (error) {
      toast.error(errorMessage(error));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updateClass = async (id, payload) => {
    setSaving(true);

    try {
      await api.put(`${API_URL}/update/${id}`, payload);
      toast.success("Class updated successfully.");

      await fetchClasses(pagination.current_page, pagination.per_page);
      return true;
    } catch (error) {
      toast.error(errorMessage(error));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const deleteClass = async (id) => {
    try {
      await api.delete(`${API_URL}/delete/${id}`);
      toast.success("Class deleted successfully.");

      const nextPage =
        classes.length === 1 && pagination.current_page > 1
          ? pagination.current_page - 1
          : pagination.current_page;

      await fetchClasses(nextPage, pagination.per_page);
      return true;
    } catch (error) {
      toast.error(errorMessage(error));
      return false;
    }
  };

  return {
    classes,
    pagination,
    loading,
    saving,
    fetchClasses,
    createClass,
    updateClass,
    deleteClass,
  };
};

export default useClasses;