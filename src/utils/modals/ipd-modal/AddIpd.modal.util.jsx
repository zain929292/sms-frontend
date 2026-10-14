/**
 * @file AddIpd.modal.util.jsx
 * @module IPDModal
 * @description Modal for admitting a patient to IPD with duplicate prevention and dynamic form fields.
 */

import { useState, useEffect, useReducer, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  UserPlus,
  User,
  Stethoscope,
  Building,
  Bed,
  DoorOpen,
  Calendar,
  FileText,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldAlert,
} from "lucide-react";

import { fetchPatients } from "../../../redux/slices/Patients.slice.redux";
import { fetchStaff } from "../../../redux/slices/Staff.slice.redux";
import ModalShell from "../../../shared/ModalShell.shared";
import FormField from "../../../shared/FormField.shared";

/* -------------------------------------------------------------------------- */
/*                                   Reducer                                  */
/* -------------------------------------------------------------------------- */

const TODAY = () => new Date().toISOString().split("T")[0];

const initialForm = {
  patient_id: "",
  doctor_id: "",
  ward_id: "",
  room_id: "",
  bed_id: "",
  admission_date: TODAY(),
  reason: "",
  notes: "",
};

const initialState = {
  form: initialForm,
  errors: {},
  selectedPatient: null,
  isPatientAdmitted: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "RESET":
      return {
        ...initialState,
        form: { ...initialForm, admission_date: TODAY() },
      };
    case "SET_FIELD":
      return {
        ...state,
        form: { ...state.form, [action.field]: action.value },
        errors: state.errors[action.field]
          ? { ...state.errors, [action.field]: "" }
          : state.errors,
      };
    case "SET_FIELDS":
      return {
        ...state,
        form: { ...state.form, ...action.fields },
        errors: action.clearErrors
          ? {
              ...state.errors,
              ...Object.fromEntries(
                Object.keys(action.fields).map((k) => [k, ""]),
              ),
            }
          : state.errors,
      };
    case "SET_SELECTED_PATIENT":
      return {
        ...state,
        selectedPatient: action.patient,
        isPatientAdmitted: action.isAdmitted,
      };
    case "SET_ERRORS":
      return { ...state, errors: action.errors };
    default:
      return state;
  }
};

/* -------------------------------------------------------------------------- */
/*                                Validation                                  */
/* -------------------------------------------------------------------------- */

const validateForm = (form, isPatientAdmitted) => {
  const errors = {};
  if (!form.patient_id) errors.patient_id = "Patient is required";
  if (!form.doctor_id) errors.doctor_id = "Doctor is required";
  if (!form.ward_id) errors.ward_id = "Ward is required";
  if (!form.room_id) errors.room_id = "Room is required";
  if (!form.bed_id) errors.bed_id = "Bed is required";
  if (!form.admission_date)
    errors.admission_date = "Admission date is required";
  if (!form.reason.trim()) errors.reason = "Reason for admission is required";
  if (isPatientAdmitted) {
    errors.duplicate =
      "This patient is already admitted. Please discharge first.";
  }
  return errors;
};

/* -------------------------------------------------------------------------- */
/*                                Component                                   */
/* -------------------------------------------------------------------------- */

