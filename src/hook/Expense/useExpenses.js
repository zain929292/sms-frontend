
import { useCallback, useState } from "react";
import api from "../../redux/config/Api.redux";
import toast from "react-hot-toast";

const API_URL = "/expense";

const DEFAULT_PAGINATION = {
  current_page: 1,
  per_page: 10,
  last_page: 1,
  total: 0,
  next_page_url: null,
  prev_page_url: null,
};

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  "Something went wrong. Please try again.";

const useExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // GET: Fetch expenses with backend filters
  const fetchExpenses = useCallback(async (params = {}) => {
    setLoading(true);

    try {
      const response = await api.get(`${API_URL}/details`, {
        params: {
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search || "",
        category: params.category || "",
        status: params.status || "",
        payment_method: params.payment_method || "",
        expense_date: params.expense_date || "",
        month: params.month || "",
        year: params.year || "",
      },
      });

      const result = response?.data;

      setExpenses(
        Array.isArray(result?.data) ? result.data : [],
      );

      setPagination(result?.pagination || DEFAULT_PAGINATION);
      setStats(result?.stats || {});
    } catch (error) {
      toast.error(getErrorMessage(error));

      setExpenses([]);
      setStats({});
      setPagination(DEFAULT_PAGINATION);
    } finally {
      setLoading(false);
    }
  }, []);

  // CREATE: Add expense
  const createExpense = async (payload) => {
    setSaving(true);

    try {
      await api.post(`${API_URL}/create`, payload);

      toast.success("Expense created successfully.");

      return true;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
    } finally {
      setSaving(false);
    }
  };

  // UPDATE: Edit expense
  const updateExpense = async (id, payload) => {
    setSaving(true);

    try {
      await api.post(`${API_URL}/update/${id}`, payload, {
        params: { _method: "PUT" },
      });

      toast.success("Expense updated successfully.");

      return true;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
    } finally {
      setSaving(false);
    }
  };

  // DELETE: Remove expense
  const deleteExpense = async (id) => {
    try {
      await api.delete(`${API_URL}/delete/${id}`);

      return true;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
    }
  };

  return {
    expenses,
    stats,
    pagination,
    loading,
    saving,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
  };
};

export default useExpenses;
