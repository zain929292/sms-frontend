
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  GraduationCap,
  Award,
  CalendarDays,
} from "lucide-react";

import ModalShell from "../../../shared/ModalShell.shared";
import FormField from "../../../shared/FormField.shared";
import SearchableSelect from "../../../shared/SearchableSelect.shared";
import { useModalAnimation } from "../../../shared/useModalAnimation.hook";

const EMPTY_FORM = {
  exam_id: "",
  class_id: "",
  exam_date_id: "",
  subject_id: "",
  syllabus: "",
  total_marks: "",
  passing_marks: "",
};

const formatDate = (date) => {
  if (!date) return "—";

  const value = String(date).slice(0, 10);
  const parsedDate = new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const ExamScheduleModal = ({
  isOpen,
  onClose,
  selectedSchedule,
  defaultValues = {},
  onSubmit,
  classes = [],
  subjects = [],
  examDates = [],
  saving = false,
}) => {
  const { shouldRender, isAnimating } =
    useModalAnimation(isOpen, 300);

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [subjectSearch, setSubjectSearch] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);

  const isEdit = Boolean(selectedSchedule?.id);

  // Initialize form when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const source = selectedSchedule || defaultValues || {};

    const nextForm = {
      ...EMPTY_FORM,

      exam_id: String(
        source.exam_id ?? defaultValues.exam_id ?? ""
      ),

      class_id: String(
        source.class_id ?? defaultValues.class_id ?? ""
      ),

      exam_date_id: String(
        source.exam_date_id ?? defaultValues.exam_date_id ?? ""
      ),

      subject_id: String(source.subject_id ?? ""),
      syllabus: source.syllabus ?? "",
      total_marks: source.total_marks ?? "",
      passing_marks: source.passing_marks ?? "",
    };

    setForm(nextForm);

    const selectedSubject = subjects.find(
      (item) => String(item.id) === nextForm.subject_id
    );

    setSubjectSearch(selectedSubject?.name ?? "");
    setOpenDropdown(null);
  }, [isOpen, selectedSchedule, defaultValues, subjects]);

  // Selected Class
  const selectedClass = classes.find(
    (item) => String(item.id) === String(form.class_id)
  );

  // Selected Exam Date
const selectedExamDate = examDates.find(
  (item) =>
    String(item.id) === String(form.exam_date_id) &&
    String(item.exam_id) === String(form.exam_id)
);

