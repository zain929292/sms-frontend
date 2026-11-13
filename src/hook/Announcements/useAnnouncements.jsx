
import { useCallback, useEffect, useState } from "react";
import api from "../../redux/config/Api.redux";
import toast from "react-hot-toast";

const API_URL = "/announcements";

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  "Something went wrong. Please try again.";

const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // GET: Fetch all announcements
  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);

    try {
      const response = await api.get(`${API_URL}/details`);
      const result = response?.data?.data ?? response?.data;

      setAnnouncements(
        Array.isArray(result) ? result : result?.data ?? [],
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // CREATE: Add announcement
  const createAnnouncement = async (payload) => {
    setSaving(true);

    try {
      await api.post(`${API_URL}/create`, payload);

      toast.success("Announcement created successfully.");
      await fetchAnnouncements();

      return true;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
    } finally {
      setSaving(false);
    }
  };

  // UPDATE: Edit announcement
  const updateAnnouncement = async (id, payload) => {
    setSaving(true);

    try {
      await api.put(`${API_URL}/update/${id}`, payload);

      toast.success("Announcement updated successfully.");
      await fetchAnnouncements();

      return true;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
    } finally {
      setSaving(false);
    }
  };

  // DELETE: Remove announcement
  const deleteAnnouncement = async (id) => {
    try {
      await api.delete(`${API_URL}/delete/${id}`);

      toast.success("Announcement deleted successfully.");
      await fetchAnnouncements();

      return true;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
    }
  };

  return {
    announcements,
    loading,
    saving,
    fetchAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  };
};

export default useAnnouncements;
