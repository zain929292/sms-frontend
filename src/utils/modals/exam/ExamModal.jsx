
import { useEffect, useState } from "react";
import {
  CalendarDays,
  GraduationCap,
  FileText,
  Users,
} from "lucide-react";
import { toast } from "react-hot-toast";

import ModalShell from "../../../shared/ModalShell.shared";
import FormField from "../../../shared/FormField.shared";
import SearchableSelect from "../../../shared/SearchableSelect.shared";
import { useModalAnimation } from "../../../shared/useModalAnimation.hook";

import useAcademicSessions from "../../../hook/useAcademicSessions";

const EMPTY_FORM = {
  name: "",
  exam_type: "weekly",
  academic_session_id: "",
  scope: "whole_school",
  class_ids: [],
  start_date: "",
  end_date: "",
  status: "scheduled",
  description: "",
};

const EXAM_TYPES = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "mid_term", label: "Mid Term" },
  { value: "final_term", label: "Final Term" },
];

const EXAM_SCOPES = [
  { value: "whole_school", label: "Whole School" },
  { value: "selected_classes", label: "Selected Classes" },
];

const STATUS_OPTIONS = [
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const getSessionName = (item) =>
  item?.name ||
  item?.session_name ||
  item?.title ||
  "Unnamed Session";

const getClassName = (item) =>
  item?.name ||
  item?.class_name ||
  item?.title ||
  `Class ${item?.id}`;

const ExamModal = ({
  isOpen,
  onClose,
  onSubmit,
  selectedExam,
  classes = [],
  saving = false,
  classesLoading = false,
}) => {
  const { shouldRender, isAnimating } =
    useModalAnimation(isOpen, 300);

  const {
    sessions = [],
    loading: sessionsLoading,
  } = useAcademicSessions();

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [sessionSearch, setSessionSearch] = useState("");
  const [classSearch, setClassSearch] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);

  const isEdit = Boolean(selectedExam?.id);

  useEffect(() => {
    if (!isOpen) return;

    const source = selectedExam || {};

    const existingClassIds =
      source.class_ids ??
      source.classes?.map((item) => item.id) ??
      [];

    const nextForm = {
      ...EMPTY_FORM,
      name: source.name ?? "",
      exam_type: source.exam_type ?? "weekly",
      academic_session_id: String(
        source.academic_session_id ?? ""
      ),
      scope: source.scope ?? "whole_school",
      class_ids: existingClassIds.map(Number),
      start_date: source.start_date
        ? String(source.start_date).substring(0, 10)
        : "",
      end_date: source.end_date
        ? String(source.end_date).substring(0, 10)
        : "",
      status: source.status ?? "scheduled",
      description: source.description ?? "",
    };

    setForm(nextForm);

    const selectedSession = sessions.find(
      (item) =>
        String(item.id) === nextForm.academic_session_id
    );

    setSessionSearch(
      source.academic_session?.name ||
      source.academic_session_name ||
      (selectedSession ? getSessionName(selectedSession) : "")
    );

    setClassSearch("");
    setOpenDropdown(null);
  }, [isOpen, selectedExam, sessions]);

  const selectedSession = sessions.find(
    (item) =>
      String(item.id) === String(form.academic_session_id)
  );

  const selectedClasses = classes.filter((item) =>
    form.class_ids.includes(Number(item.id))
  );

  const filteredClasses = classes.filter((item) =>
    getClassName(item)
      .toLowerCase()
      .includes(classSearch.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const selectSession = (item) => {
    setForm((prev) => ({
      ...prev,
      academic_session_id: String(item.id),
    }));

    setSessionSearch(getSessionName(item));
    setOpenDropdown(null);
  };

  const sessionFilter = (item, search) =>
    `${getSessionName(item)} ${item.id ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase());

  // Class selection
  const toggleClass = (classId) => {
    const id = Number(classId);

    setForm((prev) => ({
      ...prev,
      class_ids: prev.class_ids.includes(id)
        ? prev.class_ids.filter((item) => item !== id)
        : [...prev.class_ids, id],
    }));
  };

  const removeClass = (classId) => {
    const id = Number(classId);

    setForm((prev) => ({
      ...prev,
      class_ids: prev.class_ids.filter(
        (item) => item !== id
      ),
    }));
  };

  const handleScopeChange = (e) => {
    const value = e.target.value;

    setForm((prev) => ({
      ...prev,
      scope: value,
      class_ids:
        value === "whole_school" ? [] : prev.class_ids,
    }));
  };

  const handleClose = () => {
    if (saving) return;

    setOpenDropdown(null);
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Please enter the exam name.");
      return;
    }

    if (!form.exam_type || !form.scope) {
      toast.error("Please select exam type and scope.");
      return;
    }

    if (
      form.scope === "selected_classes" &&
      form.class_ids.length === 0
    ) {
      toast.error("Please select at least one class.");
      return;
    }

    if (!form.start_date || !form.end_date) {
      toast.error("Please select exam dates.");
      return;
    }

    if (form.end_date < form.start_date) {
      toast.error("End date cannot be earlier than start date.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      exam_type: form.exam_type,
      academic_session_id: form.academic_session_id
        ? Number(form.academic_session_id)
        : null,
      scope: form.scope,
      class_ids:
        form.scope === "selected_classes"
          ? form.class_ids
          : [],
      start_date: form.start_date,
      end_date: form.end_date,
      status: form.status,
      description: form.description.trim() || null,
    };

    console.log("Exam payload:", payload);

    onSubmit(payload);
  };

  if (!shouldRender) return null;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? "Update Examination" : "Create Examination"}
      subtitle="Manage examination details and academic schedule."
      icon={<GraduationCap size={22} />}
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
            <FormField
              label="Exam Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. First Term Examination"
              required
              disabled={saving}
            />

            <FormField
              label="Exam Type"
              name="exam_type"
              value={form.exam_type}
              onChange={handleChange}
              options={EXAM_TYPES}
              required
              disabled={saving}
            />

            <SearchableSelect
              label="Academic Session (Optional)"
              icon={CalendarDays}
              placeholder={
                sessionsLoading
                  ? "Loading sessions..."
                  : "Search academic session..."
              }
              searchTerm={sessionSearch}
              onSearchChange={setSessionSearch}
              items={sessions}
              isOpen={openDropdown === "session"}
              onOpenChange={(open) =>
                setOpenDropdown(open ? "session" : null)
              }
              filterFn={sessionFilter}
              onSelect={selectSession}
              disabled={saving || sessionsLoading}
              itemRenderer={(item) => (
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    {getSessionName(item)}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Session ID: {item.id}
                  </p>
                </div>
              )}
              emptyMessage="No academic sessions found."
            />

            <FormField
              label="Examination Scope"
              name="scope"
              value={form.scope}
              onChange={handleScopeChange}
              options={EXAM_SCOPES}
              required
              disabled={saving}
            />

            {form.scope === "selected_classes" && (
              <div className="sm:col-span-2">
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-600">
                    Select Classes <span className="text-red-500">*</span>
                  </label>

                  <span className="text-[11px] font-semibold text-teal-700">
                    {form.class_ids.length} Selected
                  </span>
                </div>

                {selectedClasses.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {selectedClasses.map((item) => (
                      <span
                        key={item.id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-teal-100 bg-teal-50 px-2.5 py-1.5 text-[11px] font-medium text-teal-800"
                      >
                        {getClassName(item)}

                        <button
                          type="button"
                          onClick={() => removeClass(item.id)}
                          disabled={saving}
                          className="text-teal-600 hover:text-red-500"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <SearchableSelect
                  label=""
                  icon={Users}
                  placeholder={
                    classesLoading
                      ? "Loading classes..."
                      : "Search and select classes..."
                  }
                  searchTerm={classSearch}
                  onSearchChange={setClassSearch}
                  items={filteredClasses}
                  isOpen={openDropdown === "classes"}
                  onOpenChange={(open) =>
                    setOpenDropdown(open ? "classes" : null)
                  }
                  filterFn={() => true}
                  onSelect={(item) => {
                    toggleClass(item.id);
                    setClassSearch("");
                    setOpenDropdown("classes");
                  }}
                  itemRenderer={(item) => (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-slate-800">
                          {getClassName(item)}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Class ID: {item.id}
                        </p>
                      </div>

                      {form.class_ids.includes(Number(item.id)) && (
                        <span className="text-xs font-semibold text-teal-700">
                          Selected
                        </span>
                      )}
                    </div>
                  )}
                  emptyMessage="No classes found."
                  disabled={saving || classesLoading}
                />
              </div>
            )}

            <FormField
              label="Start Date"
              name="start_date"
              type="date"
              value={form.start_date}
              onChange={handleChange}
              required
              disabled={saving}
            />

            <FormField
              label="End Date"
              name="end_date"
              type="date"
              value={form.end_date}
              onChange={handleChange}
              required
              disabled={saving}
            />

            <FormField
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              options={STATUS_OPTIONS}
              required
              disabled={saving}
            />
          </div>

          <div className="mt-4 border-t border-slate-100 pt-4">
            <div className="mb-2 flex items-center gap-2">
              <FileText size={15} className="text-teal-700" />
              <h3 className="text-xs font-semibold text-slate-800">
                Additional Information
              </h3>
            </div>

            <FormField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter examination details or instructions..."
              disabled={saving}
            />
          </div>

          {selectedSession && (
            <div className="mt-4 rounded-lg border border-teal-100 bg-teal-50/60 px-3 py-2.5">
              <p className="text-[11px] text-slate-500">
                Selected Academic Session
              </p>
              <p className="mt-1 text-xs font-semibold text-teal-800">
                {getSessionName(selectedSession)}
              </p>
            </div>
          )}

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
                  ? "Update Examination"
                  : "Save Examination"}
            </button>
          </div>
        </form>
      </div>
    </ModalShell>
  );
};

export default ExamModal;
