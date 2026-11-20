
import { useEffect, useState } from "react";

import FilterBar from "../../utils/filter/FilterBar.util";
import useExam from "../../hook/Exam/useExams";

import ExamHeader from "../../components/Exam/ExamHeader";
import ExamStats from "../../components/Exam/ExamStats";
import ExamTableSection from "../../components/Exam/ExamTableSection";

import ExamModal from "../../utils/modals/exam/ExamModal";
import { getClasses } from "../../redux/api_data/classApi/classApi";

export default function Exam() {
  const s = useExam();

  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      setClassesLoading(true);

      try {
        const response = await getClasses(1, 100);

        const result = response?.data?.data;

        const classList = Array.isArray(result)
          ? result
          : Array.isArray(result?.data)
            ? result.data
            : [];

        setClasses(classList);
      } catch (error) {
        console.error("Failed to fetch classes:", error);
        setClasses([]);
      } finally {
        setClassesLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const filterConfig = {
    searches: [
      {
        key: "exam",
        label: "Exam",
        value: s.examName,
        onChange: s.handleExamNameChange,
        placeholder: "Search exam name...",
      },
    ],

    customFilters: [
      <div key="exam-type" className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-600">
          Exam Type
        </label>

        <select
          value={s.examType}
          onChange={s.handleExamTypeChange}
          className="h-9 min-w-[140px] rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-teal-500"
        >
          <option value="">All Types</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="mid_term">Mid Term</option>
          <option value="final_term">Final Term</option>
        </select>
      </div>,

      <div key="status" className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-600">
          Exam Status
        </label>

        <select
          value={s.status}
          onChange={s.handleStatusChange}
          className="h-9 min-w-[130px] rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-teal-500"
        >
          <option value="">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>,
    ],

    hasFilters: s.hasFilters,
    onClearAll: s.handleClearAllFilters,
    layout: "compact",
  };

  return (
    <div className="space-y-4">
      <ExamHeader
        onAddExam={s.openCreateModal}
        examCount={s.stats.total_exams ?? 0}
      />

      <ExamStats stats={s.stats} />

      <FilterBar {...filterConfig} />

      <ExamTableSection
        exams={s.exams}
        loading={s.loading}
        pagination={s.pagination}
        currentPage={s.currentPage}
        totalPages={s.totalPages}
        itemsPerPage={s.itemsPerPage}
        setCurrentPage={s.setCurrentPage}
        setItemsPerPage={s.setItemsPerPage}
        getRowActions={s.getRowActions}
      />

      <ExamModal
        isOpen={s.isModalOpen}
        onClose={s.closeModal}
        selectedExam={s.selectedExam}
        onSubmit={s.handleSaveExam}
        classes={classes}
        classesLoading={classesLoading}
        saving={s.saving}
      />
    </div>
  );
}
