/**
 * @file Appointment.modal.util.jsx
 * @module Utils/Modals/Appointment
 * @description Modal to schedule a new appointment with automatic commission setup.
 */

import { useState, useReducer, useMemo, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  Calendar,
  Clock,
  AlertCircle,
  Loader2,
  Stethoscope,
  Users,
  CalendarDays,
  Sparkles,
  ShieldAlert,
  Percent,
  CalendarCheck,
} from "lucide-react";
import {
  createAppointment,
  fetchAppointments,
} from "../../../redux/slices/Appointment.slice.redux";
import {
  createDoctorCommission,
  updateDoctorCommission,
  fetchDoctorCommissions,
} from "../../../redux/slices/Commission.slice.redux";
import { fetchPatients } from "../../../redux/slices/Patients.slice.redux";
import { fetchStaff } from "../../../redux/slices/Staff.slice.redux";
import ModalShell from "../../../shared/ModalShell.shared";
import SearchableSelect from "../../../shared/SearchableSelect.shared";
import FormField from "../../../shared/FormField.shared";

/* -------------------------------------------------------------------------- */
/*                              Constants & Utils                             */
/* -------------------------------------------------------------------------- */

const TODAY = () => new Date().toISOString().split("T")[0];

const DEFAULT_STATE = {
  patient_id: "",
  doctor_id: "",
  appointment_date: "",
  appointment_time: "",
  commission_rate: "",
  effective_from: "",
  patientSearchTerm: "",
  doctorSearchTerm: "",
  patientDropdownOpen: false,
  doctorDropdownOpen: false,
  selectedPatient: null,
  selectedDoctor: null,
  duplicateWarning: null,
  errors: {},
};

/** Extract array of commissions from any backend response shape. */
const extractCommissionsArray = (response) => {
  if (!response) return [];
  const tryExtract = (value) => {
    if (!value) return null;
    if (Array.isArray(value)) return value;
    if (typeof value !== "object") return null;
    for (const k of [
      "commissions",
      "items",
      "results",
      "records",
      "list",
      "rows",
    ]) {
      if (Array.isArray(value[k])) return value[k];
    }
    const values = Object.values(value);
    if (values.length > 0 && values.every((v) => v && typeof v === "object")) {
      return values;
    }
    return null;
  };
  return (
    tryExtract(response) ||
    tryExtract(response?.data) ||
    tryExtract(response?.data?.data) ||
    []
  );
};

const formatTimeWithSeconds = (time) =>
  !time ? null : time.split(":").length === 3 ? time : `${time}:00`;

/** Pure function — checks for duplicate appointments. */
const findDuplicates = (appointments, patientId, doctorId, date, time) => {
  if (!patientId || !date) return [];
  return appointments.filter((app) => {
    const status = app.status?.toLowerCase();
    if (status === "cancelled" || status === "completed") return false;
    if (Number(app.patient_id) !== Number(patientId)) return false;
    if (app.appointment_date !== date) return false;
    if (doctorId && Number(app.doctor_id) !== Number(doctorId)) return false;
    if (time && app.appointment_time !== `${time}:00`) return false;
    return true;
  });
};

/* -------------------------------------------------------------------------- */
/*                                  Reducer                                   */
/* -------------------------------------------------------------------------- */

const reducer = (state, action) => {
  switch (action.type) {
    case "RESET":
      return { ...DEFAULT_STATE, effective_from: TODAY() };
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_FIELDS":
      return { ...state, ...action.fields };
    case "SET_ERROR":
      return {
        ...state,
        errors: action.value
          ? { ...state.errors, [action.field]: action.value }
          : state.errors,
      };
    case "CLEAR_ERRORS":
      return { ...state, errors: {} };
    case "SELECT_PATIENT":
      return {
        ...state,
        selectedPatient: action.patient,
        patient_id: action.patient.id,
        patientSearchTerm: action.patient.name,
        patientDropdownOpen: false,
        duplicateWarning: null,
        errors: { ...state.errors, patient_id: "" },
      };
    case "SELECT_DOCTOR":
      return {
        ...state,
        selectedDoctor: action.doctor,
        doctor_id: action.doctor.id,
        effective_from: state.effective_from || TODAY(),
        doctorSearchTerm: action.doctor.name,
        doctorDropdownOpen: false,
        errors: { ...state.errors, doctor_id: "" },
      };
    case "SET_DUPLICATE_WARNING":
      return { ...state, duplicateWarning: action.value };
    default:
      return state;
  }
};

