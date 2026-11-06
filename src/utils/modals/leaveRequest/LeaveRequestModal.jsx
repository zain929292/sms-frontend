
import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  UserRound,
  FileText,
} from "lucide-react";

import ModalShell from "../../../shared/ModalShell.shared";
import FormField from "../../../shared/FormField.shared";
import SearchableSelect from "../../../shared/SearchableSelect.shared";
import { useModalAnimation } from "../../../shared/useModalAnimation.hook";

const EMPTY_FORM = {
  user_id: "",
  leave_type: "",
  start_date: "",
  end_date: "",
  reason: "",
};

const LEAVE_TYPE_OPTIONS = [
  { value: "casual", label: "Casual Leave" },
  { value: "sick", label: "Sick Leave" },
  { value: "annual", label: "Annual Leave" },
  { value: "emergency", label: "Emergency Leave" },
  { value: "other", label: "Other" },
];

const LeaveRequestModal = ({
  isOpen,
  onClose,
  leaveRequestData,
  onSubmit,
  userOptions = [],
  saving = false,
  currentUserId = null,
  isAdmin = false,
}) => {
  const { shouldRender, isAnimating } =
    useModalAnimation(isOpen, 300);

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [userSearch, setUserSearch] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [errors, setErrors] = useState({});

  const isEdit = Boolean(leaveRequestData?.id);

  // Initialize form
  useEffect(() => {
    if (!isOpen) return;

    const source = leaveRequestData || {};

    const nextForm = {
      ...EMPTY_FORM,
      user_id: String(
        source.user_id ?? currentUserId ?? ""
      ),
      leave_type: source.leave_type || "",
      start_date: source.start_date || "",
      end_date: source.end_date || "",
      reason: source.reason || "",
    };

    setForm(nextForm);

    const selectedUser = userOptions.find(
      (item) => String(item.value) === nextForm.user_id
    );

    setUserSearch(
      selectedUser?.label || source.user_name || ""
    );

    setOpenDropdown(null);
    setErrors({});
  }, [
    isOpen,
    leaveRequestData,
    userOptions,
    currentUserId,
  ]);

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

  // User search filter
  const userFilter = (item, search) =>
    `${item.label ?? ""} ${item.role ?? ""} ${item.value ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase());

  // Select user
  const handleSelectUser = (item) => {
    setForm((prev) => ({
      ...prev,
      user_id: String(item.value),
    }));

    setUserSearch(item.label);
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

    if (isAdmin && !form.user_id) {
      newErrors.user_id = "Please select a user.";
    }

    if (!form.leave_type) {
      newErrors.leave_type = "Please select leave type.";
    }

    if (!form.start_date) {
      newErrors.start_date = "Start date is required.";
    }

    if (!form.end_date) {
      newErrors.end_date = "End date is required.";
    }

    if (
      form.start_date &&
      form.end_date &&
      form.end_date < form.start_date
    ) {
      newErrors.end_date =
        "End date must be after or equal to start date.";
    }

    if (!form.reason.trim()) {
      newErrors.reason = "Leave reason is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      leave_type: form.leave_type,
      start_date: form.start_date,
      end_date: form.end_date,
      reason: form.reason.trim(),
    };

    if (isAdmin) {
      payload.user_id = Number(form.user_id);
    }

    onSubmit(payload);
  };

  if (!shouldRender) return null;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      title={
        isEdit
          ? "Update Leave Request"
          : "Create Leave Request"
      }
      subtitle="Submit and manage leave request details."
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

            {/* User */}
            {isAdmin && (
              <div className="sm:col-span-2">
                <SearchableSelect
                  label="User"
                  icon={UserRound}
                  placeholder="Search user..."
                  searchTerm={userSearch}
                  onSearchChange={(value) => {
                    setUserSearch(value);

                    setForm((prev) => ({
                      ...prev,
                      user_id: "",
                    }));

                    setErrors((prev) => ({
                      ...prev,
                      user_id: "",
                    }));
                  }}
                  items={userOptions}
                  isOpen={openDropdown === "user"}
                  onOpenChange={(open) =>
                    setOpenDropdown(open ? "user" : null)
                  }
                  filterFn={userFilter}
                  onSelect={handleSelectUser}
                  itemRenderer={(item) => (
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-800">
                          {item.label}
                        </p>

                        <p className="text-[11px] text-slate-500">
                          {item.role || "User"}
                        </p>
                      </div>

                      <span className="text-[11px] text-slate-400">
                        ID: {item.value}
                      </span>
                    </div>
                  )}
                  emptyMessage="No users found."
                />

                {errors.user_id && (
                  <p className="mt-1 text-xs font-medium text-red-500">
                    {errors.user_id}
                  </p>
                )}
              </div>
            )}

            {/* Leave Type */}
            <div>
              <FormField
                label="Leave Type"
                name="leave_type"
                value={form.leave_type}
                onChange={handleChange}
                options={LEAVE_TYPE_OPTIONS}
                required
                disabled={saving}
              />

              {errors.leave_type && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.leave_type}
                </p>
              )}
            </div>

            {/* Start Date */}
            <div>
              <FormField
                label="Start Date"
                name="start_date"
                type="date"
                value={form.start_date}
                onChange={handleChange}
                required
                disabled={saving}
              />

              {errors.start_date && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.start_date}
                </p>
              )}
            </div>

            {/* End Date */}
            <div>
              <FormField
                label="End Date"
                name="end_date"
                type="date"
                value={form.end_date}
                onChange={handleChange}
                required
                disabled={saving}
              />

              {errors.end_date && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.end_date}
                </p>
              )}
            </div>

            {/* Reason */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Leave Reason
              </label>

              <textarea
                name="reason"
                rows={3}
                maxLength={1000}
                value={form.reason}
                onChange={handleChange}
                disabled={saving}
                placeholder="Enter reason for leave..."
                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:opacity-50"
              />

              {errors.reason && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.reason}
                </p>
              )}

              <p className="mt-1 text-right text-[11px] text-slate-400">
                {form.reason.length}/1000
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
                  ? "Update Leave Request"
                  : "Submit Leave Request"}
            </button>
          </div>
        </form>
      </div>
    </ModalShell>
  );
};

export default LeaveRequestModal;
