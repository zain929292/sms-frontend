import { Plus, FileText, GraduationCap } from "lucide-react";

const ExamResultsHeader = ({
  resultCount = 0,
  onAddClick,
  activeTab = "overall",
}) => {
  const isOverall = activeTab === "overall";

  return (
    <section className="relative overflow-hidden rounded-xl border border-teal-100 bg-gradient-to-r from-white to-teal-50/60 p-4 shadow-sm sm:p-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="mb-1 text-[11px] font-medium text-teal-700">
            Academic Management
            <span className="px-1 text-slate-300">/</span>
            Exam Results
          </p>

          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Exam Results
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            {isOverall
              ? "Manage student exam results, grades and performance."
              : "Enter and manage subject-wise examination marks."}
          </p>
        </div>

      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-teal-100/80 pt-3 text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <FileText size={13} className="text-teal-600" />

          <span>
            <strong className="text-slate-700">
              {resultCount}
            </strong>{" "}
            {isOverall ? "total results" : "students"}
          </span>
        </span>

        <span className="inline-flex items-center gap-1.5">
          <GraduationCap size={14} className="text-teal-600" />

          <span>
            {isOverall
              ? "Student examination performance"
              : "Bulk subject marks entry"}
          </span>
        </span>
      </div>
    </section>
  );
};

export default ExamResultsHeader;