
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import api from "../../../redux/config/Api.redux";
import toast from "react-hot-toast";

const EMPTY_FORM = {
  student_id: "",
  class_id: "",
  academic_session_id: "",
  enrollment_date: new Date().toISOString().slice(0, 10),
  status: "active",
  remarks: "",
};

const getList = (response) => {
  const payload = response?.data;

  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.students)) return payload.students;
  if (Array.isArray(payload?.classes)) return payload.classes;
  if (Array.isArray(payload?.academic_sessions)) return payload.academic_sessions;
  if (Array.isArray(payload)) return payload;

  return [];
};

const inputClass =
  "mt-1 w-full rounded-lg border border-[var(--gray)] bg-white px-3 py-2.5 text-sm text-[var(--dark)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-teal-100";

export default function StudentEnrollmentModal({
  isOpen,
  onClose,
  enrollmentData,
  onSubmit,
  saving = false,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setForm(
      enrollmentData
        ? {
            ...EMPTY_FORM,
            student_id: String(enrollmentData.student_id ?? ""),
            class_id: String(enrollmentData.class_id ?? ""),
            academic_session_id: String(
              enrollmentData.academic_session_id ?? ""
            ),
            enrollment_date:
              enrollmentData.enrollment_date?.substring(0, 10) || "",
            status: enrollmentData.status || "active",
            remarks: enrollmentData.remarks || "",
          }
        : { ...EMPTY_FORM }
    );
  }, [enrollmentData, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const loadOptions = async () => {
      setLoadingOptions(true);

      try {
        const [studentRes, classRes, sessionRes] = await Promise.all([
          api.get("/student/details"),
          api.get("/class/details"),
          api.get("/academic-session/details"),
        ]);

        setStudents(getList(studentRes));
        setClasses(getList(classRes));
        setSessions(getList(sessionRes));
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Failed to load student, class or session options."
        );
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      !form.student_id ||
      !form.class_id ||
      !form.academic_session_id
    ) {
      toast.error("Please select student, class and academic session.");
      return;
    }

    onSubmit({
      ...form,
      student_id: Number(form.student_id),
      class_id: Number(form.class_id),
      academic_session_id: Number(form.academic_session_id),
      enrollment_date: form.enrollment_date || null,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="enrollment-modal-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--gray)] px-5 py-4 sm:px-6">
          <div>
            <h2
              id="enrollment-modal-title"
              className="text-lg font-bold text-slate-900"
            >
              {enrollmentData ? "Edit Enrollment" : "Student Enrollment"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Assign a student to a class and academic session.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-5 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Student *
              <select
                className={inputClass}
                name="student_id"
                value={form.student_id}
                onChange={handleChange}
                required
                disabled={loadingOptions || saving}
              >
                <option value="">Select student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} {student.admission_number
                      ? `(${student.admission_number})`
                      : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Class *
              <select
                className={inputClass}
                name="class_id"
                value={form.class_id}
                onChange={handleChange}
                required
                disabled={loadingOptions || saving}
              >
                <option value="">Select class</option>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Academic Session *
              <select
                className={inputClass}
                name="academic_session_id"
                value={form.academic_session_id}
                onChange={handleChange}
                required
                disabled={loadingOptions || saving}
              >
                <option value="">Select academic session</option>
                {sessions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Enrollment Date *
              <input
                className={inputClass}
                type="date"
                name="enrollment_date"
                value={form.enrollment_date}
                onChange={handleChange}
                required
                disabled={saving}
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Status *
              <select
                className={inputClass}
                name="status"
                value={form.status}
                onChange={handleChange}
                required
                disabled={saving}
              >
                <option value="active">Active</option>
                <option value="promoted">Promoted</option>
                <option value="completed">Completed</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Remarks
              <textarea
                className={inputClass}
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                placeholder="Enter remarks"
                rows={3}
                disabled={saving}
              />
            </label>
          </div>

          {loadingOptions && (
            <p className="text-sm text-slate-500">
              Loading dropdown options...
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-[var(--gray)] pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-[var(--gray)] px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || loadingOptions}
              className="rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--secondary)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : enrollmentData
                  ? "Update Enrollment"
                  : "Enroll Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