const AddIPDModal = ({
  isOpen,
  onClose,
  onAdd,
  wards = [],
  fieldsConfig = {},
}) => {
  const dispatch = useDispatch();

  const patients = useSelector(
    (s) => (s.patient || s.patients)?.patients || [],
  );
  const patientsLoading = useSelector(
    (s) => (s.patient || s.patients)?.loading || false,
  );
  const staffList = useSelector((s) => s.staff?.staffList || []);
  const staffLoading = useSelector((s) => s.staff?.loading || false);
  const admissions = useSelector((s) => s.admissions?.admissions || []);

  const [state, dispatchAction] = useReducer(reducer, initialState);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);

  /* ---------------------------- Admitted ID set --------------------------- */

  const admittedPatientIds = useMemo(() => {
    const set = new Set();
    for (const a of admissions) {
      if (a.status === "Admitted" || a.status === "Active") {
        set.add(Number(a.patient_id));
      }
    }
    return set;
  }, [admissions]);

  /* ------------------------------ Doctors -------------------------------- */

  const doctors = useMemo(
    () => staffList.filter((s) => (s.role?.toLowerCase() || "") === "doctor"),
    [staffList],
  );

  /* -------------------------- Wards with beds ---------------------------- */

  const availableWards = useMemo(
    () =>
      wards.filter((w) =>
        w.rooms?.some((r) => r.beds?.some((b) => b.status === "available")),
      ),
    [wards],
  );

  /* ------------------------ Room/Bed derived lists ----------------------- */

  const availableRooms = useMemo(() => {
    if (!state.form.ward_id) return [];
    const ward = wards.find(
      (w) => String(w.id || w._id) === String(state.form.ward_id),
    );
    return ward?.rooms || [];
  }, [wards, state.form.ward_id]);

  const availableBeds = useMemo(() => {
    if (!state.form.room_id || !state.form.ward_id) return [];
    const ward = wards.find(
      (w) => String(w.id || w._id) === String(state.form.ward_id),
    );
    const room = ward?.rooms?.find(
      (r) => String(r.id || r._id) === String(state.form.room_id),
    );
    return (room?.beds || []).filter((b) => b.status === "available");
  }, [wards, state.form.ward_id, state.form.room_id]);

  /* ------------------------------- Effects ------------------------------- */

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setFetchingData(true);

    Promise.all([
      dispatch(fetchPatients()).unwrap(),
      dispatch(fetchStaff()).unwrap(),
    ])
      .catch(() => {
        if (!cancelled) {
          toast.error("Failed to load dependency data. Please try again.");
        }
      })
      .finally(() => {
        if (!cancelled) setFetchingData(false);
      });

    dispatchAction({ type: "RESET" });

    return () => {
      cancelled = true;
    };
  }, [isOpen, dispatch]);

  /* ------------------------------ Handlers ------------------------------- */

  const close = useCallback(() => {
    dispatchAction({ type: "RESET" });
    onClose();
  }, [onClose]);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      if (name === "patient_id") {
        const patient = patients.find(
          (p) => String(p.id || p._id) === String(value),
        );
        const isAdmitted = value
          ? admittedPatientIds.has(Number(value))
          : false;

        dispatchAction({
          type: "SET_SELECTED_PATIENT",
          patient: patient || null,
          isAdmitted,
        });

        if (isAdmitted) {
          toast.error("This patient is already admitted!", { duration: 3000 });
        }
      }

      dispatchAction({ type: "SET_FIELD", field: name, value });

      // Cascade resets
      if (name === "ward_id") {
        dispatchAction({
          type: "SET_FIELDS",
          fields: { room_id: "", bed_id: "" },
        });
      } else if (name === "room_id") {
        dispatchAction({ type: "SET_FIELDS", fields: { bed_id: "" } });
      }
    },
    [patients, admittedPatientIds],
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (state.isPatientAdmitted) {
        toast.error("This patient is already admitted. Cannot admit again.");
        return;
      }

      const errors = validateForm(state.form, state.isPatientAdmitted);
      dispatchAction({ type: "SET_ERRORS", errors });

      if (Object.keys(errors).length > 0) {
        toast.error("Please fix all errors before submitting.");
        return;
      }

      setLoading(true);

      try {
        const selectedPatientData = patients.find(
          (p) => String(p.id || p._id) === String(state.form.patient_id),
        );
        const selectedDoctor = doctors.find(
          (d) =>
            String(d.id || d._id || d.user_id) === String(state.form.doctor_id),
        );

        const payload = {
          ...state.form,
          doctor_id: selectedDoctor?.user_id || state.form.doctor_id,
          reason: state.form.reason.trim(),
          notes: state.form.notes.trim(),
          status: "Admitted",
          patient: selectedPatientData,
          doctor: selectedDoctor,
        };

        await onAdd(payload);
        close();
      } catch (err) {
        toast.error(err?.message || "Failed to submit admission record.");
      } finally {
        setLoading(false);
      }
    },
    [state, patients, doctors, onAdd, close],
  );

  const isFormLoading = loading || fetchingData;

  /* -------------------------------- Render ------------------------------- */

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={close}
      disabled={isFormLoading}
      title={
        <>
          {fieldsConfig.modalTitle || "New IPD Admission"}
          <Sparkles size={16} className="text-teal-500 inline ml-1" />
        </>
      }
      subtitle={
        fieldsConfig.modalSubtitle ||
        "Admit a patient to the hospital IPD department"
      }
      icon={<UserPlus size={22} />}
      iconClass="from-[#034A52] to-teal-500"
      accentShadow="shadow-teal-900/20"
      maxWidth="max-w-2xl"
    >
      {fetchingData ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 size={40} className="animate-spin text-[#034A52] mb-4" />
          <p className="text-sm font-medium text-slate-600">
            Fetching system records...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Patient Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                {fieldsConfig.patientLabel || "Patient"}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <select
                  name="patient_id"
                  value={state.form.patient_id}
                  onChange={handleChange}
                  disabled={patientsLoading || isFormLoading}
                  className={`w-full rounded-xl border ${
                    state.errors.patient_id ||
                    state.errors.duplicate ||
                    state.isPatientAdmitted
                      ? "border-rose-500 bg-rose-50/30"
                      : "border-slate-200 bg-slate-50/50"
                  } pl-10 pr-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200 focus:bg-white focus:border-[#034A52] focus:ring-4 focus:ring-[#034A52]/10 appearance-none disabled:opacity-50`}
                >
                  <option value="">
                    {fieldsConfig.selectPatientPlaceholder || "Select Patient"}
                  </option>
                  {patients.map((p) => {
                    const id = p.id || p._id;
                    const isAdmitted = admittedPatientIds.has(Number(id));
                    return (
                      <option key={id} value={id}>
                        {p.name}
                        {p.cnic ? ` - ${p.cnic}` : ""}
                        {isAdmitted ? " (ALREADY ADMITTED)" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
              {state.errors.patient_id && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-500">
                  <AlertCircle size={12} /> {state.errors.patient_id}
                </p>
              )}
              {state.errors.duplicate && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-500">
                  <AlertCircle size={12} /> {state.errors.duplicate}
                </p>
              )}
              {state.isPatientAdmitted && !state.errors.duplicate && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-500">
                  <ShieldAlert size={12} /> This patient is already admitted!
                </p>
              )}
            </div>

            {/* Doctor Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                {fieldsConfig.doctorLabel || "Attending Doctor"}{" "}
                <span className="text-rose-500">*</span>
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
                  disabled={staffLoading || isFormLoading}
                  className={`w-full rounded-xl border ${
                    state.errors.doctor_id
                      ? "border-rose-500 bg-rose-50/30"
                      : "border-slate-200 bg-slate-50/50"
                  } pl-10 pr-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200 focus:bg-white focus:border-[#034A52] focus:ring-4 focus:ring-[#034A52]/10 appearance-none disabled:opacity-50`}
                >
                  <option value="">
                    {fieldsConfig.selectDoctorPlaceholder || "Select Doctor"}
                  </option>
                  {doctors.map((d) => {
                    const id = d.id || d._id || d.user_id;
                    return (
                      <option key={id} value={id}>
                        {d.name || d.full_name || `Doctor ${id}`}
                        {d.specialization ? ` - ${d.specialization}` : ""}
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
              {doctors.length === 0 && (
                <p className="mt-1.5 text-xs text-amber-600">
                  {fieldsConfig.noDoctorsText ||
                    "No doctors available. Please add doctors to the staff list."}
                </p>
              )}
            </div>

            {/* Ward Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                {fieldsConfig.wardLabel || "Ward"}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <select
                  name="ward_id"
                  value={state.form.ward_id}
                  onChange={handleChange}
                  disabled={isFormLoading}
                  className={`w-full rounded-xl border ${
                    state.errors.ward_id
                      ? "border-rose-500 bg-rose-50/30"
                      : "border-slate-200 bg-slate-50/50"
                  } pl-10 pr-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200 focus:bg-white focus:border-[#034A52] focus:ring-4 focus:ring-[#034A52]/10 appearance-none disabled:opacity-50`}
                >
                  <option value="">
                    {fieldsConfig.selectWardPlaceholder || "Select Ward"}
                  </option>
                  {availableWards.map((w) => {
                    const id = w.id || w._id;
                    return (
                      <option key={id} value={id}>
                        {w.name}
                        {w.floor ? ` - ${w.floor}` : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
              {state.errors.ward_id && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-500">
                  <AlertCircle size={12} /> {state.errors.ward_id}
                </p>
              )}
            </div>

            {/* Room Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                {fieldsConfig.roomLabel || "Room"}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <DoorOpen
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <select
                  name="room_id"
                  value={state.form.room_id}
                  onChange={handleChange}
                  disabled={!state.form.ward_id || isFormLoading}
                  className={`w-full rounded-xl border ${
                    state.errors.room_id
                      ? "border-rose-500 bg-rose-50/30"
                      : "border-slate-200 bg-slate-50/50"
                  } pl-10 pr-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200 focus:bg-white focus:border-[#034A52] focus:ring-4 focus:ring-[#034A52]/10 appearance-none disabled:opacity-50`}
                >
                  <option value="">
                    {fieldsConfig.selectRoomPlaceholder || "Select Room"}
                  </option>
                  {availableRooms.map((r) => {
                    const id = r.id || r._id;
                    return (
                      <option key={id} value={id}>
                        Room {r.room_number}
                        {r.room_type ? ` - ${r.room_type}` : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
              {state.errors.room_id && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-500">
                  <AlertCircle size={12} /> {state.errors.room_id}
                </p>
              )}
            </div>

            {/* Bed Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                {fieldsConfig.bedLabel || "Bed"}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Bed
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <select
                  name="bed_id"
                  value={state.form.bed_id}
                  onChange={handleChange}
                  disabled={!state.form.room_id || isFormLoading}
                  className={`w-full rounded-xl border ${
                    state.errors.bed_id
                      ? "border-rose-500 bg-rose-50/30"
                      : "border-slate-200 bg-slate-50/50"
                  } pl-10 pr-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200 focus:bg-white focus:border-[#034A52] focus:ring-4 focus:ring-[#034A52]/10 appearance-none disabled:opacity-50`}
                >
                  <option value="">
                    {fieldsConfig.selectBedPlaceholder || "Select Bed"}
                  </option>
                  {availableBeds.map((b) => {
                    const id = b.id || b._id;
                    return (
                      <option key={id} value={id}>
                        Bed {b.bed_number}
                        {b.bed_type ? ` - ${b.bed_type}` : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
              {state.errors.bed_id && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-500">
                  <AlertCircle size={12} /> {state.errors.bed_id}
                </p>
              )}
            </div>

            {/* Admission Date Field */}
            <FormField
              label={fieldsConfig.admissionDateLabel || "Admission Date"}
              icon={Calendar}
              name="admission_date"
              type="date"
              value={state.form.admission_date}
              onChange={handleChange}
              disabled={isFormLoading}
              error={state.errors.admission_date}
              required
            />
          </div>

          {/* Selected Patient Card */}
          {state.selectedPatient && !state.isPatientAdmitted && (
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                <User size={14} className="text-[#00A3AD]" />
                {fieldsConfig.selectedPatientCardTitle ||
                  "Selected Patient Details"}
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <InfoRow
                  label={fieldsConfig.patientNameLabel || "Name"}
                  value={state.selectedPatient.name}
                />
                <InfoRow
                  label={fieldsConfig.patientCnicLabel || "CNIC"}
                  value={state.selectedPatient.cnic}
                />
                <InfoRow
                  label={fieldsConfig.patientPhoneLabel || "Phone"}
                  value={state.selectedPatient.phone}
                />
                <InfoRow
                  label={fieldsConfig.patientAgeLabel || "Age"}
                  value={state.selectedPatient.age}
                />
              </div>
            </div>
          )}

          {/* Reason Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              {fieldsConfig.reasonLabel || "Reason for Admission"}{" "}
              <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <FileText
                size={18}
                className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none"
              />
              <textarea
                name="reason"
                value={state.form.reason}
                onChange={handleChange}
                rows={2}
                disabled={isFormLoading}
                placeholder={
                  fieldsConfig.reasonPlaceholder ||
                  "Describe primary clinical reason for admission..."
                }
                className={`w-full rounded-xl border ${
                  state.errors.reason
                    ? "border-rose-500 bg-rose-50/30"
                    : "border-slate-200 bg-slate-50/50"
                } pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-[#034A52] focus:ring-4 focus:ring-[#034A52]/10 disabled:opacity-50`}
              />
            </div>
            {state.errors.reason && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-500">
                <AlertCircle size={12} /> {state.errors.reason}
              </p>
            )}
          </div>

          {/* Notes Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              {fieldsConfig.notesLabel || "Additional Notes"}
            </label>
            <div className="relative">
              <AlertCircle
                size={18}
                className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none"
              />
              <textarea
                name="notes"
                value={state.form.notes}
                onChange={handleChange}
                rows={2}
                disabled={isFormLoading}
                placeholder={
                  fieldsConfig.notesPlaceholder ||
                  "Additional observations or notes (optional)..."
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-[#034A52] focus:ring-4 focus:ring-[#034A52]/10 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={close}
              disabled={isFormLoading}
              className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-50 active:scale-95 disabled:opacity-50"
            >
              {fieldsConfig.cancelButtonText || "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isFormLoading || state.isPatientAdmitted}
              className={`rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 active:scale-95 flex items-center gap-2 disabled:opacity-50 ${
                state.isPatientAdmitted
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-[#034A52] hover:bg-[#02373d] shadow-[#034A52]/20"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {fieldsConfig.loadingButtonText || "Admitting..."}
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  {fieldsConfig.submitButtonText || "Admit Patient"}
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </ModalShell>
  );
};

const InfoRow = ({ label, value }) => (
  <div>
    <span className="text-slate-500">{label}:</span>
    <span className="ml-2 font-medium text-slate-800">{value || "N/A"}</span>
  </div>
);

export default AddIPDModal;
