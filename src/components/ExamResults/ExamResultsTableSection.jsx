
import { FileText, RotateCcw } from "lucide-react";

import Table from "../../utils/table/Table.util";
import ExamResultsTableColumns from "./ExamResultsTableColumns";
import MarksSheetTable from "./MarksSheetTable";

export default function ExamResultsTableSection({
  results: r,
  marksSheet: m,
  activeTab = "overall",
  onTabChange,
  limitOptions = [10, 25, 50, 100],
}) {
  const isOverallTab = activeTab === "overall";

  const columns = ExamResultsTableColumns({
    onEdit: r.openEditModal,
    onDelete: (id) => {
      if (
        window.confirm(
          "Are you sure you want to delete this exam result?"
        )
      ) {
        r.handleDeleteResult(id);
      }
    },
    deletingId: r.deletingId,
  });

  const selectedExamId =
    r.selectedExamId !== "all" ? r.selectedExamId : null;

  const selectedClassId =
    r.selectedClassTab !== "all" ? r.selectedClassTab : null;

  const hasMarksSheetSelection =
    Boolean(selectedExamId) && Boolean(selectedClassId);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">
            {isOverallTab
              ? "Exam Results Register"
              : "Student Marks Sheet"}
          </h3>

          <p className="mt-0.5 text-xs text-slate-500">
            {isOverallTab
              ? "View and manage student examination results"
              : "Enter and manage subject-wise student marks"}
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <FileText size={14} className="text-teal-600" />

          {isOverallTab
            ? `${r.pagination.total || 0} results`
            : `${m.marksSheetStudents?.length || 0} students`}
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-5 border-b border-slate-200 px-4">
        <button
          type="button"
          onClick={() => onTabChange?.("overall")}
          className={`border-b-2 py-3 text-xs font-semibold transition ${
            isOverallTab
              ? "border-teal-600 text-teal-700"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Overall Results
        </button>

        <button
          type="button"
          onClick={() => onTabChange?.("marks")}
          className={`border-b-2 py-3 text-xs font-semibold transition ${
            !isOverallTab
              ? "border-teal-600 text-teal-700"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Marks Sheet
        </button>
      </div>

      {/* Shared Filters */}
      <div className="border-b border-slate-100 p-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="min-w-[200px] flex-1">
            <input
              type="text"
              value={isOverallTab ? r.searchTerm : m.marksSheetSearchTerm}
              onChange={(e) => {
                if (isOverallTab) {
                  r.handleSearchChange(e.target.value);
                } else {
                  m.handleMarksSheetSearchChange(e.target.value);
                }
              }}
              placeholder={
                isOverallTab
                  ? "Search student name..."
                  : "Search student or roll number..."
              }
              className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none transition focus:border-teal-500"
            />
          </div>

          {/* Exam Filter */}
          <select
            value={r.selectedExamId}
            onChange={(e) => r.handleExamChange(e.target.value)}
            className="h-9 min-w-[140px] rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-600 outline-none focus:border-teal-500"
          >
            <option value="all">All Exams</option>

            {r.exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.name}
              </option>
            ))}
          </select>

          {/* Overall Result Filters */}
          {isOverallTab && (
            <>
              <select
                value={r.selectedGrade}
                onChange={(e) => r.handleGradeChange(e.target.value)}
                className="h-9 min-w-[110px] rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-600 outline-none focus:border-teal-500"
              >
                <option value="all">All Grades</option>

                {["A+", "A", "B+", "B", "C", "D", "F"].map(
                  (grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  )
                )}
              </select>

              <select
                value={r.selectedStatus}
                onChange={(e) => r.handleStatusChange(e.target.value)}
                className="h-9 min-w-[120px] rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-600 outline-none focus:border-teal-500"
              >
                <option value="all">All Status</option>
                <option value="pass">Pass</option>
                <option value="fail">Fail</option>
              </select>
            </>
          )}

          {/* Clear Filters */}
          {isOverallTab && r.hasFilters && (
            <button
              type="button"
              onClick={r.handleClearAllFilters}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <RotateCcw size={13} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Overall Results */}
      {isOverallTab && (
        <>
          {r.loading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-14">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />

              <p className="text-xs text-slate-500">
                Loading exam results...
              </p>
            </div>
          ) : !r.results?.length ? (
            <div className="flex flex-col items-center justify-center py-14">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <FileText size={22} />
              </div>

              <p className="text-sm font-semibold text-slate-700">
                No exam results found
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Try changing your filters or add a new exam result.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table
                  columns={columns}
                  data={r.results}
                  loading={false}
                />
              </div>

              {/* Pagination */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span>
                    Showing{" "}
                    <strong className="text-slate-700">
                      {r.results.length}
                    </strong>{" "}
                    of{" "}
                    <strong className="text-slate-700">
                      {r.pagination.total}
                    </strong>
                  </span>

                  <select
                    value={r.limit}
                    onChange={(e) => r.handleLimitChange(e.target.value)}
                    className="h-7 rounded border border-slate-200 bg-white px-1.5 text-[11px] outline-none"
                  >
                    {limitOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>

                  <span>per page</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={r.page <= 1 || r.loading}
                    onClick={() => r.handlePageChange(r.page - 1)}
                    className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span className="text-[11px] text-slate-600">
                    Page {r.pagination.current_page} of{" "}
                    {r.pagination.last_page}
                  </span>

                  <button
                    type="button"
                    disabled={
                      r.page >= r.pagination.last_page || r.loading
                    }
                    onClick={() => r.handlePageChange(r.page + 1)}
                    className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Marks Sheet */}
      {!isOverallTab && (
        <>
          {!hasMarksSheetSelection ? (
            <div className="flex flex-col items-center justify-center py-14">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                <FileText size={22} />
              </div>

              <p className="text-sm font-semibold text-slate-700">
                Select Exam and Class
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Please select an exam and class to load the student marks sheet.
              </p>
            </div>
          ) : m.marksSheetLoading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-14">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />

              <p className="text-xs text-slate-500">
                Loading student marks sheet...
              </p>
            </div>
          ) : (
            <MarksSheetTable
              students={m.marksSheetStudents || []}
              subjects={m.marksSheetSubjects || []}
              savedMarks={m.savedSubjectMarks || []}
              examId={selectedExamId}
              classId={selectedClassId}
              loading={m.marksSheetLoading || false}
              savingStudentId={m.savingStudentId || null}
              onSave={m.handleSaveSubjectMarks}
            />
          )}
        </>
      )}
    </div>
  );
}
