
import { X, GraduationCap } from "lucide-react";

const StudentEnrollmentViewModal = ({
  isOpen,
  onClose,
  enrollment,
}) => {
  if (!isOpen || !enrollment) return null;

  const details = [
    ["Enrollment ID", enrollment.id],
    ["Student Name", enrollment.student_name],
    ["Student ID", enrollment.student_id],
    ["Class", enrollment.class_name],
    ["Class ID", enrollment.class_id],
    ["Academic Session", enrollment.academic_session],
    ["Session ID", enrollment.academic_session_id],
    ["Enrollment Date", enrollment.enrollment_date?.substring(0, 10)],
    ["Status", enrollment.status],
    ["Remarks", enrollment.remarks],
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--gray)] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-50 p-2 text-[var(--primary)]">
              <GraduationCap size={22} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">
                Enrollment Details
              </h2>
              <p className="text-xs text-slate-500">
                Student enrollment information
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-2">
          {details.map(([label, value]) => (
            <div
              key={label}
              className="rounded-lg border border-slate-100 bg-slate-50 p-3"
            >
              <p className="mb-1 text-xs font-medium text-slate-500">
                {label}
              </p>
              <p className="break-words text-sm font-semibold text-slate-800">
                {value === null || value === undefined || value === ""
                  ? "—"
                  : String(value)}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-end border-t border-[var(--gray)] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--secondary)]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentEnrollmentViewModal;
