
import { useState } from "react";

import ExamResultModal from "../../utils/modals/exam/ExamResultModal";

import useExamResults from "../../hook/Exam/useExamResults";
import useExamMarksSheet from "../../hook/Exam/useExamMarksSheet";

import ExamResultsStats from "../../components/ExamResults/ExamResultsStats";
import ExamResultsHeader from "../../components/ExamResults/ExamResultsHeader";
import ExamResultsClassTabs from "../../components/ExamResults/ExamResultsClassTabs";
import ExamResultsTableSection from "../../components/ExamResults/ExamResultsTableSection";

const RESULT_LIMIT_OPTIONS = [10, 25, 50, 100];

export default function ExamResults() {
  const r = useExamResults();

  const m = useExamMarksSheet({
    selectedExamId: r.selectedExamId,
    selectedClassTab: r.selectedClassTab,
  });

  const [activeTab, setActiveTab] = useState("overall");

  const isOverallTab = activeTab === "overall";

  // Separate data for each tab
  const resultCount = isOverallTab
    ? r.pagination.total
    : m.marksSheetActiveCount;

  const stats = isOverallTab
    ? r.stats
    : m.marksSheetStats;

  const classTabCounts = isOverallTab
    ? r.classTabCounts
    : m.marksSheetClassTabCounts;

  return (
    <div className="space-y-5">

      {/* Page Header */}
      <ExamResultsHeader
        resultCount={resultCount}
        onAddClick={
          isOverallTab
            ? r.openCreateModal
            : undefined
        }
        activeTab={activeTab}
      />

      {/* Statistics */}
      <ExamResultsStats
        stats={stats}
        activeTab={activeTab}
      />

      {/* Class Tabs */}
      <ExamResultsClassTabs
        classes={r.classes}
        selectedClassTab={r.selectedClassTab}
        activeCount={resultCount}
        classTabCounts={classTabCounts}
        onClassTabChange={r.handleClassTabChange}
        activeTab={activeTab}
      />

      {/* Results Table with Tabs */}
      <ExamResultsTableSection
        results={r}
        marksSheet={m}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        limitOptions={RESULT_LIMIT_OPTIONS}
      />

      {/* Create / Edit Overall Result */}
      {isOverallTab && (
        <ExamResultModal
          isOpen={r.isModalOpen}
          onClose={r.closeModal}
          resultData={r.selectedResult}
          onSubmit={r.handleSaveResult}
          saving={r.saving}
        />
      )}

    </div>
  );
}
