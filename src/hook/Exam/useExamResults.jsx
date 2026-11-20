
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

import {
  getExamResults,
  createExamResult,
  updateExamResult,
  deleteExamResult,
} from "../../redux/api_data/examApi/examResultApi";

import { getExams } from "../../redux/api_data/examApi/examApi";

import { getStudentEnrollments } from "../../redux/api_data/studentEnrollmentApi/studentEnrollmentApi";

// Adjust this import path according to your project structure.
import useClasses from "../useClasses";

const EMPTY_PAGINATION = {
  current_page: 1,
  per_page: 10,
  last_page: 1,
  total: 0,
  next_page_url: null,
  prev_page_url: null,
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.message ||
  fallback;

export default function useExamResults() {
  // --------------------------------------------------
  // Data
  // --------------------------------------------------

  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);

  // Fetch classes directly from Class API
  const { classes } = useClasses(1, 100);

  // --------------------------------------------------
  // Class Tabs
  // --------------------------------------------------

  const [selectedClassTab, setSelectedClassTab] = useState("all");
  const [classTabCounts, setClassTabCounts] = useState({});

  // --------------------------------------------------
  // Pagination
  // --------------------------------------------------

  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // --------------------------------------------------
  // Filters
  // --------------------------------------------------

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExamId, setSelectedExamId] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // --------------------------------------------------
  // Modal
  // --------------------------------------------------

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // --------------------------------------------------
  // Fetch Overall Results
  // --------------------------------------------------

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

  // --------------------------------------------------
  // Fetch Exams
  // --------------------------------------------------

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

  // --------------------------------------------------
  // Fetch Active Students
  // --------------------------------------------------

  const fetchStudents = useCallback(async () => {
    try {
      const response = await getStudentEnrollments({
        page: 1,
        limit: 100,
        status: "active",
      });

      const records = response.data?.data || [];

      const activeStudents = records.filter(
        (item) => item.status === "active"
      );

      setStudents(activeStudents);
    } catch (error) {
      console.error("Failed to fetch students:", error);

      toast.error(
        getErrorMessage(error, "Failed to fetch students.")
      );

      setStudents([]);
    }
  }, []);

  // --------------------------------------------------
  // Initial Data
  // --------------------------------------------------

  useEffect(() => {
    fetchExams();
    fetchStudents();
  }, [fetchExams, fetchStudents]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // --------------------------------------------------
  // Modal
  // --------------------------------------------------

  const openCreateModal = useCallback(() => {
    setSelectedResult(null);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((result) => {
    setSelectedResult(result);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedResult(null);
  }, []);

  // --------------------------------------------------
  // Create / Update
  // --------------------------------------------------

  const handleSaveResult = useCallback(
    async (formData) => {
      setSaving(true);

      try {
        if (selectedResult?.id) {
          await updateExamResult(selectedResult.id, formData);

          toast.success("Exam result updated successfully.");
        } else {
          await createExamResult(formData);

          toast.success("Exam result created successfully.");
        }

        closeModal();

        if (page !== 1) {
          setPage(1);
        } else {
          await fetchResults();
        }

        return true;
      } catch (error) {
        console.error("Failed to save exam result:", error);

        const errors = error?.response?.data?.errors;

        if (errors) {
          Object.values(errors)
            .flat()
            .filter(Boolean)
            .forEach((message) => toast.error(message));
        } else {
          toast.error(
            getErrorMessage(error, "Failed to save exam result.")
          );
        }

        return false;
      } finally {
        setSaving(false);
      }
    },
    [selectedResult, closeModal, page, fetchResults]
  );

  // --------------------------------------------------
  // Delete
  // --------------------------------------------------

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

  // --------------------------------------------------
  // Filters
  // --------------------------------------------------

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

  const handleExamChange = useCallback((value) => {
    setSelectedExamId(String(value));
    setPage(1);
  }, []);

  const handleGradeChange = useCallback((value) => {
    setSelectedGrade(String(value));
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((value) => {
    setSelectedStatus(String(value));
    setPage(1);
  }, []);

  const handleClassTabChange = useCallback((value) => {
    setSelectedClassTab(String(value));
    setPage(1);
  }, []);

  const handlePageChange = useCallback((value) => {
    setPage(Number(value));
  }, []);

  const handleLimitChange = useCallback((value) => {
    setLimit(Number(value));
    setPage(1);
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedExamId("all");
    setSelectedGrade("all");
    setSelectedStatus("all");
    setSelectedClassTab("all");
    setPage(1);
  }, []);

  // --------------------------------------------------
  // Filter State
  // --------------------------------------------------

  const hasFilters = Boolean(
    searchTerm ||
    selectedExamId !== "all" ||
    selectedGrade !== "all" ||
    selectedStatus !== "all" ||
    selectedClassTab !== "all"
  );

  // --------------------------------------------------
  // Statistics
  // --------------------------------------------------

  const stats = useMemo(() => {
    const passed = results.filter(
      (item) => item.result_status === "pass"
    ).length;

    const failed = results.filter(
      (item) => item.result_status === "fail"
    ).length;

    const totalMarks = results.reduce(
      (sum, item) =>
        sum + Number(item.obtained_marks || 0),
      0
    );

    const averageMarks = results.length
      ? (totalMarks / results.length).toFixed(2)
      : "0.00";

    return {
      total: pagination.total,
      passed,
      failed,
      average_marks: averageMarks,
    };
  }, [results, pagination.total]);

  // --------------------------------------------------
  // Return
  // --------------------------------------------------

  return {
    // Data
    results,
    exams,
    students,
    classes,

    // Statistics
    stats,

    // Pagination
    pagination,
    page,
    limit,

    // Filters
    searchTerm,
    selectedExamId,
    selectedGrade,
    selectedStatus,

    // Class Tabs
    selectedClassTab,
    classTabCounts,
    activeCount: pagination.total,

    // Modal
    isModalOpen,
    selectedResult,

    // Loading
    loading,
    saving,
    deletingId,

    // Filter State
    hasFilters,

    // Modal Handlers
    openCreateModal,
    openEditModal,
    closeModal,

    // CRUD
    handleSaveResult,
    handleDeleteResult,

    // Filter Handlers
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
    fetchStudents,
  };
}
