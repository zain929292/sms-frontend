
import { useEffect, useState } from "react";
import {
  GraduationCap,
  CalendarDays,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../../redux/config/Api.redux";

import ModalShell from "../../../shared/ModalShell.shared";
import FormField from "../../../shared/FormField.shared";
import SearchableSelect from "../../../shared/SearchableSelect.shared";
import { useModalAnimation } from "../../../shared/useModalAnimation.hook";

const EMPTY_FORM = {
  student_id: "",
  current_enrollment_id: "",
  new_class_id: "",
  new_academic_session_id: "",
  enrollment_date: new Date().toISOString().slice(0, 10),
  remarks: "",
};

const getList = (response) => {
  const data = response?.data?.data ?? response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.classes)) return data.classes;
  if (Array.isArray(data?.academic_sessions)) {
    return data.academic_sessions;
  }
  if (Array.isArray(data?.students)) return data.students;

  return [];
};

const StudentPromotionModal = ({
  isOpen,
  onClose,
  enrollment,
  onSubmit,
  saving = false,
}) => {
  const { shouldRender, isAnimating } =
    useModalAnimation(isOpen, 300);

  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */

  const [form, setForm] = useState({ ...EMPTY_FORM });

  const [classes, setClasses] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [classSearch, setClassSearch] = useState("");
  const [sessionSearch, setSessionSearch] = useState("");

  const [openDropdown, setOpenDropdown] = useState(null);

  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [retry, setRetry] = useState(0);

  const [errors, setErrors] = useState({});

  /* -------------------------------------------------------------------------- */
  /*                              Initialize Form                               */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!isOpen) return;

    setForm({
      ...EMPTY_FORM,
      student_id: String(enrollment?.student_id ?? ""),
      current_enrollment_id: String(enrollment?.id ?? ""),
      enrollment_date: EMPTY_FORM.enrollment_date,
    });

    setClassSearch("");
    setSessionSearch("");
    setOpenDropdown(null);

    setErrors({});
    setLoadError("");
  }, [isOpen, enrollment]);

  /* -------------------------------------------------------------------------- */
  /*                            Load Dropdown Data                              */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const loadOptions = async () => {
      setLoadingOptions(true);
      setLoadError("");

      try {
        const [classResponse, sessionResponse] =
          await Promise.all([
            api.get("/class/details"),
            api.get("/academic-session/details"),
          ]);

        if (cancelled) return;

        setClasses(getList(classResponse));
        setSessions(getList(sessionResponse));
      } catch (error) {
        if (cancelled) return;

        const message =
          error.response?.data?.message ||
          "Classes or academic sessions could not be loaded.";

        setLoadError(message);
        toast.error(message);
      } finally {
        if (!cancelled) {
          setLoadingOptions(false);
        }
      }
    };

    loadOptions();

    return () => {
      cancelled = true;
    };
  }, [isOpen, retry]);

  /* -------------------------------------------------------------------------- */
  /*                               Form Handlers                                */
  /* -------------------------------------------------------------------------- */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const handleClose = () => {
    if (saving) return;

    setOpenDropdown(null);
    setErrors({});
    onClose();
  };

  /* -------------------------------------------------------------------------- */
  /*                                  Validation                                */
  /* -------------------------------------------------------------------------- */

  const validateForm = () => {
    const nextErrors = {};

    if (!form.student_id) {
      nextErrors.student_id = "Student is required.";
    }

    if (!form.current_enrollment_id) {
      nextErrors.current_enrollment_id =
        "Current enrollment is required.";
    }

    if (!form.new_class_id) {
      nextErrors.new_class_id = "Please select a new class.";
    }

    if (!form.new_academic_session_id) {
      nextErrors.new_academic_session_id =
        "Please select an academic session.";
    }

    if (!form.enrollment_date) {
      nextErrors.enrollment_date =
        "Enrollment date is required.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please complete all required fields.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loadingOptions || saving) return;

    if (!validateForm()) return;

    await onSubmit({
      student_id: Number(form.student_id),
      current_enrollment_id: Number(
        form.current_enrollment_id
      ),
      new_class_id: Number(form.new_class_id),
      new_academic_session_id: Number(
        form.new_academic_session_id
      ),
      enrollment_date: form.enrollment_date,
      remarks: form.remarks.trim() || null,
    });
  };

  /* -------------------------------------------------------------------------- */
  /*                            Searchable Filters                              */
  /* -------------------------------------------------------------------------- */

  const searchableFilter = (item, search) =>
    String(item.name ?? "")
      .toLowerCase()
      .includes(search.toLowerCase());

  const classFilter = (item, search) => {
    const text = `${item.name ?? ""} ${
      item.section ?? ""
    }`;

    return text.toLowerCase().includes(search.toLowerCase());
  };

  const classLabel = (item) =>
    `${item.name}${
      item.section ? ` - ${item.section}` : ""
    }`;

  /* -------------------------------------------------------------------------- */
  /*                              Select Handler                                */
  /* -------------------------------------------------------------------------- */

  const selectItem = (
    field,
    item,
    setSearch,
    label
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: String(item.id),
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: "",
    }));

    setSearch(label(item));
    setOpenDropdown(null);
  };

  /* -------------------------------------------------------------------------- */
  /*                                   Render                                   */
  /* -------------------------------------------------------------------------- */

  if (!shouldRender) return null;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      title="Promote Student"
      subtitle="Move the student to a new class and academic session."
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

            {/* Student */}
            <FormField
              label="Student"
              name="student_name"
              value={enrollment?.student_name || "Unknown Student"}
              disabled
            />

            {/* Current Class */}
            <FormField
              label="Current Class"
              name="current_class"
              value={enrollment?.class_name || "Unknown Class"}
              disabled
            />

            {/* New Class */}
            <div>
              <SearchableSelect
                label="New Class"
                icon={GraduationCap}
                placeholder="Search new class..."
                searchTerm={classSearch}
                onSearchChange={setClassSearch}
                items={classes}
                isOpen={openDropdown === "class"}
                onOpenChange={(open) =>
                  setOpenDropdown(open ? "class" : null)
                }
                filterFn={classFilter}
                onSelect={(item) =>
                  selectItem(
                    "new_class_id",
                    item,
                    setClassSearch,
                    classLabel
                  )
                }
                itemRenderer={(item) => (
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      {item.name}
                    </p>

                    <p className="text-[11px] text-slate-500">
                      {item.section
                        ? `Section ${item.section}`
                        : `Class ID: ${item.id}`}
                    </p>
                  </div>
                )}
                emptyMessage="No classes found."
              />

              {errors.new_class_id && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.new_class_id}
                </p>
              )}
            </div>

            {/* New Academic Session */}
            <div>
              <SearchableSelect
                label="New Academic Session"
                icon={CalendarDays}
                placeholder="Search academic session..."
                searchTerm={sessionSearch}
                onSearchChange={setSessionSearch}
                items={sessions}
                isOpen={openDropdown === "session"}
                onOpenChange={(open) =>
                  setOpenDropdown(open ? "session" : null)
                }
                filterFn={searchableFilter}
                onSelect={(item) =>
                  selectItem(
                    "new_academic_session_id",
                    item,
                    setSessionSearch,
                    (value) => value.name
                  )
                }
                itemRenderer={(item) => (
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      {item.name}
                    </p>

                    <p className="text-[11px] text-slate-500">
                      Session ID: {item.id}
                    </p>
                  </div>
                )}
                emptyMessage="No academic sessions found."
              />

              {errors.new_academic_session_id && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.new_academic_session_id}
                </p>
              )}
            </div>

            {/* Enrollment Date */}
            <FormField
              label="Enrollment Date"
              name="enrollment_date"
              type="date"
              value={form.enrollment_date}
              onChange={handleChange}
              error={errors.enrollment_date}
              required
              disabled={saving}
            />

            {/* Current Enrollment ID */}
            <FormField
              label="Current Enrollment ID"
              name="current_enrollment_id"
              value={form.current_enrollment_id}
              disabled
            />

            {/* Remarks */}
            <div className="sm:col-span-2">
              <label
                htmlFor="promotion-remarks"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Remarks
              </label>

              <textarea
                id="promotion-remarks"
                name="remarks"
                rows={3}
                maxLength={255}
                value={form.remarks}
                onChange={handleChange}
                placeholder="Optional promotion remarks..."
                disabled={saving}
                className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          {/* Loading */}
          {loadingOptions && (
            <p className="mt-4 text-sm text-slate-500">
              Loading dropdown options...
            </p>
          )}

          {/* Error & Retry */}
          {loadError && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-red-50 p-3">
              <p className="text-sm text-red-600">
                {loadError}
              </p>

              <button
                type="button"
                onClick={() => {
                  setLoadError("");
                  setRetry((previous) => previous + 1);
                }}
                disabled={loadingOptions}
                className="text-sm font-semibold text-red-700 disabled:opacity-50"
              >
                Retry
              </button>
            </div>
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
                loadingOptions ||
                Boolean(loadError) ||
                !form.new_class_id ||
                !form.new_academic_session_id
              }
              className="flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-teal-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Promoting..."
                : "Promote Student"}
            </button>
          </div>
        </form>
      </div>
    </ModalShell>
  );
};

export default StudentPromotionModal;
