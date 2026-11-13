
import { useEffect, useState } from "react";
import {
  GraduationCap,
  UserRound,
  CalendarDays,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../../redux/config/Api.redux";

import ModalShell from "../../../shared/ModalShell.shared";
import FormField from "../../../shared/FormField.shared";
import SearchableSelect from "../../../shared/SearchableSelect.shared";
import { useModalAnimation } from "../../../shared/useModalAnimation.hook";

const EMPTY_FORM = {
  student_id: "",
  roll_number: "",
  class_id: "",
  academic_session_id: "",
  enrollment_date: new Date().toISOString().slice(0, 10),
  status: "active",
  remarks: "",
};

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "promoted", label: "Promoted" },
  { value: "completed", label: "Completed" },
  { value: "withdrawn", label: "Withdrawn" },
];

const getList = (response) => {
  const payload = response?.data;

  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.students)) return payload.students;
  if (Array.isArray(payload?.classes)) return payload.classes;
  if (Array.isArray(payload?.academic_sessions)) {
    return payload.academic_sessions;
  }
  if (Array.isArray(payload)) return payload;

  return [];
};

const StudentEnrollmentModal = ({
  isOpen,
  onClose,
  enrollmentData,
  onSubmit,
  saving = false,
}) => {
  const { shouldRender, isAnimating } =
    useModalAnimation(isOpen, 300);

  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */

  const [form, setForm] = useState({ ...EMPTY_FORM });

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [studentSearch, setStudentSearch] = useState("");
  const [classSearch, setClassSearch] = useState("");
  const [sessionSearch, setSessionSearch] = useState("");

  const [openDropdown, setOpenDropdown] = useState(null);

  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [retry, setRetry] = useState(0);

  const [errors, setErrors] = useState({});

  const isEdit = Boolean(enrollmentData?.id);

  /* -------------------------------------------------------------------------- */
  /*                              Initialize Form                               */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!isOpen) return;

    const source = enrollmentData || {};

    const nextForm = {
      ...EMPTY_FORM,
      student_id: String(source.student_id ?? ""),
      roll_number: source.roll_number ?? "",
      class_id: String(source.class_id ?? ""),
      academic_session_id: String(
        source.academic_session_id ?? ""
      ),
      enrollment_date:
        source.enrollment_date?.substring(0, 10) ||
        EMPTY_FORM.enrollment_date,
      status: source.status || "active",
      remarks: source.remarks || "",
    };

    setForm(nextForm);

    const selectedStudent = students.find(
      (item) => String(item.id) === nextForm.student_id
    );

    const selectedClass = classes.find(
      (item) => String(item.id) === nextForm.class_id
    );

    const selectedSession = sessions.find(
      (item) => String(item.id) === nextForm.academic_session_id
    );

    setStudentSearch(
      selectedStudent
        ? `${selectedStudent.name}${
            selectedStudent.admission_number
              ? ` (${selectedStudent.admission_number})`
              : ""
          }`
        : ""
    );

    setClassSearch(
      selectedClass
        ? `${selectedClass.name}${
            selectedClass.section
              ? ` - ${selectedClass.section}`
              : ""
          }`
        : ""
    );

    setSessionSearch(selectedSession?.name ?? "");

    setErrors({});
    setLoadError("");
    setOpenDropdown(null);
  }, [isOpen, enrollmentData, students, classes, sessions]);

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
        const [studentRes, classRes, sessionRes] =
          await Promise.all([
            api.get("/student/details", {
              params: { limit: 500 },
            }),
            api.get("/class/details"),
            api.get("/academic-session/details"),
          ]);

        if (cancelled) return;

        setStudents(getList(studentRes));
        setClasses(getList(classRes));
        setSessions(getList(sessionRes));
      } catch (error) {
        if (cancelled) return;

        const message =
          error.response?.data?.message ||
          "Failed to load dropdown options.";

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
    onClose();
  };

  /* -------------------------------------------------------------------------- */
  /*                               Submit Handler                               */
  /* -------------------------------------------------------------------------- */

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!form.student_id) {
      nextErrors.student_id = "Please select a student.";
    }

    if (!form.roll_number.trim()) {
      nextErrors.roll_number = "Roll number is required.";
    }

    if (!form.class_id) {
      nextErrors.class_id = "Please select a class.";
    }

    if (!form.academic_session_id) {
      nextErrors.academic_session_id =
        "Please select an academic session.";
    }

    if (!form.enrollment_date) {
      nextErrors.enrollment_date =
        "Enrollment date is required.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("Please complete all required fields.");
      return;
    }

    setErrors({});

    await onSubmit({
      student_id: Number(form.student_id),
      roll_number: form.roll_number.trim(),
      class_id: Number(form.class_id),
      academic_session_id: Number(form.academic_session_id),
      enrollment_date: form.enrollment_date || null,
      status: form.status,
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

  const studentFilter = (item, search) => {
    const text = `${item.name ?? ""} ${
      item.admission_number ?? ""
    }`;

    return text.toLowerCase().includes(search.toLowerCase());
  };

  const classFilter = (item, search) => {
    const text = `${item.name ?? ""} ${
      item.section ?? ""
    }`;

    return text.toLowerCase().includes(search.toLowerCase());
  };

  const studentLabel = (item) =>
    `${item.name}${
      item.admission_number
        ? ` (${item.admission_number})`
        : ""
    }`;

  const classLabel = (item) =>
    `${item.name}${
      item.section ? ` - ${item.section}` : ""
    }`;

  /* -------------------------------------------------------------------------- */
  /*                              Select Handler                                */
  /* -------------------------------------------------------------------------- */

  const selectItem = (field, item, setSearch, label) => {
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
      title={isEdit ? "Edit Enrollment" : "Student Enrollment"}
      subtitle="Assign a student to a class and academic session."
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
            <div>
              <SearchableSelect
                label="Student"
                icon={UserRound}
                placeholder="Search student..."
                searchTerm={studentSearch}
                onSearchChange={setStudentSearch}
                items={students}
                isOpen={openDropdown === "student"}
                onOpenChange={(open) =>
                  setOpenDropdown(open ? "student" : null)
                }
                filterFn={studentFilter}
                onSelect={(item) =>
                  selectItem(
                    "student_id",
                    item,
                    setStudentSearch,
                    studentLabel
                  )
                }
                itemRenderer={(item) => (
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      {item.name}
                    </p>

                    <p className="text-[11px] text-slate-500">
                      {item.admission_number
                        ? `Admission No: ${item.admission_number}`
                        : `Student ID: ${item.id}`}
                    </p>
                  </div>
                )}
                emptyMessage="No students found."
              />

              {errors.student_id && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.student_id}
                </p>
              )}
            </div>

            {/* Roll Number */}
            <FormField
              label="Roll Number"
              name="roll_number"
              value={form.roll_number}
              onChange={handleChange}
              placeholder="Enter roll number"
              error={errors.roll_number}
              required
              disabled={saving}
            />

            {/* Class */}
            <div>
              <SearchableSelect
                label="Class"
                icon={GraduationCap}
                placeholder="Search class..."
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
                    "class_id",
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

              {errors.class_id && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.class_id}
                </p>
              )}
            </div>

            {/* Academic Session */}
            <div className="sm:col-span-2">
              <SearchableSelect
                label="Academic Session"
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
                    "academic_session_id",
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

              {errors.academic_session_id && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.academic_session_id}
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

            {/* Status */}
            <FormField
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              options={STATUS_OPTIONS}
              required
              disabled={saving}
            />

            {/* Remarks */}
            <div className="sm:col-span-2">
              <label
                htmlFor="enrollment-remarks"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Remarks
              </label>

              <textarea
                id="enrollment-remarks"
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                placeholder="Enter remarks"
                rows={3}
                disabled={saving}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 disabled:opacity-60"
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
                !form.student_id ||
                !form.roll_number.trim() ||
                !form.class_id ||
                !form.academic_session_id
              }
              className="flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-teal-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : isEdit
                  ? "Update Enrollment"
                  : "Enroll Student"}
            </button>
          </div>
        </form>
      </div>
    </ModalShell>
  );
};

export default StudentEnrollmentModal;
