
import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  UserRound,
  ClipboardCheck,
} from "lucide-react";

import ModalShell from "../../../shared/ModalShell.shared";
import FormField from "../../../shared/FormField.shared";
import SearchableSelect from "../../../shared/SearchableSelect.shared";
import { useModalAnimation } from "../../../shared/useModalAnimation.hook";

const EMPTY_FORM = {
  user_id: "",
  attendance_date: new Date().toISOString().split("T")[0],
  check_in: "",
  check_out: "",
  status: "present",
  remarks: "",
};

const STATUS_OPTIONS = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "late", label: "Late" },
  { value: "leave", label: "Leave" },
];

const StaffAttendanceModal = ({
  isOpen,
  onClose,
  attendanceData,
  onSubmit,
  staffOptions = [],
  saving = false,
}) => {
  const { shouldRender, isAnimating } =
    useModalAnimation(isOpen, 300);

  const [form, setForm] = useState({ ...EMPTY_FORM });

  const [staffSearch, setStaffSearch] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [errors, setErrors] = useState({});

  const isEdit = Boolean(attendanceData?.id);

  // Initialize form
  useEffect(() => {
    if (!isOpen) return;

    const source = attendanceData || {};

    const nextForm = {
      ...EMPTY_FORM,
      user_id: String(source.user_id ?? ""),
      attendance_date:
        source.attendance_date ?? EMPTY_FORM.attendance_date,
      check_in: source.check_in?.slice(0, 5) || "",
      check_out: source.check_out?.slice(0, 5) || "",
      status: source.status || "present",
      remarks: source.remarks || "",
    };

    setForm(nextForm);

    const selectedStaff = staffOptions.find(
      (item) => String(item.value) === nextForm.user_id
    );

    setStaffSearch(
      selectedStaff?.label || source.user_name || ""
    );

    setOpenDropdown(null);
    setErrors({});
  }, [isOpen, attendanceData, staffOptions]);

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

  // Staff search filter
  const staffFilter = (item, search) =>
    `${item.label ?? ""} ${item.role ?? ""} ${item.value ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase());

  // Select staff
  const handleSelectStaff = (item) => {
    setForm((prev) => ({
      ...prev,
      user_id: String(item.value),
    }));

    setStaffSearch(item.label);
    setOpenDropdown(null);

    setErrors((prev) => ({
      ...prev,
      user_id: "",
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

    if (!form.user_id) {
      newErrors.user_id = "Please select a staff member.";
    }

    if (!form.attendance_date) {
      newErrors.attendance_date =
        "Attendance date is required.";
    }

    if (!form.status) {
      newErrors.status =
        "Please select attendance status.";
    }

    if (
      form.check_in &&
      form.check_out &&
      form.check_out <= form.check_in
    ) {
      newErrors.check_out =
        "Check-out must be after check-in.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      user_id: Number(form.user_id),
      attendance_date: form.attendance_date,
      check_in: form.check_in || null,
      check_out: form.check_out || null,
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
          ? "Update Staff Attendance"
          : "Mark Staff Attendance"
      }
      subtitle="Record and manage staff attendance details."
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

            {/* Staff Member */}
            <div>
              <SearchableSelect
                label="Staff Member"
                icon={UserRound}
                placeholder="Search staff member..."
                searchTerm={staffSearch}
                onSearchChange={(value) => {
                  setStaffSearch(value);

                  setForm((prev) => ({
                    ...prev,
                    user_id: "",
                  }));

                  setErrors((prev) => ({
                    ...prev,
                    user_id: "",
                  }));
                }}
                items={staffOptions}
                isOpen={openDropdown === "staff"}
                onOpenChange={(open) =>
                  setOpenDropdown(open ? "staff" : null)
                }
                filterFn={staffFilter}
                onSelect={handleSelectStaff}
                itemRenderer={(item) => (
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        {item.label}
                      </p>

                      <p className="text-[11px] text-slate-500">
                        {item.role || "Staff"}
                      </p>
                    </div>

                    <span className="text-[11px] text-slate-400">
                      ID: {item.value}
                    </span>
                  </div>
                )}
                emptyMessage="No staff members found."
              />

              {errors.user_id && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.user_id}
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

            {/* Check In */}
            <div>
              <FormField
                label="Check In"
                name="check_in"
                type="time"
                value={form.check_in}
                onChange={handleChange}
                disabled={saving}
              />
            </div>

            {/* Check Out */}
            <div>
              <FormField
                label="Check Out"
                name="check_out"
                type="time"
                value={form.check_out}
                onChange={handleChange}
                disabled={saving}
              />

              {errors.check_out && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.check_out}
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
                  console.log("Remarks typed:", e.target.value);

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

export default StaffAttendanceModal;
