/**
 * @file Patient.modal.util.jsx
 * @module PatientModal
 * @description Patient create/edit modal.
 */

import { useReducer, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  User,
  Phone,
  Calendar,
  Droplet,
  UserCircle,
  Home,
  ShieldAlert,
  FileText,
  Loader2,
  Edit,
  Sparkles,
} from "lucide-react";
import {
  createPatient,
  updatePatient,
  fetchPatients,
} from "../../../redux/slices/Patients.slice.redux";
import ModalShell from "../../../shared/ModalShell.shared";
import FormField from "../../../shared/FormField.shared";

/* ------------------------------- Constants ------------------------------- */

const DEFAULT_FORM = {
  cnic: "",
  name: "",
  father_name: "",
  gender: "Male",
  age: "",
  phone: "",
  blood_group: "B+",
  address: "",
  emergency_contact: "",
};

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["Male", "Female", "Other"];

const CNIC_REGEX = /^\d{5}-\d{7}-\d{1}$/;
const CNIC_DIGITS_REGEX = /^\d{13}$/;
const PHONE_REGEX = /^[0-9+\-() ]{7,15}$/;

/* ------------------------------- Reducer --------------------------------- */

const initialState = { form: DEFAULT_FORM, errors: {} };

const reducer = (state, action) => {
  switch (action.type) {
    case "RESET":
      return { form: DEFAULT_FORM, errors: {} };
    case "INIT":
      return { form: action.form, errors: {} };
    case "SET_FIELD":
      return {
        ...state,
        form: { ...state.form, [action.field]: action.value },
        errors: state.errors[action.field]
          ? { ...state.errors, [action.field]: "" }
          : state.errors,
      };
    case "SET_ERRORS":
      return { ...state, errors: action.errors };
    default:
      return state;
  }
};

/* ------------------------------- Validation ------------------------------ */

const validateForm = (form) => {
  const errors = {};

  if (!form.name.trim()) errors.name = "Patient name is required";
  if (!form.father_name.trim()) errors.father_name = "Father name is required";

  if (form.cnic.trim()) {
    const c = form.cnic.trim();
    if (!CNIC_REGEX.test(c) && !CNIC_DIGITS_REGEX.test(c)) {
      errors.cnic = "Invalid CNIC format (e.g., 35202-1254367-1)";
    }
  }

  if (form.phone.trim() && !PHONE_REGEX.test(form.phone.trim())) {
    errors.phone = "Phone number is invalid";
  }

  if (
    form.emergency_contact.trim() &&
    !PHONE_REGEX.test(form.emergency_contact.trim())
  ) {
    errors.emergency_contact = "Emergency contact number is invalid";
  }

  if (!form.age || form.age < 1 || form.age > 150) {
    errors.age = "Age must be between 1 and 150";
  }

  if (!form.address.trim()) errors.address = "Address is required";
  if (!form.gender) errors.gender = "Gender is required";
  if (!form.blood_group) errors.blood_group = "Blood group is required";

  return errors;
};

/* ------------------------------- Component ------------------------------- */

