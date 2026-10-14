/**
 * @file AddIpdDoctorVisit.modal.util.jsx
 * @module Utils/Modals/IPDModal
 * @description Modal for adding IPD doctor visits.
 */

import { useState, useEffect, useReducer, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  Stethoscope,
  Calendar,
  FileText,
  AlertCircle,
  Sparkles,
  Loader2,
  User,
  Hospital,
  CheckCircle2,
} from "lucide-react";

import { fetchPatients } from "../../../redux/slices/Patients.slice.redux";
import ModalShell from "./ModalShell.util";
import FormField from "./FormField.shared";

/* -------------------------------------------------------------------------- */
/*                                 Helpers                                    */
/* -------------------------------------------------------------------------- */

const TODAY = () => new Date().toISOString().split("T")[0];

const NON_DOCTOR_KEYWORDS = [
  "reception",
  "pharmacy",
  "pharma",
  "admin",
  "nurse",
  "lab",
];

const isDoctorRole = (staff) => {
  const roleStr = String(
    staff.role?.name ||
      staff.role ||
      staff.user?.role?.name ||
      staff.user?.role ||
      staff.designation ||
      staff.type ||
      "",
  ).toLowerCase();

  if (NON_DOCTOR_KEYWORDS.some((k) => roleStr.includes(k))) return false;

  const name = String(
    staff.name || staff.full_name || staff.user?.name || "",
  ).toLowerCase();

  return (
    roleStr === "doctor" ||
    roleStr.includes("doctor") ||
    name.startsWith("dr") ||
    Boolean(staff.specialization?.trim())
  );
};

const extractPatientName = (admission, patientsById) => {
  if (!admission) return "";
  const pId =
    admission.patient_id || admission.patient?.id || admission.patient?._id;
  const found = patientsById.get(String(pId));
  if (found) {
    const name =
      found.name ||
      found.full_name ||
      found.patient_name ||
      found.user?.name ||
      `${found.first_name || ""} ${found.last_name || ""}`.trim();
    if (name) return name;
  }
  if (admission.patientName && !admission.patientName.includes("Patient #"))
    return admission.patientName;
  if (admission.patient?.name) return admission.patient.name;
  return `Patient #${pId || admission.id}`;
};

/* -------------------------------------------------------------------------- */
/*                                 Reducer                                    */
/* -------------------------------------------------------------------------- */

const makeInitial = (selectedAdmissionId = "") => ({
  form: {
    admission_id: selectedAdmissionId || "",
    doctor_id: "",
    visit_date: TODAY(),
    notes: "",
  },
  errors: {},
});

