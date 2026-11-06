import { useEffect, useState } from "react";
import {
  CalendarDays,
  GraduationCap,
  Clock,
  BookOpen,
  UserRound,
} from "lucide-react";

import ModalShell from "../../../shared/ModalShell.shared";
import FormField from "../../../shared/FormField.shared";
import SearchableSelect from "../../../shared/SearchableSelect.shared";
import { useModalAnimation } from "../../../shared/useModalAnimation.hook";

const EMPTY_FORM = {
  class_id: "",
  period_id: "",
  subject_id: "",
  teacher_id: "",
  day: "monday",
  room_number: "",
  status: "active",
};

const DAYS = [
  { value: "regular", label: "Regular" },
  { value: "friday", label: "Friday" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const formatTime = (time) =>
  time ? String(time).slice(0, 5) : "";

const TimetableModal = ({
  isOpen,
  onClose,
  onSubmit,
  selectedTimetable,
  initialData = null,
  classes = [],
  subjects = [],
  teachers = [],
  periods = [],
  saving = false,
}) => {
  const { shouldRender, isAnimating } =
    useModalAnimation(isOpen, 300);

  const [form, setForm] = useState({ ...EMPTY_FORM });

  const [classSearch, setClassSearch] = useState("");
  const [periodSearch, setPeriodSearch] = useState("");
  const [subjectSearch, setSubjectSearch] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");

  const [openDropdown, setOpenDropdown] = useState(null);

  const isEdit = Boolean(selectedTimetable?.id);

useEffect(() => {
  if (!isOpen) return;

  const source = selectedTimetable || initialData || {};

  const nextForm = {
    ...EMPTY_FORM,
    class_id: String(source.class_id ?? ""),
    period_id: String(source.period_id ?? ""),
    subject_id: String(source.subject_id ?? ""),
    teacher_id: String(source.teacher_id ?? ""),
    day: source.day ?? "regular",
    room_number: source.room_number ?? "",
    status: source.status ?? "active",
  };

  setForm(nextForm);

  const selectedClass = classes.find(
    (item) => String(item.id) === nextForm.class_id
  );

  const selectedPeriod = periods.find(
    (item) => String(item.id) === nextForm.period_id
  );

  const selectedSubject = subjects.find(
    (item) => String(item.id) === nextForm.subject_id
  );

  const selectedTeacher = teachers.find(
    (item) => String(item.id) === nextForm.teacher_id
  );

  setClassSearch(selectedClass?.name ?? "");

  setPeriodSearch(
    selectedPeriod
      ? `${selectedPeriod.name} (${formatTime(
          selectedPeriod.start_time
        )} - ${formatTime(selectedPeriod.end_time)})`
      : ""
  );

  setSubjectSearch(selectedSubject?.name ?? "");
  setTeacherSearch(selectedTeacher?.name ?? "");
  setOpenDropdown(null);
}, [
  isOpen,
  selectedTimetable,
  initialData,
  classes,
  periods,
  subjects,
  teachers,
]);

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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.class_id ||
      !form.period_id ||
      !form.subject_id ||
      !form.day ||
      !form.status
    ) {
      return;
    }

    onSubmit({
      class_id: Number(form.class_id),
      period_id: Number(form.period_id),
      subject_id: Number(form.subject_id),
      teacher_id: form.teacher_id
        ? Number(form.teacher_id)
        : null,
      day: form.day,
      room_number: form.room_number.trim() || null,
      status: form.status,
    });
  };

  const searchableFilter = (item, search) =>
    String(item.name ?? "")
      .toLowerCase()
      .includes(search.toLowerCase());

  const periodFilter = (item, search) => {
    const text = `${item.name ?? ""} ${formatTime(
      item.start_time
    )} ${formatTime(item.end_time)}`;

    return text.toLowerCase().includes(search.toLowerCase());
  };

  const periodLabel = (item) =>
    `${item.name} (${formatTime(item.start_time)} - ${formatTime(
      item.end_time
    )})`;

  const selectItem = (field, item, setSearch, label) => {
    setForm((prev) => ({
      ...prev,
      [field]: String(item.id),
    }));

    setSearch(label(item));
    setOpenDropdown(null);
  };

  if (!shouldRender) return null;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? "Update Timetable" : "Add Timetable"}
      subtitle="Assign a subject to a class period."
      icon={<CalendarDays size={22} />}
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
            {/* Class */}
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
              filterFn={searchableFilter}
              onSelect={(item) =>
                selectItem(
                  "class_id",
                  item,
                  setClassSearch,
                  (value) => value.name
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

            {/* Period */}
            <SearchableSelect
              label="Period"
              icon={Clock}
              placeholder="Search period or time..."
              searchTerm={periodSearch}
              onSearchChange={setPeriodSearch}
              items={periods}
              isOpen={openDropdown === "period"}
              onOpenChange={(open) =>
                setOpenDropdown(open ? "period" : null)
              }
              filterFn={periodFilter}
              onSelect={(item) =>
                selectItem(
                  "period_id",
                  item,
                  setPeriodSearch,
                  periodLabel
                )
              }
              itemRenderer={(item) => (
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {formatTime(item.start_time)} -{" "}
                    {formatTime(item.end_time)}
                  </p>
                </div>
              )}
              emptyMessage="No periods found."
            />

            {/* Subject */}
            <SearchableSelect
              label="Subject"
              icon={BookOpen}
              placeholder="Search subject..."
              searchTerm={subjectSearch}
              onSearchChange={setSubjectSearch}
              items={subjects}
              isOpen={openDropdown === "subject"}
              onOpenChange={(open) =>
                setOpenDropdown(open ? "subject" : null)
              }
              filterFn={searchableFilter}
              onSelect={(item) =>
                selectItem(
                  "subject_id",
                  item,
                  setSubjectSearch,
                  (value) => value.name
                )
              }
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
              emptyMessage="No subjects found."
            />

            {/* Optional Teacher */}
            <SearchableSelect
              label="Teacher (Optional)"
              icon={UserRound}
              placeholder="Search teacher..."
              searchTerm={teacherSearch}
              onSearchChange={setTeacherSearch}
              items={teachers}
              isOpen={openDropdown === "teacher"}
              onOpenChange={(open) =>
                setOpenDropdown(open ? "teacher" : null)
              }
              filterFn={(item, search) =>
                `${item.name ?? ""} ${item.email ?? ""} ${
                  item.phone ?? ""
                }`
                  .toLowerCase()
                  .includes(search.toLowerCase())
              }
              onSelect={(item) =>
                selectItem(
                  "teacher_id",
                  item,
                  setTeacherSearch,
                  (value) => value.name
                )
              }
              itemRenderer={(item) => (
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {item.email ||
                      item.phone ||
                      `Teacher ID: ${item.id}`}
                  </p>
                </div>
              )}
              emptyMessage="No teachers found."
            />

            {/* Day */}
            <FormField
              label="Day"
              name="day"
              value={form.day}
              onChange={handleChange}
              options={DAYS}
              required
              disabled={saving}
            />

            {/* Room Number */}
            <FormField
              label="Room Number"
              name="room_number"
              value={form.room_number}
              onChange={handleChange}
              placeholder="e.g. Room 101"
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
              disabled={
                saving ||
                !form.class_id ||
                !form.period_id ||
                !form.subject_id
              }
              className="flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-teal-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : isEdit
                  ? "Update Timetable"
                  : "Save Timetable"}
            </button>
          </div>
        </form>
      </div>
    </ModalShell>
  );
};

export default TimetableModal;