const PatientModal = ({
  isOpen,
  onClose,
  patientData = null,
  readOnly = false,
}) => {
  const dispatch = useDispatch();
  const isEditMode = Boolean(patientData);

  const { creating, updating, loading } = useSelector(
    (s) => s.patient ?? { creating: false, updating: false, loading: false },
  );
  const isLoading = creating || updating || loading;

  const [state, dispatchAction] = useReducer(reducer, initialState);

  // Reset / populate form when modal opens
  useEffect(() => {
    if (!isOpen) return;
    if (patientData) {
      dispatchAction({
        type: "INIT",
        form: {
          cnic: patientData.cnic || "",
          name: patientData.name || "",
          father_name: patientData.father_name || "",
          gender: patientData.gender || "Male",
          age: patientData.age ?? "",
          phone: patientData.phone || "",
          blood_group: patientData.blood_group || "B+",
          address: patientData.address || "",
          emergency_contact: patientData.emergency_contact || "",
        },
      });
    } else {
      dispatchAction({ type: "RESET" });
    }
  }, [isOpen, patientData]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    dispatchAction({ type: "SET_FIELD", field: name, value });
  }, []);

  const close = useCallback(() => {
    dispatchAction({ type: "RESET" });
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (readOnly) return;

      const errors = validateForm(state.form);
      dispatchAction({ type: "SET_ERRORS", errors });

      if (Object.keys(errors).length > 0) {
        toast.error("Please fix the errors in the form before submitting.");
        return;
      }

      const payload = {
        cnic: state.form.cnic.trim(),
        name: state.form.name.trim(),
        father_name: state.form.father_name.trim(),
        gender: state.form.gender,
        age: parseInt(state.form.age, 10),
        phone: state.form.phone.trim(),
        blood_group: state.form.blood_group,
        address: state.form.address.trim(),
        emergency_contact: state.form.emergency_contact.trim(),
      };

      try {
        if (isEditMode) {
          const id = patientData.id || patientData._id;
          const res = await dispatch(
            updatePatient({ id, data: payload }),
          ).unwrap();
          toast.success(res?.message || "Patient record updated successfully!");
        } else {
          const res = await dispatch(createPatient(payload)).unwrap();
          toast.success(res?.message || "Patient added successfully!");
        }
        dispatch(fetchPatients());
        close();
      } catch (err) {
        const message =
          typeof err === "string"
            ? err
            : err?.message ||
            `Failed to ${isEditMode ? "update" : "create"} patient record.`;
        toast.error(message);
      }
    },
    [state.form, isEditMode, patientData, dispatch, close, readOnly],
  );

  const fieldsDisabled = useMemo(
    () => isLoading || readOnly,
    [isLoading, readOnly],
  );

  if (!isOpen) return null;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={close}
      disabled={isLoading}
      title={
        <>
          {isEditMode ? "Update Patient Profile" : "Register New Patient"}
          <Sparkles size={16} className="text-teal-500 inline ml-1" />
        </>
      }
      subtitle={
        isEditMode
          ? "Update existing details in the system"
          : "Enter mandatory clinical and personal records"
      }
      icon={isEditMode ? <Edit size={22} /> : <User size={22} />}
      iconClass="from-[#034A52] to-teal-500"
      accentShadow="shadow-teal-900/20"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField
            label="Full Name"
            icon={User}
            name="name"
            value={state.form.name}
            onChange={handleChange}
            disabled={fieldsDisabled}
            placeholder="e.g. Imran Yousuf"
            error={state.errors.name}
            required
          />

          <FormField
            label="Father Name"
            icon={User}
            name="father_name"
            value={state.form.father_name}
            onChange={handleChange}
            disabled={fieldsDisabled}
            placeholder="e.g. Muhammad Aslam"
            error={state.errors.father_name}
            required
          />

          <FormField
            label="CNIC Number"
            hint="Optional"
            icon={FileText}
            name="cnic"
            value={state.form.cnic}
            onChange={handleChange}
            disabled={fieldsDisabled}
            placeholder="35202-1254367-1"
            error={state.errors.cnic}
          />

          <FormField
            label="Age"
            icon={Calendar}
            name="age"
            type="number"
            min="1"
            max="150"
            value={state.form.age}
            onChange={handleChange}
            disabled={fieldsDisabled}
            placeholder="25"
            error={state.errors.age}
            required
          />

          <FormField
            label="Phone Number"
            hint="Optional"
            icon={Phone}
            name="phone"
            type="tel"
            value={state.form.phone}
            onChange={handleChange}
            disabled={fieldsDisabled}
            placeholder="03001234567"
            error={state.errors.phone}
          />

          <FormField
            label="Emergency Contact"
            hint="Optional"
            icon={ShieldAlert}
            name="emergency_contact"
            type="tel"
            value={state.form.emergency_contact}
            onChange={handleChange}
            disabled={fieldsDisabled}
            placeholder="03001111222"
            error={state.errors.emergency_contact}
          />

          <FormField
            label="Gender"
            icon={UserCircle}
            name="gender"
            value={state.form.gender}
            onChange={handleChange}
            disabled={fieldsDisabled}
            error={state.errors.gender}
            required
            options={GENDERS}
          />

          <FormField
            label="Blood Group"
            icon={Droplet}
            name="blood_group"
            value={state.form.blood_group}
            onChange={handleChange}
            disabled={fieldsDisabled}
            error={state.errors.blood_group}
            required
            options={BLOOD_GROUPS}
          />

          <div className="sm:col-span-2">
            <FormField
              label="Residential Address"
              icon={Home}
              name="address"
              value={state.form.address}
              onChange={handleChange}
              disabled={fieldsDisabled}
              placeholder="e.g. House #12, Block B, Lahore"
              error={state.errors.address}
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
          <button
            type="button"
            onClick={close}
            disabled={isLoading}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:text-slate-800 active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || readOnly}
            className="rounded-xl bg-gradient-to-r from-[#034A52] to-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-900/20 transition-all duration-200 hover:shadow-teal-900/30 hover:opacity-95 active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {isEditMode ? "Updating..." : "Saving..."}
              </>
            ) : (
              <>
                {isEditMode ? <Edit size={18} /> : <User size={18} />}
                {isEditMode ? "Update Record" : "Save Record"}
              </>
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export default PatientModal;