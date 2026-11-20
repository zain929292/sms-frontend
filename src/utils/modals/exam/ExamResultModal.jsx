
import { useEffect, useState } from "react";
import {
  BookOpen,
  UserRound,
  ClipboardCheck,
} from "lucide-react";

import ModalShell from "../../../shared/ModalShell.shared";
import FormField from "../../../shared/FormField.shared";
import SearchableSelect from "../../../shared/SearchableSelect.shared";
import { useModalAnimation } from "../../../shared/useModalAnimation.hook";

const EMPTY_FORM = {
  exam_id: "",
  student_id: "",
  obtained_marks: "",
  grade: "",
  result_status: "pass",
  remarks: "",
};

const STATUS_OPTIONS = [
  { value: "pass", label: "Pass" },
  { value: "fail", label: "Fail" },
];

const ExamResultModal = ({
  isOpen,
  onClose,
  resultData,
  onSubmit,
  exams = [],
  students = [],
  saving = false,
}) => {
  const { shouldRender, isAnimating } =
    useModalAnimation(isOpen, 300);

  const [form, setForm] = useState({ ...EMPTY_FORM });

  const [examSearch, setExamSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  const [openDropdown, setOpenDropdown] = useState(null);
  const [errors, setErrors] = useState({});

  const isEdit = Boolean(resultData?.id);

  // Prepare exam options
  const examOptions = exams.map((item) => ({
    value: String(item.id),
    label: item.name || item.exam_name || item.title || "Exam",
  }));

  // Prepare student options
  // student_id must be the enrollment ID, not students.id
  const studentOptions = students.map((item) => ({
    value: String(item.id),
    label:
      item.student_name ||
      item.students?.name ||
      item.student?.name ||
      item.name ||
      "Student",
    admission_number:
      item.admission_number ||
      item.students?.admission_number ||
      item.student?.admission_number ||
      "",
    class_name: item.class_name || "",
  }));

  // Initialize form
  useEffect(() => {
    if (!isOpen) return;

    const source = resultData || {};

    const nextForm = {
      ...EMPTY_FORM,
      exam_id: String(source.exam_id ?? ""),
      student_id: String(source.student_id ?? ""),
      obtained_marks:
        source.obtained_marks ?? "",
      grade: source.grade || "",
      result_status: source.result_status || "pass",
      remarks: source.remarks || "",
    };

    setForm(nextForm);

    const selectedExam = examOptions.find(
      (item) => item.value === nextForm.exam_id
    );

    const selectedStudent = studentOptions.find(
      (item) => item.value === nextForm.student_id
    );

    setExamSearch(
      selectedExam?.label || source.exam_name || ""
    );

    setStudentSearch(
      selectedStudent?.label || source.student_name || ""
    );

    setOpenDropdown(null);
    setErrors({});
  }, [isOpen, resultData, exams, students]);

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

  // Exam search filter
  const examFilter = (item, search) =>
    `${item.label ?? ""} ${item.value ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase());

  // Student search filter
  const studentFilter = (item, search) =>
    `${item.label ?? ""} ${
      item.admission_number ?? ""
    } ${item.value ?? ""} ${item.class_name ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase());

  // Select exam
  const handleSelectExam = (item) => {
    setForm((prev) => ({
      ...prev,
      exam_id: String(item.value),
    }));

    setExamSearch(item.label);
    setOpenDropdown(null);

    setErrors((prev) => ({
      ...prev,
      exam_id: "",
    }));
  };

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

    if (!form.exam_id) {
      newErrors.exam_id = "Please select an exam.";
    }

    if (!form.student_id) {
      newErrors.student_id = "Please select a student.";
    }

    if (
      form.obtained_marks === "" ||
      Number(form.obtained_marks) < 0
    ) {
      newErrors.obtained_marks =
        "Please enter valid obtained marks.";
    }

    if (!form.grade.trim()) {
      newErrors.grade = "Please enter a grade.";
    }

    if (!form.result_status) {
      newErrors.result_status =
        "Please select result status.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      exam_id: Number(form.exam_id),
      student_id: Number(form.student_id),
      obtained_marks: Number(form.obtained_marks),
      grade: form.grade.trim(),
      result_status: form.result_status,
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
          ? "Update Exam Result"
          : "Add Exam Result"
      }
      subtitle="Record and manage student examination results."
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

            {/* Exam */}
            <div>
              <SearchableSelect
                label="Exam"
                icon={BookOpen}
                placeholder="Search exam..."
                searchTerm={examSearch}
                onSearchChange={(value) => {
                  setExamSearch(value);

                  setForm((prev) => ({
                    ...prev,
                    exam_id: "",
                  }));

                  setErrors((prev) => ({
                    ...prev,
                    exam_id: "",
                  }));
                }}
                items={examOptions}
                isOpen={openDropdown === "exam"}
                onOpenChange={(open) =>
                  setOpenDropdown(open ? "exam" : null)
                }
                filterFn={examFilter}
                onSelect={handleSelectExam}
                itemRenderer={(item) => (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-slate-800">
                      {item.label}
                    </span>

                    <span className="text-[11px] text-slate-400">
                      ID: {item.value}
                    </span>
                  </div>
                )}
                emptyMessage="No exams found."
              />

              {errors.exam_id && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.exam_id}
                </p>
              )}
            </div>

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
                        {item.class_name
                          ? ` • ${item.class_name}`
                          : ""}
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

            {/* Obtained Marks */}
            <div>
              <FormField
                label="Obtained Marks"
                name="obtained_marks"
                type="number"
                value={form.obtained_marks}
                onChange={handleChange}
                required
                disabled={saving}
              />

              {errors.obtained_marks && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.obtained_marks}
                </p>
              )}
            </div>

            {/* Grade */}
            <div>
              <FormField
                label="Grade"
                name="grade"
                value={form.grade}
                onChange={handleChange}
                placeholder="Enter grade (e.g. A, B, C)"
                required
                disabled={saving}
              />

              {errors.grade && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.grade}
                </p>
              )}
            </div>

            {/* Result Status */}
            <div>
              <FormField
                label="Result Status"
                name="result_status"
                value={form.result_status}
                onChange={handleChange}
                options={STATUS_OPTIONS}
                required
                disabled={saving}
              />

              {errors.result_status && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.result_status}
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
                placeholder="Enter result remarks..."
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
                  ? "Update Result"
                  : "Save Result"}
            </button>
          </div>
        </form>
      </div>
    </ModalShell>
  );
};

export default ExamResultModal;
