import { useCallback, useEffect, useState } from "react";
import api from "../redux/config/Api.redux";

const INITIAL_PAGINATION = {
  current_page: 1,
  per_page: 10,
  last_page: 1,
  total: 0,
};

const useSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [pagination, setPagination] = useState(INITIAL_PAGINATION);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchSubjects = useCallback(
    async (page = 1, perPage = pagination.per_page) => {
      setLoading(true);

      try {
        const response = await api.get("/subject/details", {
          params: {
            page,
            per_page: perPage,
          },
        });

        const responseData = response.data?.data ?? response.data;
        const result = responseData?.data ?? responseData;

        const rows = Array.isArray(result)
          ? result
          : Array.isArray(result?.data)
            ? result.data
            : [];

        setSubjects(rows);

        setPagination({
          current_page: Number(
            result?.current_page ?? responseData?.current_page ?? page
          ),
          per_page: Number(
            result?.per_page ?? responseData?.per_page ?? perPage
          ),
          last_page: Number(
            result?.last_page ?? responseData?.last_page ?? 1
          ),
          total: Number(
            result?.total ?? responseData?.total ?? rows.length
          ),
        });

        return true;
      } catch (error) {
        console.error("Fetch subjects error:", error);
        setSubjects([]);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [pagination.per_page]
  );

  const createSubject = async (payload) => {
    setSaving(true);

    try {
      await api.post("/subject/create", payload);
      return true;
    } catch (error) {
      console.error("Create subject error:", error);
      alert(
        error.response?.data?.message || "Failed to create subject."
      );
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updateSubject = async (id, payload) => {
    setSaving(true);

    try {
      await api.put(`/subject/update/${id}`, payload);
      return true;
    } catch (error) {
      console.error("Update subject error:", error);
      alert(
        error.response?.data?.message || "Failed to update subject."
      );
      return false;
    } finally {
      setSaving(false);
    }
  };

  const deleteSubject = async (id) => {
    try {
      await api.delete(`/subject/delete/${id}`);
      return true;
    } catch (error) {
      console.error("Delete subject error:", error);
      alert(
        error.response?.data?.message || "Failed to delete subject."
      );
      return false;
    }
  };

  useEffect(() => {
    fetchSubjects(1, INITIAL_PAGINATION.per_page);
  }, [fetchSubjects]);

  return {
    subjects,
    pagination,
    loading,
    saving,
    fetchSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
  };
};

export default useSubjects;