const examDateValue = selectedExamDate?.exam_date ?? null;

  // Filter subjects according to class when relationship exists
  const filteredSubjects = useMemo(() => {
    if (!form.class_id) return subjects;

    const hasClassRelation = subjects.some(
      (subject) =>
        subject.class_id != null ||
        Array.isArray(subject.class_ids) ||
        Array.isArray(subject.classes)
    );

    if (!hasClassRelation) return subjects;

    return subjects.filter((subject) => {
      if (subject.class_id != null) {
        return String(subject.class_id) === form.class_id;
      }

      if (Array.isArray(subject.class_ids)) {
        return subject.class_ids.some(
          (id) => String(id) === form.class_id
        );
      }

      if (Array.isArray(subject.classes)) {
        return subject.classes.some(
          (item) =>
            String(item.id ?? item) === form.class_id
        );
      }

      return false;
    });
  }, [subjects, form.class_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClose = () => {
    if (saving) return;

    setOpenDropdown(null);
    onClose();
  };

  const searchableFilter = (item, search) =>
    String(item.name ?? "")
      .toLowerCase()
      .includes(search.toLowerCase());

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.exam_id ||
      !form.class_id ||
      !form.exam_date_id ||
      !form.subject_id ||
      form.total_marks === "" ||
      form.passing_marks === ""
    ) {
      return;
    }

    const total = Number(form.total_marks);
    const passing = Number(form.passing_marks);

    if (
      !Number.isFinite(total) ||
      !Number.isFinite(passing) ||
      total <= 0 ||
      passing < 0 ||
      passing > total
    ) {
      return;
    }

    // Only IDs and schedule fields are sent to backend
    const payload = {
      exam_id: Number(form.exam_id),
      class_id: Number(form.class_id),
      exam_date_id: Number(form.exam_date_id),
      subject_id: Number(form.subject_id),
      syllabus: String(form.syllabus ?? "").trim() || null,
      total_marks: total,
      passing_marks: passing,
    };

    const success = await onSubmit(payload);

    if (success) {
      setForm({ ...EMPTY_FORM });
      setSubjectSearch("");
      setOpenDropdown(null);
    }
  };

  if (!shouldRender) return null;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? "Update Exam Schedule" : "Add Exam Schedule"}
      subtitle="Assign subjects and marks to an examination."
      icon={<BookOpen size={22} />}
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

            {/* Selected Class - Read Only */}
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-slate-600">
                <GraduationCap size={15} />
                Class
              </label>

              <div className="flex h-10 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700">
                {selectedClass?.name ||
                  (form.class_id ? `Class ID: ${form.class_id}` : "No class selected")}
              </div>
            </div>

            {/* Selected Exam Date - Read Only */}
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-slate-600">
                <CalendarDays size={15} />
                Exam Date
              </label>

              <div className="flex h-10 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700">
                {examDateValue
                  ? formatDate(examDateValue)
                  : form.exam_date_id
                    ? `Date ID: ${form.exam_date_id}`
                    : "No exam date selected"}
              </div>
            </div>

            {/* Subject */}
            <div className="sm:col-span-2">
              <SearchableSelect
                label="Subject"
                icon={BookOpen}
                placeholder="Search subject..."
                searchTerm={subjectSearch}
                onSearchChange={setSubjectSearch}
                items={filteredSubjects}
                isOpen={openDropdown === "subject"}
                onOpenChange={(open) =>
                  setOpenDropdown(open ? "subject" : null)
                }
                filterFn={searchableFilter}
                onSelect={(item) => {
                  setForm((prev) => ({
                    ...prev,
                    subject_id: String(item.id),
                  }));

                  setSubjectSearch(item.name);
                  setOpenDropdown(null);
                }}
                itemRenderer={(item) => (
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Subject ID: {item.id}
                    </p>
                  </div>
                )}
                emptyMessage="No subjects found for this class."
              />
            </div>

            {/* Syllabus */}
            <div className="sm:col-span-2">
              <FormField
                label="Syllabus"
                name="syllabus"
                value={form.syllabus}
                onChange={handleChange}
                placeholder="Enter syllabus or chapters..."
                disabled={saving}
              />
            </div>

            {/* Total Marks */}
            <FormField
              label="Total Marks"
              name="total_marks"
              type="number"
              value={form.total_marks}
              onChange={handleChange}
              placeholder="e.g. 100"
              min="0.01"
              step="0.01"
              required
              disabled={saving}
              icon={Award}
            />

            {/* Passing Marks */}
            <FormField
              label="Passing Marks"
              name="passing_marks"
              type="number"
              value={form.passing_marks}
              onChange={handleChange}
              placeholder="e.g. 40"
              min="0"
              step="0.01"
              required
              disabled={saving}
              icon={Award}
            />
          </div>

          {/* Marks Validation */}
          {form.total_marks !== "" &&
            form.passing_marks !== "" &&
            Number(form.passing_marks) >
              Number(form.total_marks) && (
              <p className="mt-2 text-[11px] font-medium text-red-500">
                Passing marks cannot exceed total marks.
              </p>
            )}

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
              disabled={
                saving ||
                !form.exam_id ||
                !form.class_id ||
                !form.exam_date_id ||
                !form.subject_id ||
                form.total_marks === "" ||
                form.passing_marks === "" ||
                Number(form.total_marks) <= 0 ||
                Number(form.passing_marks) < 0 ||
                Number(form.passing_marks) > Number(form.total_marks)
              }
              className="flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-teal-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : isEdit
                  ? "Update Schedule"
                  : "Save Schedule"}
            </button>
          </div>
        </form>
      </div>
    </ModalShell>
  );
};

export default ExamScheduleModal;