/* -------------------------------------------------------------------------- */
/*                                Component                                   */
/* -------------------------------------------------------------------------- */

const AddAppointmentModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();

  const creating = useSelector((s) => s.appointment?.creating ?? false);
  const patients = useSelector((s) => s.patient?.patients ?? []);
  const staffList = useSelector((s) => s.staff?.staffList ?? []);
  const appointments = useSelector((s) => s.appointment?.appointments ?? []);

  const [state, dispatchAction] = useReducer(reducer, {
    ...DEFAULT_STATE,
    effective_from: TODAY(),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ------------------------------ Derived data ----------------------------- */

  const doctors = useMemo(() => {
    if (!Array.isArray(staffList)) return [];
    return staffList
      .filter((s) => s.role?.toLowerCase() === "doctor")
      .map((s) => ({
        id: s.user_id || s.id,
        staff_id: s.id,
        name: s.name || s.user?.name || `Doctor ${s.id}`,
        specialization: s.specialization || "General",
        phone: s.phone || null,
        consultation_fee: s.consultation_fee || 0,
        user_id: s.user_id || s.id,
      }));
  }, [staffList]);

  const filterPatient = useCallback((p, term) => {
    if (!term) return true;
    const l = term.toLowerCase();
    return (
      p.name?.toLowerCase().includes(l) ||
      p.cnic?.includes(term) ||
      p.phone?.includes(term)
    );
  }, []);

  const filterDoctor = useCallback((d, term) => {
    if (!term) return true;
    const l = term.toLowerCase();
    return (
      d.name?.toLowerCase().includes(l) ||
      d.specialization?.toLowerCase().includes(l)
    );
  }, []);

  const patientExistingAppointments = useMemo(() => {
    if (!state.patient_id) return [];
    return appointments.filter(
      (a) =>
        Number(a.patient_id) === Number(state.patient_id) &&
        a.status?.toLowerCase() !== "cancelled" &&
        a.status?.toLowerCase() !== "completed",
    );
  }, [appointments, state.patient_id]);

  /* -------------------------------- Effects ------------------------------- */

  useEffect(() => {
    if (!isOpen) return;
    dispatch(fetchPatients());
    dispatch(fetchStaff());
    dispatch(fetchAppointments());
    dispatch(fetchDoctorCommissions());
    dispatchAction({ type: "RESET" });
    setIsSubmitting(false);
  }, [isOpen, dispatch]);

  /* ------------------------------- Handlers ------------------------------- */

  const close = useCallback(() => {
    dispatchAction({ type: "RESET" });
    setIsSubmitting(false);
    onClose();
  }, [onClose]);

  const handlePatientChange = useCallback((value) => {
    if (value === "") {
      dispatchAction({
        type: "SET_FIELDS",
        fields: {
          patient_id: "",
          selectedPatient: null,
          duplicateWarning: null,
        },
      });
    }
    dispatchAction({ type: "SET_FIELD", field: "patientSearchTerm", value });
  }, []);

  const handleDoctorChange = useCallback((value) => {
    if (value === "") {
      dispatchAction({
        type: "SET_FIELDS",
        fields: { doctor_id: "", selectedDoctor: null },
      });
    }
    dispatchAction({ type: "SET_FIELD", field: "doctorSearchTerm", value });
  }, []);

  const handleSelectPatient = useCallback((patient) => {
    dispatchAction({ type: "SELECT_PATIENT", patient });
  }, []);

  const handleSelectDoctor = useCallback(
    (doctor) => {
      dispatchAction({ type: "SELECT_DOCTOR", doctor });
      const { patient_id, appointment_date, appointment_time } = state;
      if (patient_id && appointment_date) {
        const dupes = findDuplicates(
          appointments,
          patient_id,
          doctor.id,
          appointment_date,
          appointment_time,
        );
        dispatchAction({
          type: "SET_DUPLICATE_WARNING",
          value: dupes.length
            ? {
                message: `This patient already has ${dupes.length} appointment(s) on this date.`,
                appointments: dupes,
              }
            : null,
        });
      }
    },
    [appointments, state],
  );

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      dispatchAction({ type: "SET_FIELD", field: name, value });
      dispatchAction({ type: "SET_ERROR", field: name, value: "" });

      // Duplicate check on date/time change
      if (name === "appointment_date" || name === "appointment_time") {
        const next = { ...state, [name]: value };
        if (next.patient_id && next.appointment_date) {
          const dupes = findDuplicates(
            appointments,
            next.patient_id,
            next.doctor_id,
            next.appointment_date,
            next.appointment_time,
          );
          dispatchAction({
            type: "SET_DUPLICATE_WARNING",
            value: dupes.length
              ? {
                  message: `This patient already has ${dupes.length} appointment(s) on this date.`,
                  appointments: dupes,
                }
              : null,
          });
        }
      }
    },
    [appointments, state],
  );

  const validate = useCallback(() => {
    const newErrors = {};
    const s = state;

    if (!s.patient_id) newErrors.patient_id = "Please select a patient";
    if (!s.doctor_id) newErrors.doctor_id = "Please select a doctor";

    if (!s.appointment_date) {
      newErrors.appointment_date = "Appointment date is required";
    } else {
      const selected = new Date(s.appointment_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        newErrors.appointment_date = "Appointment date cannot be in the past";
      }
    }

    if (!s.appointment_time) {
      newErrors.appointment_time = "Appointment time is required";
    }

    if (s.commission_rate === "" || s.commission_rate === null) {
      newErrors.commission_rate = "Commission rate is required";
    } else {
      const rate = Number(s.commission_rate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        newErrors.commission_rate = "Commission rate must be between 0 and 100";
      }
    }

    if (!s.effective_from) {
      newErrors.effective_from = "Effective date is required";
    }

    // Exact duplicate check
    if (
      s.patient_id &&
      s.appointment_date &&
      s.doctor_id &&
      s.appointment_time
    ) {
      const dupes = findDuplicates(
        appointments,
        s.patient_id,
        s.doctor_id,
        s.appointment_date,
        s.appointment_time,
      );
      if (dupes.length) {
        newErrors.duplicate =
          "This patient already has an appointment with this doctor at the selected time.";
      }
    }

    dispatchAction({ type: "SET_FIELDS", fields: { errors: newErrors } });
    return Object.keys(newErrors).length === 0;
  }, [state, appointments]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validate()) {
        toast.error("Please fix the errors in the form before submitting.");
        return;
      }

      if (state.duplicateWarning) {
        const ok = window.confirm(
          `${state.duplicateWarning.message}\n\nDo you want to proceed?`,
        );
        if (!ok) return;
      }

      setIsSubmitting(true);

      const appointmentPayload = {
        patient_id: Number(state.patient_id),
        doctor_id: Number(state.doctor_id),
        appointment_date: state.appointment_date,
        appointment_time: formatTimeWithSeconds(state.appointment_time),
        status: "Pending",
      };

      const commissionPayload = {
        doctor_id: Number(state.doctor_id),
        commission_rate: Number(state.commission_rate),
        effective_from: state.effective_from,
      };

      try {
        await dispatch(createAppointment(appointmentPayload)).unwrap();

        const existingRes = await dispatch(
          fetchDoctorCommissions({ doctor_id: state.doctor_id }),
        ).unwrap();

        const existing = extractCommissionsArray(existingRes);
        const sameDate = existing.find(
          (c) =>
            Number(c.doctor_id) === Number(state.doctor_id) &&
            c.effective_from === state.effective_from,
        );

        if (sameDate) {
          await dispatch(
            updateDoctorCommission({
              id: sameDate.id || sameDate._id,
              data: commissionPayload,
            }),
          ).unwrap();
          toast.success("Appointment created & commission updated!");
        } else {
          await dispatch(createDoctorCommission(commissionPayload)).unwrap();
          toast.success("Appointment created & commission set!");
        }

        await dispatch(fetchAppointments());
        await dispatch(fetchDoctorCommissions());
        close();
      } catch (err) {
        const message =
          err?.data ||
          err?.message ||
          "Failed to create appointment. Please try again.";
        toast.error(message, { duration: 6000 });

        if (err?.errors) {
          const fieldErrors = {};
          Object.keys(err.errors).forEach((k) => {
            fieldErrors[k] = err.errors[k][0];
          });
          dispatchAction({
            type: "SET_FIELDS",
            fields: { errors: fieldErrors },
          });
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [state, dispatch, validate, close],
  );

  /* ------------------------------- Render --------------------------------- */

  const isBusy = creating || isSubmitting;
  const todayStr = useMemo(() => TODAY(), []);
  const noDoctors = doctors.length === 0;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={close}
      disabled={isBusy}
      title={
        <>
          Schedule New Appointment
          <Sparkles size={16} className="text-teal-500 inline ml-1" />
        </>
      }
      subtitle="Book an appointment for a patient with a doctor"
      icon={<CalendarDays size={22} />}
      iconClass="from-[#034A52] to-teal-500"
      accentShadow="shadow-teal-900/20"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-5">
          {/* Patient */}
          <SearchableSelect
            label="Select Patient"
            icon={Users}
            placeholder="Search patient by name, CNIC, or phone..."
            searchTerm={state.patientSearchTerm}
            onSearchChange={handlePatientChange}
            items={patients}
            filterFn={filterPatient}
            isOpen={state.patientDropdownOpen}
            onOpenChange={(open) =>
              dispatchAction({
                type: "SET_FIELD",
                field: "patientDropdownOpen",
                value: open,
              })
            }
            onSelect={handleSelectPatient}
            error={state.errors.patient_id}
            emptyMessage="No patients found."
            itemRenderer={(p, avatarClass) => (
              <>
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-full ${avatarClass} flex items-center justify-center font-bold text-xs`}
                  >
                    {p.name?.[0]?.toUpperCase() || "P"}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{p.name}</p>
                    <p className="text-[10px] text-slate-500">
                      {p.cnic || "N/A"} • {p.phone || "N/A"}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  ID: {p.id}
                </span>
              </>
            )}
          />

          {/* Selected patient card */}
          {state.selectedPatient && (
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Selected Patient Details
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <InfoRow label="Name" value={state.selectedPatient.name} />
                <InfoRow label="CNIC" value={state.selectedPatient.cnic} />
                <InfoRow label="Phone" value={state.selectedPatient.phone} />
                <InfoRow label="Age" value={state.selectedPatient.age} />
              </div>
              {patientExistingAppointments.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="text-xs font-semibold text-amber-600 flex items-center gap-1.5">
                    <AlertCircle size={12} />
                    This patient has {patientExistingAppointments.length} active
                    appointment(s):
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {patientExistingAppointments.slice(0, 3).map((a) => (
                      <li key={a.id} className="text-xs text-slate-600">
                        • {a.appointment_date} at{" "}
                        {a.appointment_time?.slice(0, 5)}
                        {a.doctor?.name && ` with Dr. ${a.doctor.name}`}
                        <span className="ml-1 text-amber-600">
                          ({a.status})
                        </span>
                      </li>
                    ))}
                    {patientExistingAppointments.length > 3 && (
                      <li className="text-xs text-slate-500">
                        ... and {patientExistingAppointments.length - 3} more
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Duplicate warning */}
          {state.duplicateWarning && (
            <div className="bg-amber-50/80 rounded-2xl p-4 border border-amber-200">
              <div className="flex items-start gap-2">
                <ShieldAlert
                  size={16}
                  className="text-amber-600 mt-0.5 shrink-0"
                />
                <div>
                  <p className="text-xs font-semibold text-amber-700">
                    {state.duplicateWarning.message}
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {state.duplicateWarning.appointments.map((a) => (
                      <li key={a.id} className="text-xs text-amber-600">
                        • {a.appointment_date} at{" "}
                        {a.appointment_time?.slice(0, 5)}
                        {a.doctor?.name && ` with Dr. ${a.doctor.name}`}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-amber-600 mt-1">
                    You can still proceed if this is a different time or doctor.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Doctor */}
          <SearchableSelect
            label="Select Doctor"
            icon={Stethoscope}
            placeholder="Search doctor by name or specialization..."
            searchTerm={state.doctorSearchTerm}
            onSearchChange={handleDoctorChange}
            items={doctors}
            filterFn={filterDoctor}
            isOpen={state.doctorDropdownOpen}
            onOpenChange={(open) =>
              dispatchAction({
                type: "SET_FIELD",
                field: "doctorDropdownOpen",
                value: open,
              })
            }
            onSelect={handleSelectDoctor}
            error={state.errors.doctor_id}
            avatarClass="bg-blue-50 text-blue-600"
            emptyMessage="No doctors found."
            itemRenderer={(d, avatarClass) => (
              <>
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-full ${avatarClass} flex items-center justify-center font-bold text-xs`}
                  >
                    {d.name?.[0]?.toUpperCase() || "D"}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{d.name}</p>
                    <p className="text-[10px] text-slate-500">
                      {d.specialization}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  ID: {d.id}
                </span>
              </>
            )}
          />

          {noDoctors && (
            <p className="text-xs text-amber-600">
              No doctors available. Please add doctors to the staff list.
            </p>
          )}

          {/* Selected doctor card */}
          {state.selectedDoctor && (
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Selected Doctor Details
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <InfoRow label="Name" value={state.selectedDoctor.name} />
                <InfoRow
                  label="Specialization"
                  value={state.selectedDoctor.specialization}
                />
                <InfoRow label="Phone" value={state.selectedDoctor.phone} />
                <InfoRow
                  label="Consultation Fee"
                  value={`PKR ${state.selectedDoctor.consultation_fee || "0"}`}
                />
              </div>
            </div>
          )}

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Appointment Date"
              icon={Calendar}
              name="appointment_date"
              type="date"
              value={state.appointment_date}
              onChange={handleChange}
              min={todayStr}
              disabled={isBusy}
              error={state.errors.appointment_date}
              required
            />
            <FormField
              label="Appointment Time"
              icon={Clock}
              name="appointment_time"
              type="time"
              value={state.appointment_time}
              onChange={handleChange}
              disabled={isBusy}
              error={state.errors.appointment_time}
              required
            />
          </div>

          {/* Commission Section */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[11px] font-bold text-[#034A52] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Percent size={13} />
              Doctor Commission Settings
            </p>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Commission Rate (%)"
                icon={Percent}
                name="commission_rate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="e.g. 15"
                value={state.commission_rate}
                onChange={handleChange}
                disabled={isBusy}
                error={state.errors.commission_rate}
                required
              />
              <FormField
                label="Effective From"
                icon={CalendarCheck}
                name="effective_from"
                type="date"
                value={state.effective_from}
                onChange={handleChange}
                disabled={isBusy}
                error={state.errors.effective_from}
                required
              />
            </div>

            <p className="mt-2 text-[10px] text-slate-400 italic">
              Commission rate will be applied from the effective date for all
              future completed appointments.
            </p>
          </div>

          {state.errors.duplicate && (
            <div className="bg-rose-50 rounded-xl p-3 border border-rose-200">
              <p className="flex items-center gap-2 text-xs text-rose-700">
                <AlertCircle size={14} />
                {state.errors.duplicate}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={close}
            disabled={isBusy}
            className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-50 active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isBusy || noDoctors}
            className="rounded-xl bg-[#034A52] hover:bg-[#02373d] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#034A52]/20 transition-all duration-200 active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            {isBusy ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <CalendarDays size={16} />
                Schedule Appointment
              </>
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

/* -------------------------------------------------------------------------- */
/*                           Small Subcomponents                              */
/* -------------------------------------------------------------------------- */

const InfoRow = ({ label, value }) => (
  <div>
    <span className="text-slate-500">{label}:</span>
    <span className="ml-2 font-medium text-slate-800">{value || "N/A"}</span>
  </div>
);

export default AddAppointmentModal;
