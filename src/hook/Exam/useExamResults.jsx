
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import {
  getExamResults,
  deleteExamResult,
} from "../../redux/api_data/examApi/examResultApi";

import { getExams } from "../../redux/api_data/examApi/examApi";

import useClasses from "../useClasses";

const EMPTY_PAGINATION = {
  current_page: 1,
  per_page: 10,
  last_page: 1,
  total: 0,
  next_page_url: null,
  prev_page_url: null,
};

const EMPTY_STATS = {
  total_results: 0,
  passed_students: 0,
  failed_students: 0,
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.message ||
  fallback;

export default function useExamResults() {
  // Data
  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);

  const { classes } = useClasses(1, 100);

  // Class Tabs
  const [selectedClassTab, setSelectedClassTab] = useState("all");
  const [classTabCounts, setClassTabCounts] = useState({});

  // Statistics
  const [stats, setStats] = useState(EMPTY_STATS);

  // Pagination
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExamId, setSelectedExamId] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Loading
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch Exam Results
  const fetchResults = useCallback(async () => {
    setLoading(true);

    try {
      const params = {
        page,
        limit,
      };

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      if (selectedExamId !== "all") {
        params.exam_id = selectedExamId;
      }

      if (selectedGrade !== "all") {
        params.grade = selectedGrade;
      }

      if (selectedStatus !== "all") {
        params.result_status = selectedStatus;
      }

      if (selectedClassTab !== "all") {
        params.class_id = selectedClassTab;
      }

      const response = await getExamResults(params);

      const records = response.data?.data || [];
      const paginationData = response.data?.pagination || {};
      const statsData = response.data?.stats || {};

      setResults(records);

      setPagination({
        ...EMPTY_PAGINATION,
        ...paginationData,
      });

      // Backend Statistics
      setStats({
        total_results: Number(statsData.total_results || 0),
        passed_students: Number(statsData.passed_students || 0),
        failed_students: Number(statsData.failed_students || 0),
      });

      // Backend Class Tab Counts
      setClassTabCounts(
        statsData.class_tab_counts ||
        statsData.classTabCounts ||
        {}
      );

    } catch (error) {
      console.error("Failed to fetch exam results:", error);

      toast.error(
        getErrorMessage(error, "Failed to fetch exam results.")
      );

      setResults([]);
      setPagination(EMPTY_PAGINATION);
      setStats(EMPTY_STATS);
      setClassTabCounts({});

    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    searchTerm,
    selectedExamId,
    selectedGrade,
    selectedStatus,
    selectedClassTab,
  ]);

  // Fetch Exams
  const fetchExams = useCallback(async () => {
    try {
      const response = await getExams({
        page: 1,
        limit: 100,
      });

      const records = response.data?.data || [];

      setExams(records);
    } catch (error) {
      console.error("Failed to fetch exams:", error);

      toast.error(
        getErrorMessage(error, "Failed to fetch exams.")
      );

      setExams([]);
    }
  }, []);

  // Initial Fetch
  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Delete Exam Result
  const handleDeleteResult = useCallback(
    async (id) => {
      if (!id || deletingId) return false;

      setDeletingId(id);

      try {
        await deleteExamResult(id);

        toast.success("Exam result deleted successfully.");

        if (results.length === 1 && page > 1) {
          setPage((previous) => previous - 1);
        } else {
          await fetchResults();
        }

        return true;

      } catch (error) {
        console.error("Failed to delete exam result:", error);

        toast.error(
          getErrorMessage(error, "Failed to delete exam result.")
        );

        return false;

      } finally {
        setDeletingId(null);
      }
    },
    [deletingId, results.length, page, fetchResults]
  );

  // Search Handler
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(
      typeof value === "string" ? value : value.target.value
    );

    setPage(1);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    setPage(1);
  }, []);

  // Exam Filter
  const handleExamChange = useCallback((value) => {
    setSelectedExamId(String(value));
    setPage(1);
  }, []);

  // Grade Filter
  const handleGradeChange = useCallback((value) => {
    setSelectedGrade(String(value));
    setPage(1);
  }, []);

  // Status Filter
  const handleStatusChange = useCallback((value) => {
    setSelectedStatus(String(value));
    setPage(1);
  }, []);

  // Class Tab Handler
  const handleClassTabChange = useCallback((value) => {
    setSelectedClassTab(String(value));
    setPage(1);
  }, []);

  // Pagination Handlers
  const handlePageChange = useCallback((value) => {
    setPage(Number(value));
  }, []);

  const handleLimitChange = useCallback((value) => {
    setLimit(Number(value));
    setPage(1);
  }, []);

  // Clear All Filters
  const handleClearAllFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedExamId("all");
    setSelectedGrade("all");
    setSelectedStatus("all");
    setSelectedClassTab("all");
    setPage(1);
  }, []);

  // Check Active Filters
  const hasFilters = Boolean(
    searchTerm ||
    selectedExamId !== "all" ||
    selectedGrade !== "all" ||
    selectedStatus !== "all" ||
    selectedClassTab !== "all"
  );

  return {
    // Data
    results,
    exams,
    classes,

    // Statistics
    stats,

    // Class Tabs
    selectedClassTab,
    classTabCounts,
    activeCount: pagination.total,

    // Pagination
    pagination,
    page,
    limit,

    // Filters
    searchTerm,
    selectedExamId,
    selectedGrade,
    selectedStatus,

    // Loading
    loading,
    deletingId,

    // Filter State
    hasFilters,

    // Actions
    handleDeleteResult,
    handleSearchChange,
    handleClearSearch,
    handleExamChange,
    handleGradeChange,
    handleStatusChange,
    handleClassTabChange,
    handlePageChange,
    handleLimitChange,
    handleClearAllFilters,

    // Fetch
    fetchResults,
    fetchExams,
  };
}
