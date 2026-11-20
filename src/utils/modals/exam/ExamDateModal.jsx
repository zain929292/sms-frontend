
import { useEffect, useState } from "react";
import {
  X,
  CalendarDays,
  Save,
  Clock,
} from "lucide-react";

const INITIAL_FORM = {
  exam_id: "",
  exam_date: "",
  start_time: "",
  end_time: "",
};

export default function ExamDateModal({
  isOpen,
  onClose,
  onSubmit,
  selectedExamDate,
  saving = false,
  exams = [],
  examId = "",
}) {
  const [formData, setFormData] = useState(INITIAL_FORM);

  const isEdit = Boolean(selectedExamDate?.id);

  useEffect(() => {
    if (!isOpen) return;

    if (selectedExamDate) {
      setFormData({
        exam_id: String(selectedExamDate.exam_id || examId || ""),
        exam_date: selectedExamDate.exam_date || "",
        start_time: selectedExamDate.start_time?.slice(0, 5) || "",
        end_time: selectedExamDate.end_time?.slice(0, 5) || "",
      });
    } else {
      setFormData({
        ...INITIAL_FORM,
        exam_id: String(examId || ""),
      });
    }
  }, [isOpen, selectedExamDate, examId]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.exam_id || !formData.exam_date) return;
    if (!formData.start_time) return;

    if (
      formData.end_time &&
      formData.end_time <= formData.start_time
    ) {
      return;
    }

    const payload = {
      exam_id: Number(formData.exam_id),
      exam_date: formData.exam_date,
      start_time: formData.start_time,
      end_time: formData.end_time || null,
    };

    await onSubmit(payload);
  };

  const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100";

  const labelClass =
    "mb-1.5 block text-xs font-medium text-slate-600";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-3">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
              <CalendarDays size={16} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                {isEdit ? "Edit Exam Date" : "Add Exam Date"}
              </h2>

              <p className="text-[11px] text-slate-500">
                {isEdit
                  ? "Update exam date and timing."
                  : "Define a new exam date and timing."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={17} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-3 p-4">

            {/* Exam */}
            <div>
              <label className={labelClass}>
                Examination <span className="text-red-500">*</span>
              </label>

              <select
                name="exam_id"
                value={formData.exam_id}
                onChange={handleChange}
                required
                disabled={Boolean(examId) || saving}
                className={inputClass}
              >
                <option value="">Select Examination</option>

                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Exam Date */}
            <div>
              <label className={labelClass}>
                Exam Date <span className="text-red-500">*</span>
              </label>

              <input
                type="date"
                name="exam_date"
                value={formData.exam_date}
                onChange={handleChange}
                required
                disabled={saving}
                className={inputClass}
              />
            </div>

            {/* Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>
                  Start Time <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <Clock
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    required
                    disabled={saving}
                    className={`${inputClass} pl-8`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  End Time
                </label>

                <div className="relative">
                  <Clock
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    disabled={saving}
                    className={`${inputClass} pl-8`}
                  />
                </div>
              </div>
            </div>

            {formData.start_time &&
              formData.end_time &&
              formData.end_time <= formData.start_time && (
                <p className="text-[11px] text-red-500">
                  End time must be later than start time.
                </p>
              )}

          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                !formData.exam_id ||
                !formData.exam_date ||
                !formData.start_time ||
                (formData.end_time &&
                  formData.end_time <= formData.start_time)
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 text-xs font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={14} />

              {saving
                ? "Saving..."
                : isEdit
                  ? "Update Exam Date"
                  : "Save Exam Date"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
