/**
 * @file Staff.modal.util.jsx
 * @module StaffModal
 * @description Staff create / update modal with specialization dropdown support.
 */

import { useReducer, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  User,
  Phone,
  FileText,
  Briefcase,
  Clock,
  Banknote,
  Users,
  Edit,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import {
  createStaff,
  updateStaff,
  fetchStaff,
} from "../../../redux/slices/Staff.slice.redux";
import { getAllUsers } from "../../../redux/slices/Auth.slice.redux";
import ModalShell from "../../../shared/ModalShell.shared";
import FormField from "../../../shared/FormField.shared";

/* -------------------------------------------------------------------------- */
/*                                   Constants                                */
/* -------------------------------------------------------------------------- */

const SHIFT_OPTIONS = [
  { value: "morning", label: "Morning" },
  { value: "evening", label: "Evening" },
  { value: "night", label: "Night" },
  { value: "full_day", label: "Full Day" },
];

const SPECIALIZATION_OPTIONS = [
  { value: "General Physician", label: "General Physician" },
  { value: "Cardiologist", label: "Cardiologist" },
  { value: "Dermatologist", label: "Dermatologist" },
  { value: "Pediatrician", label: "Pediatrician" },
  { value: "Neurologist", label: "Neurologist" },
  { value: "Orthopedic Surgeon", label: "Orthopedic Surgeon" },
  { value: "Gynecologist", label: "Gynecologist" },
  { value: "Ophthalmologist", label: "Ophthalmologist" },
  { value: "ENT Specialist", label: "ENT Specialist" },
  { value: "Psychiatrist", label: "Psychiatrist" },
  { value: "Radiologist", label: "Radiologist" },
  { value: "Anesthetist", label: "Anesthetist" },
  { value: "Nurse", label: "Nurse" },
  { value: "Lab Technician", label: "Lab Technician" },
  { value: "Pharmacist", label: "Pharmacist" },
  { value: "Receptionist", label: "Receptionist" },
  { value: "Admin", label: "Admin" },
];

const DAY_OPTIONS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DEFAULT_FORM = {
  user_id: "",
  cnic: "",
  specialization: "",
  phone: "",
  consultation_fee: "",
  basic_salary: "",
  commission: "",
  start_time: "09:00",
  end_time: "17:00",
  shift: "morning",
  available_days: [],
  status: "Active",
};

/* -------------------------------------------------------------------------- */
/*                                    Reducer                                 */
/* -------------------------------------------------------------------------- */

const initialState = { form: DEFAULT_FORM, errors: {}, selectedUser: null };

const reducer = (state, action) => {
  switch (action.type) {
    case "RESET":
      return { form: DEFAULT_FORM, errors: {}, selectedUser: null };
    case "INIT":
      return {
        form: action.form,
        errors: {},
        selectedUser: action.selectedUser ?? null,
      };
    case "SET_FIELD":
      return {
        ...state,
        form: { ...state.form, [action.field]: action.value },
        errors: state.errors[action.field]
          ? { ...state.errors, [action.field]: "" }
          : state.errors,
      };
    case "SET_SELECTED_USER":
      return { ...state, selectedUser: action.user };
    case "TOGGLE_DAY":
      return {
        ...state,
        form: {
          ...state.form,
          available_days: state.form.available_days.includes(action.day)
            ? state.form.available_days.filter((d) => d !== action.day)
            : [...state.form.available_days, action.day],
        },
        errors: state.errors.available_days
          ? { ...state.errors, available_days: "" }
          : state.errors,
      };
    case "SET_ERRORS":
      return { ...state, errors: action.errors };
    default:
      return state;
  }
};

const validate = (form) => {
  const errors = {};
  if (!form.user_id) errors.user_id = "Please select a user";
  if (!form.cnic.trim()) errors.cnic = "CNIC is required";
  else if (!/^\d{13}$/.test(form.cnic.trim()))
    errors.cnic = "CNIC must be exactly 13 digits";
  if (!form.phone.trim()) errors.phone = "Phone number is required";
  else if (!/^[0-9+\-() ]{10,15}$/.test(form.phone.trim()))
    errors.phone = "Phone number is invalid";
  if (!form.specialization)
    errors.specialization = "Specialization is required";
  if (!form.shift) errors.shift = "Shift is required";
  if (form.available_days.length === 0)
    errors.available_days = "At least one available day is required";
  if (!form.start_time) errors.start_time = "Start time is required";
  if (!form.end_time) errors.end_time = "End time is required";
  return errors;
};

/* -------------------------------------------------------------------------- */
/*                                   Component                                */
/* -------------------------------------------------------------------------- */

const StaffModal = ({ isOpen, onClose, staffData = null }) => {
  const dispatch = useDispatch();
  const isEditMode = Boolean(staffData);

  const creating = useSelector((s) => s.staff?.creating ?? false);
  const updating = useSelector((s) => s.staff?.updating ?? false);
  const users = useSelector((s) => s.auth?.users ?? []);
  const usersLoading = useSelector((s) => s.auth?.usersLoading ?? false);

  const isSubmitting = creating || updating;
  const isLoading = isSubmitting || usersLoading;

  const [state, dispatchAction] = useReducer(reducer, initialState);

  /* ------------------------------- Effects ------------------------------- */

  useEffect(() => {
    if (!isOpen) return;
    dispatch(getAllUsers());
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (!isOpen) return;

    if (isEditMode && staffData) {
      const parsedDays = (staffData.available_days || []).map((d) =>
        typeof d === "object" ? d.day : d,
      );

      dispatchAction({
        type: "INIT",
        form: {
          user_id: staffData.user_id || "",
          cnic: staffData.cnic || "",
          specialization: staffData.specialization || "",
          phone: staffData.phone || "",
          consultation_fee: staffData.consultation_fee || "",
          basic_salary: staffData.basic_salary || "",
          commission: staffData.commission || "",
          start_time: staffData.start_time || "09:00",
          end_time: staffData.end_time || "17:00",
          shift: staffData.shift || "morning",
          available_days: parsedDays,
          status: staffData.status || "Active",
        },
        selectedUser: staffData.user || null,
      });
    } else {
      dispatchAction({ type: "RESET" });
    }
  }, [isOpen, isEditMode, staffData]);

  /* ------------------------------ Handlers ------------------------------- */

  const close = useCallback(() => {
    dispatchAction({ type: "RESET" });
    onClose();
  }, [onClose]);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      if (name === "user_id") {
        const user = users.find((u) => u.id === parseInt(value, 10));
        dispatchAction({ type: "SET_SELECTED_USER", user: user || null });
        dispatchAction({ type: "SET_FIELD", field: "user_id", value });
        return;
      }

      if (name === "cnic") {
        dispatchAction({
          type: "SET_FIELD",
          field: "cnic",
          value: value.replace(/\D/g, ""),
        });
        return;
      }

      dispatchAction({ type: "SET_FIELD", field: name, value });
    },
    [users],
  );

  const handleToggleDay = useCallback((day) => {
    dispatchAction({ type: "TOGGLE_DAY", day });
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const errors = validate(state.form);
      dispatchAction({ type: "SET_ERRORS", errors });
      if (Object.keys(errors).length) {
        toast.error("Please fix the errors in the form before submitting.");
        return;
      }

      const payload = {
        user_id: parseInt(state.form.user_id, 10),
        cnic: state.form.cnic.trim(),
        specialization: state.form.specialization?.trim() || "",
        phone: state.form.phone.trim(),
        consultation_fee: state.form.consultation_fee
          ? parseFloat(state.form.consultation_fee)
          : 0,
        basic_salary: state.form.basic_salary
          ? parseFloat(state.form.basic_salary)
          : 0,
        commission: state.form.commission
          ? parseFloat(state.form.commission)
          : 0,
        start_time: state.form.start_time,
        end_time: state.form.end_time,
        shift: state.form.shift.toLowerCase(),
        available_days: state.form.available_days.map((day) => ({
          day,
          available_date: null,
        })),
        status: state.form.status,
      };

      try {
        if (isEditMode) {
          const res = await dispatch(
            updateStaff({ id: staffData.id || staffData._id, ...payload }),
          ).unwrap();
          toast.success(res?.message || "Staff member updated successfully!");
        } else {
          const res = await dispatch(createStaff(payload)).unwrap();
          toast.success(res?.message || "Staff member added successfully!");
        }
        dispatch(fetchStaff());
        close();
      } catch (err) {
        toast.error(
          err?.message ||
            `Failed to ${isEditMode ? "update" : "create"} staff record.`,
        );
        if (err?.errors) {
          const fieldErrors = {};
          Object.keys(err.errors).forEach((k) => {
            fieldErrors[k] = err.errors[k][0];
          });
          dispatchAction({ type: "SET_ERRORS", errors: fieldErrors });
        }
      }
    },
    [state.form, isEditMode, staffData, dispatch, close],
  );

  /* ------------------------- Available users (memo) ---------------------- */

  const availableUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    if (isEditMode) return users;
    return users.filter((u) => !u.isStaff);
  }, [users, isEditMode]);

  const userOptions = useMemo(
    () =>
      availableUsers.map((u) => ({
        value: u.id,
        label: `${u.name} - ${u.email} (${u.role})`,
      })),
    [availableUsers],
  );

  /* ------------------------------- Render -------------------------------- */

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={close}
      disabled={isLoading}
      title={
        <>
          {isEditMode ? "Update Staff Profile" : "Register New Staff Member"}
          <Sparkles size={16} className="text-teal-500 inline ml-1" />
        </>
      }
      subtitle={
        isEditMode
          ? "Update details for selected staff"
          : "Select a user and fill in staff details"
      }
      icon={isEditMode ? <Edit size={22} /> : <User size={22} />}
      iconClass="from-[#034A52] to-teal-500"
      accentShadow="shadow-teal-900/20"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* User Selection */}
          <div className="sm:col-span-2">
            <FormField
              label="Select User"
              icon={Users}
              name="user_id"
              value={state.form.user_id}
              onChange={handleChange}
              disabled={isLoading || isEditMode}
              placeholder="Select a user"
              error={state.errors.user_id}
              options={userOptions}
              required
            />
          </div>

          {/* Selected user preview */}
          {state.selectedUser && (
            <div className="sm:col-span-2 bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                User Details
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <InfoRow label="Name" value={state.selectedUser.name} />
                <InfoRow label="Email" value={state.selectedUser.email} />
                <InfoRow label="Role" value={state.selectedUser.role} />
                <InfoRow label="ID" value={`#${state.selectedUser.id}`} />
              </div>
            </div>
          )}

          <FormField
            label="CNIC"
            icon={FileText}
            name="cnic"
            value={state.form.cnic}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="3840320782279"
            maxLength={13}
            error={state.errors.cnic}
            required
          />

          <FormField
            label="Phone"
            icon={Phone}
            name="phone"
            type="tel"
            value={state.form.phone}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="03090207411"
            error={state.errors.phone}
            required
          />

          <FormField
            label="Specialization"
            icon={Briefcase}
            name="specialization"
            value={state.form.specialization}
            onChange={handleChange}
            disabled={isLoading}
            error={state.errors.specialization}
            options={SPECIALIZATION_OPTIONS}
            required
          />

          <FormField
            label="Consultation Fee (PKR)"
            hint="Optional"
            icon={Banknote}
            name="consultation_fee"
            type="number"
            min="0"
            value={state.form.consultation_fee}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="1500"
          />

          <FormField
            label="Basic Salary (PKR)"
            hint="Optional"
            icon={Banknote}
            name="basic_salary"
            type="number"
            min="0"
            step="0.01"
            value={state.form.basic_salary}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="45000.00"
          />

          <FormField
            label="Commission (PKR)"
            hint="Optional"
            icon={Banknote}
            name="commission"
            type="number"
            min="0"
            value={state.form.commission}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="500"
          />

          <FormField
            label="Start Time"
            icon={Clock}
            name="start_time"
            type="time"
            value={state.form.start_time}
            onChange={handleChange}
            disabled={isLoading}
            error={state.errors.start_time}
            required
          />

          <FormField
            label="End Time"
            icon={Clock}
            name="end_time"
            type="time"
            value={state.form.end_time}
            onChange={handleChange}
            disabled={isLoading}
            error={state.errors.end_time}
            required
          />

          <FormField
            label="Shift"
            icon={Clock}
            name="shift"
            value={state.form.shift}
            onChange={handleChange}
            disabled={isLoading}
            error={state.errors.shift}
            options={SHIFT_OPTIONS}
            required
          />
        </div>

        {/* Available Days */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Available Days <span className="text-rose-500">*</span>
          </label>
          <div className="flex flex-wrap gap-3">
            {DAY_OPTIONS.map((day) => (
              <label
                key={day}
                className="flex items-center gap-2 cursor-pointer rounded-xl border border-slate-200 px-3 py-2 bg-slate-50/50 hover:bg-slate-100 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={state.form.available_days.includes(day)}
                  onChange={() => handleToggleDay(day)}
                  disabled={isLoading}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-xs font-medium text-slate-700">
                  {day}
                </span>
              </label>
            ))}
          </div>
          {state.errors.available_days && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-500">
              <AlertCircle size={12} /> {state.errors.available_days}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={close}
            disabled={isLoading}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-xl bg-gradient-to-r from-[#034A52] to-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-900/20 hover:shadow-teal-900/30 hover:opacity-95 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                {isEditMode ? "Updating..." : "Saving..."}
              </>
            ) : (
              <>
                <User size={16} />
                {isEditMode ? "Update Staff" : "Add Staff Member"}
              </>
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

const InfoRow = ({ label, value }) => (
  <div>
    <span className="text-slate-500">{label}:</span>
    <span className="ml-2 font-medium text-slate-800">{value || "N/A"}</span>
  </div>
);

export default StaffModal;
