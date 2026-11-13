import { useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import api from "../redux/config/Api.redux";

const EMPTY = {
  total_teachers: 0,

  students: {
    total: 0,
    active: 0,
    withdrawn: 0,
    completed: 0,
  },

  total_classes: 0,

  attendance: {
    total: 0,
    present: 0,
    absent: 0,
    leave: 0,
    present_percentage: 0,
    absent_percentage: 0,
    leave_percentage: 0,
  },

  fees: {
    total: 0,
    collected: 0,
    pending: 0,
    partial: 0,
    collected_percentage: 0,
    pending_percentage: 0,
    partial_percentage: 0,
  },
};

export const useDashboardData = () => {
  const currentUser = useSelector((state) => state.auth?.user);

  const [dashboardData, setDashboardData] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setFailed(false);

    try {
      const response = await api.get("/dashboard/details");

      setDashboardData(response.data?.data?.stats || EMPTY);
    } catch (error) {
      setFailed(true);

      toast.error(
        error?.response?.data?.message || "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const now = new Date();
  const hour = now.getHours();

  const greeting =
    hour < 12
      ? "Good Morning"
      : hour < 17
      ? "Good Afternoon"
      : "Good Evening";

  const today = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const roleKey =
    currentUser?.roles?.role_name ||
    currentUser?.role_name ||
    "admin";

  return {
    currentUser,
    roleKey,
    stats: dashboardData,
    loading,
    failed,
    greeting,
    today,
    retryLoad: fetchDashboard,
  };
};