const reducer = (state, action) => {
  switch (action.type) {
    case "RESET":
      return makeInitial(action.selectedAdmissionId);
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

/* -------------------------------------------------------------------------- */
/*                              Component                                     */
/* -------------------------------------------------------------------------- */

const AddIpdDoctorVisitModal = ({
  isOpen,
  onClose,
  onAdd,
  admissions = [],
  doctors = [],
  patients: propPatients = [],
  selectedAdmissionId = "",
}) => {
  const dispatch = useDispatch();

  const reduxPatients = useSelector(
    (s) => s.patients?.patients || s.patient?.patients || [],
  );

  const allPatients = useMemo(() => {
    if (Array.isArray(propPatients) && propPatients.length > 0)
      return propPatients;
    return Array.isArray(reduxPatients) ? reduxPatients : [];
  }, [propPatients, reduxPatients]);

  const [state, dispatchAction] = useReducer(reducer, undefined, () =>
    makeInitial(selectedAdmissionId),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---------------------------- Patients map ----------------------------- */

  const patientsById = useMemo(() => {
    const m = new Map();
    allPatients.forEach((p) => {
      const id = p.id || p._id || p.patient_id;
      if (id != null) m.set(String(id), p);
    });
    return m;
  }, [allPatients]);

  /* ---------------------------- Doctor filter ---------------------------- */

  const filteredDoctors = useMemo(
    () => doctors.filter(isDoctorRole),
    [doctors],
  );

  /* -------------------------- Active admissions -------------------------- */

  const activeAdmissions = useMemo(
    () =>
      admissions.filter(
        (a) => String(a.status || "").toLowerCase() === "admitted",
      ),
    [admissions],
  );

  /* ------------------------------- Effects ------------------------------- */

  useEffect(() => {
    if (!isOpen) return;
    if (allPatients.length === 0) {
      dispatch(fetchPatients()).catch(() => {});
    }
    dispatchAction({ type: "RESET", selectedAdmissionId });
  }, [isOpen, dispatch, allPatients.length, selectedAdmissionId]);

  /* ------------------------------ Handlers ------------------------------- */

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

      const errors = {};
      if (!state.form.admission_id)
        errors.admission_id = "Admission is required";
      if (!state.form.doctor_id) errors.doctor_id = "Doctor is required";
      if (!state.form.visit_date) errors.visit_date = "Visit date is required";

      dispatchAction({ type: "SET_ERRORS", errors });

      if (Object.keys(errors).length > 0) {
        toast.error("Please fill required fields.");
        return;
      }

      setIsSubmitting(true);
      try {
        await onAdd({
          admission_id: Number(state.form.admission_id),
          doctor_id: Number(state.form.doctor_id),
          visit_date: state.form.visit_date,
          notes: state.form.notes || null,
        });
      } catch (err) {
        toast.error(err?.message || "Failed to add doctor visit.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [state.form, onAdd],
  );

  /* ------------------------------ Derived -------------------------------- */

  const selectedAdmission = useMemo(() => {
    if (!state.form.admission_id) return null;
    return admissions.find(
      (a) => String(a.id || a._id) === String(state.form.admission_id),
    );
  }, [admissions, state.form.admission_id]);

  const patientDisplayName = useMemo(() => {
    if (!selectedAdmission) return "N/A";
    return extractPatientName(selectedAdmission, patientsById);
  }, [selectedAdmission, patientsById]);

  const admissionDoctorDisplayName = useMemo(() => {
    if (!selectedAdmission) return "N/A";
    const docId = selectedAdmission.doctor_id;
    const doctor = doctors.find((d) => String(d.id || d._id) === String(docId));
    return (
      doctor?.name ||
      doctor?.full_name ||
      doctor?.user?.name ||
      selectedAdmission.doctorName ||
      selectedAdmission.doctor?.name ||
      `Doctor #${docId}`
    );
  }, [selectedAdmission, doctors]);

  /* -------------------------------- Render ------------------------------- */

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={close}
      disabled={isSubmitting}
      title={
        <>
          Add Doctor Visit
          <Sparkles size={16} className="text-teal-500 inline ml-1" />
        </>
      }
      subtitle="Record a doctor's visit for an IPD patient"
      icon={<Stethoscope size={22} />}
      iconClass="from-[#034A52] to-teal-500"
      accentShadow="shadow-teal-900/20"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Admission */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Admitted Patient <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Hospital
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <select
              name="admission_id"
              value={state.form.admission_id}
              onChange={handleChange}
              disabled={isSubmitting || !!selectedAdmissionId}
              className={`w-full rounded-xl border ${
                state.errors.admission_id
                  ? "border-rose-500"
                  : "border-slate-200"
              } bg-white pl-10 pr-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-[#034A52] focus:ring-2 focus:ring-[#034A52]/20 appearance-none disabled:bg-slate-50`}
            >
              <option value="">Select Admitted Patient</option>
              {activeAdmissions.map((a) => {
                const admId = a.id || a._id;
                const name = extractPatientName(a, patientsById);
                return (
                  <option key={admId} value={admId}>
                    #{admId} - {name}
                  </option>
                );
              })}
            </select>
          </div>
          {state.errors.admission_id && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-500">
              <AlertCircle size={12} /> {state.errors.admission_id}
            </p>
          )}
          {activeAdmissions.length === 0 && (
            <p className="mt-1.5 text-xs text-amber-600">
              No currently admitted patients found.
            </p>
          )}
        </div>

        {/* Selected admission card */}
        {selectedAdmission && (
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80">
            <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-2">
              <User size={14} className="text-[#034A52]" />
              Admission Info
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <InfoPair label="Patient" value={patientDisplayName} />
              <InfoPair
                label="Primary Doctor"
                value={admissionDoctorDisplayName}
              />
              <InfoPair
                label="Status"
                value={selectedAdmission.status}
                valueClass="text-emerald-600"
              />
              <InfoPair
                label="Admitted On"
                value={selectedAdmission.admission_date}
              />
            </div>
          </div>
        )}

        {/* Doctor */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Visiting Doctor <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Stethoscope
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <select
              name="doctor_id"
              value={state.form.doctor_id}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full rounded-xl border ${
                state.errors.doctor_id ? "border-rose-500" : "border-slate-200"
              } bg-white pl-10 pr-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-[#034A52] focus:ring-2 focus:ring-[#034A52]/20 appearance-none disabled:bg-slate-50`}
            >
              <option value="">Select Doctor</option>
              {filteredDoctors.map((doc) => {
                const docId = doc.id || doc._id;
                const name =
                  doc.name ||
                  doc.full_name ||
                  doc.user?.name ||
                  `Doctor #${docId}`;
                return (
                  <option key={docId} value={docId}>
                    {name}
                    {doc.specialization ? ` - ${doc.specialization}` : ""}
                  </option>
                );
              })}
            </select>
          </div>
          {state.errors.doctor_id && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-500">
              <AlertCircle size={12} /> {state.errors.doctor_id}
            </p>
          )}
        </div>

        {/* Visit Date */}
        <FormField
          label="Visit Date"
          icon={Calendar}
          name="visit_date"
          type="date"
          value={state.form.visit_date}
          onChange={handleChange}
          disabled={isSubmitting}
          error={state.errors.visit_date}
          required
        />

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Notes
          </label>
          <div className="relative">
            <FileText
              size={18}
              className="absolute left-3.5 top-3 text-slate-400 pointer-events-none"
            />
            <textarea
              name="notes"
              value={state.form.notes}
              onChange={handleChange}
              disabled={isSubmitting}
              rows={3}
              placeholder="Add visit notes..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-[#034A52] focus:ring-2 focus:ring-[#034A52]/20 disabled:bg-slate-50 resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={close}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-50 active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-[#034A52] hover:bg-[#02373d] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#034A52]/20 transition-all duration-200 active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                Add Visit
              </>
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

const InfoPair = ({ label, value, valueClass = "text-slate-800" }) => (
  <div>
    <span className="text-slate-500">{label}:</span>
    <span className={`ml-1 font-semibold ${valueClass}`}>{value}</span>
  </div>
);

export default AddIpdDoctorVisitModal;
