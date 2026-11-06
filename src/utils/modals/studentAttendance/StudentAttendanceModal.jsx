import { useEffect, useState } from "react";
import {
  CalendarDays,
  UserRound,
  ClipboardCheck,
} from "lucide-react";

import ModalShell from "../../../shared/ModalShell.shared";
import FormField from "../../../shared/FormField.shared";
import SearchableSelect from "../../../shared/SearchableSelect.shared";
import { useModalAnimation } from "../../../shared/useModalAnimation.hook";

const EMPTY_FORM = {
  student_id: "",
  attendance_date: new Date().toISOString().split("T")[0],
  status: "present",
  remarks: "",
};

const STATUS_OPTIONS = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "late", label: "Late" },
  { value: "leave", label: "Leave" },
];

const StudentAttendanceModal = ({
  isOpen,
  onClose,
  attendanceData,
  onSubmit,
  studentOptions = [],
  saving = false,
}) => {
  const { shouldRender, isAnimating } =
    useModalAnimation(isOpen, 300);

  const [form, setForm] = useState({ ...EMPTY_FORM });

  const [studentSearch, setStudentSearch] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [errors, setErrors] = useState({});

  const isEdit = Boolean(attendanceData?.id);

  // Initialize form
  useEffect(() => {
    if (!isOpen) return;

    const source = attendanceData || {};

    const nextForm = {
      ...EMPTY_FORM,
      student_id: String(source.student_id ?? ""),
      attendance_date:
        source.attendance_date ?? EMPTY_FORM.attendance_date,
      status: source.status || "present",
      remarks: source.remarks || "",
    };

    setForm(nextForm);

    const selectedStudent = studentOptions.find(
      (item) => String(item.value) === nextForm.student_id
    );

    setStudentSearch(
      selectedStudent?.label || source.student_name || ""
    );

    setOpenDropdown(null);
    setErrors({});
  }, [isOpen, attendanceData, studentOptions]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // Student search filter
  const studentFilter = (item, search) =>
    `${item.label ?? ""} ${
      item.admission_number ?? ""
    } ${item.value ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase());

  // Select student
  const handleSelectStudent = (item) => {
    setForm((prev) => ({
      ...prev,
      student_id: String(item.value),
    }));

    setStudentSearch(item.label);
    setOpenDropdown(null);

    setErrors((prev) => ({
      ...prev,
      student_id: "",
    }));
  };

  // Close modal
  const handleClose = () => {
    if (saving) return;

    setOpenDropdown(null);
    onClose();
  };

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!form.student_id) {
      newErrors.student_id = "Please select a student.";
    }

    if (!form.attendance_date) {
      newErrors.attendance_date =
        "Attendance date is required.";
    }

    if (!form.status) {
      newErrors.status =
        "Please select attendance status.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      student_id: Number(form.student_id),
      attendance_date: form.attendance_date,
      status: form.status,
      remarks: form.remarks.trim() || null,
    });
  };

  if (!shouldRender) return null;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      title={
        isEdit
          ? "Update Student Attendance"
          : "Mark Student Attendance"
      }
      subtitle="Record and manage student attendance details."
      icon={<ClipboardCheck size={22} />}
      maxWidth="max-w-3xl"
      disabled={saving}
    >
      <div
        className={`origin-center transform transition-all duration-300 ease-out ${
          isAnimating
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-95 opacity-0"
        }`}
      >
        <form onSubmit={handleSubmit} className="p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* Student */}
            <div>
              <SearchableSelect
                label="Student"
                icon={UserRound}
                placeholder="Search student..."
                searchTerm={studentSearch}
                onSearchChange={(value) => {
                  setStudentSearch(value);

                  setForm((prev) => ({
                    ...prev,
                    student_id: "",
                  }));

                  setErrors((prev) => ({
                    ...prev,
                    student_id: "",
                  }));
                }}
                items={studentOptions}
                isOpen={openDropdown === "student"}
                onOpenChange={(open) =>
                  setOpenDropdown(open ? "student" : null)
                }
                filterFn={studentFilter}
                onSelect={handleSelectStudent}
                itemRenderer={(item) => (
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        {item.label}
                      </p>

                      <p className="text-[11px] text-slate-500">
                        {item.admission_number || "Student"}
                      </p>
                    </div>

                    <span className="text-[11px] text-slate-400">
                      ID: {item.value}
                    </span>
                  </div>
                )}
                emptyMessage="No students found."
              />

              {errors.student_id && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.student_id}
                </p>
              )}
            </div>

            {/* Attendance Date */}
            <div>
              <FormField
                label="Attendance Date"
                name="attendance_date"
                type="date"
                value={form.attendance_date}
                onChange={handleChange}
                required
                disabled={saving}
              />

              {errors.attendance_date && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.attendance_date}
                </p>
              )}
            </div>

            {/* Attendance Status */}
            <div>
              <FormField
                label="Attendance Status"
                name="status"
                value={form.status}
                onChange={handleChange}
                options={STATUS_OPTIONS}
                required
                disabled={saving}
              />

              {errors.status && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.status}
                </p>
              )}
            </div>

            {/* Remarks */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Remarks
              </label>

              <textarea
                name="remarks"
                rows={3}
                maxLength={255}
                value={form.remarks}
                onChange={(e) => {
                  setForm((prev) => ({
                    ...prev,
                    remarks: e.target.value,
                  }));
                }}
                disabled={saving}
                placeholder="Enter attendance remarks..."
                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:opacity-50"
              />

              <p className="mt-1 text-right text-[11px] text-slate-400">
                {form.remarks.length}/255
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:text-slate-800 active:scale-95 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-teal-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : isEdit
                  ? "Update Attendance"
                  : "Save Attendance"}
            </button>
          </div>
        </form>
      </div>
    </ModalShell>
  );
};

export default StudentAttendanceModal;