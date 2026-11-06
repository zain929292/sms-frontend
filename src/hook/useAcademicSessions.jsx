
import { useCallback, useEffect, useState } from "react";
import api from "../redux/config/Api.redux";
import toast from "react-hot-toast";

const API_URL = "/academic-session";

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  "Something went wrong. Please try again.";

const useAcademicSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // GET: Fetch all academic sessions
  const fetchSessions = useCallback(async () => {
    setLoading(true);

    try {
      const response = await api.get(`${API_URL}/details`);
      const result = response?.data?.data ?? response?.data;

      setSessions(
        Array.isArray(result) ? result : result?.data ?? [],
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // CREATE: Add academic session
  const createSession = async (payload) => {
    setSaving(true);

    try {
      await api.post(`${API_URL}/create`, payload);

      toast.success("Academic session created successfully.");
      await fetchSessions();

      return true;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
    } finally {
      setSaving(false);
    }
  };

  // UPDATE: Edit academic session
  const updateSession = async (id, payload) => {
    setSaving(true);

    try {
      await api.put(`${API_URL}/update/${id}`, payload);

      toast.success("Academic session updated successfully.");
      await fetchSessions();

      return true;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
    } finally {
      setSaving(false);
    }
  };

  // DELETE: Remove academic session
  const deleteSession = async (id) => {
    try {
      await api.delete(`${API_URL}/delete/${id}`);

      toast.success("Academic session deleted successfully.");
      await fetchSessions();

      return true;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
    }
  };

  return {
    sessions,
    loading,
    saving,
    fetchSessions,
    createSession,
    updateSession,
    deleteSession,
  };
};

export default useAcademicSessions;
