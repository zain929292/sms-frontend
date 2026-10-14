/**
 * @file Prescription.modal.util.jsx
 * @module PrescriptionModal
 * @description Prescription create / update modal with nested medicine items.
 */

import { memo, useReducer, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  FileText,
  Plus,
  Trash2,
  Sparkles,
  Edit,
  AlertCircle,
  User,
  Stethoscope,
  Calendar,
  ClipboardList,
  Pill,
} from "lucide-react";
import {
  createPrescription,
  updatePrescription,
  fetchAllPrescriptions,
} from "../../../redux/slices/Prescriptions.slice.redux";
import { fetchAllMedicines } from "../../../redux/slices/Medicine.slice.redux";
import { fetchAppointments } from "../../../redux/slices/Appointment.slice.redux";
import ModalShell from "../../../shared/ModalShell.shared";
import FormField from "../../../shared/FormField.shared";

/* -------------------------------------------------------------------------- */
/*                                Constants                                   */
/* -------------------------------------------------------------------------- */

const TODAY = () => new Date().toISOString().split("T")[0];

const emptyItem = () => ({
  medicine_id: "",
  dosage: "",
  frequency: "",
  duration: "",
  route: "",
  instructions: "",
});

const DEFAULT_FORM = {
  patient_id: "",
  doctor_id: "",
  appointment_id: "",
  prescription_date: TODAY(),
  diagnosis: "",
  symptoms: "",
  notes: "",
  items: [emptyItem()],
};

/* -------------------------------------------------------------------------- */
/*                                  Reducer                                   */
/* -------------------------------------------------------------------------- */

const initialState = { form: DEFAULT_FORM, errors: {} };

const reducer = (state, action) => {
  switch (action.type) {
    case "RESET":
      return {
        form: {
          ...DEFAULT_FORM,
          prescription_date: TODAY(),
          items: [emptyItem()],
        },
        errors: {},
      };
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
    case "SET_ITEMS":
      return { ...state, form: { ...state.form, items: action.items } };
    case "SET_ERRORS":
      return { ...state, errors: action.errors };
    default:
      return state;
  }
};

const validate = (form) => {
  const errors = {};
  if (!form.appointment_id)
    errors.appointment_id = "Please select an appointment";
  if (!form.prescription_date)
    errors.prescription_date = "Prescription date is required";
  if (!form.diagnosis.trim()) errors.diagnosis = "Diagnosis is required";

  form.items.forEach((item, i) => {
    if (!item.medicine_id)
      errors[`items_${i}_medicine_id`] = "Medicine is required";
    if (!item.dosage.trim()) errors[`items_${i}_dosage`] = "Dosage is required";
    if (!item.frequency.trim())
      errors[`items_${i}_frequency`] = "Frequency is required";
    if (!item.duration.trim())
      errors[`items_${i}_duration`] = "Duration is required";
  });
  return errors;
};

/* -------------------------------------------------------------------------- */
/*                        Medicine Item Row (memo)                            */
/* -------------------------------------------------------------------------- */

const MedicineItemRow = memo(
  ({ index, item, medicines, errors, onChange, onRemove, disabled }) => {
    const err = (field) => errors[`items_${index}_${field}`];

    return (
      <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Medicine #{index + 1}
          </span>
          <button
            type="button"
            onClick={() => onRemove(index)}
            disabled={disabled}
            className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition-all disabled:opacity-50"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <FormField
              label="Medicine"
              icon={Pill}
              name={`med_${index}`}
              value={item.medicine_id}
              onChange={(e) => onChange(index, "medicine_id", e.target.value)}
              disabled={disabled}
              error={err("medicine_id")}
              required
              options={medicines.map((m) => ({
                value: m.id || m._id,
                label: `${m.name} - ${m.company} (Stock: ${m.stock})`,
              }))}
            />
          </div>

          <FormField
            label="Dosage"
            name={`dosage_${index}`}
            value={item.dosage}
            onChange={(e) => onChange(index, "dosage", e.target.value)}
            disabled={disabled}
            placeholder="e.g., 500mg"
            error={err("dosage")}
            required
          />
          <FormField
            label="Frequency"
            name={`freq_${index}`}
            value={item.frequency}
            onChange={(e) => onChange(index, "frequency", e.target.value)}
            disabled={disabled}
            placeholder="e.g., 2x/day"
            error={err("frequency")}
            required
          />
          <FormField
            label="Duration"
            name={`dur_${index}`}
            value={item.duration}
            onChange={(e) => onChange(index, "duration", e.target.value)}
            disabled={disabled}
            placeholder="e.g., 7 days"
            error={err("duration")}
            required
          />
          <FormField
            label="Route"
            name={`route_${index}`}
            value={item.route}
            onChange={(e) => onChange(index, "route", e.target.value)}
            disabled={disabled}
            placeholder="e.g., Oral"
          />
          <div className="col-span-2">
            <FormField
              label="Instructions"
              name={`inst_${index}`}
              value={item.instructions}
              onChange={(e) => onChange(index, "instructions", e.target.value)}
              disabled={disabled}
              placeholder="e.g., after meal"
            />
          </div>
        </div>
      </div>
    );
  },
);
MedicineItemRow.displayName = "MedicineItemRow";

/* -------------------------------------------------------------------------- */
/*                              Component                                     */
/* -------------------------------------------------------------------------- */

const PrescriptionModal = ({
  isOpen,
  onClose,
  initialData = null,
  preselectedAppointment = null,
}) => {
  const dispatch = useDispatch();
  const isEditMode = Boolean(initialData);
  const isAppointmentPreselected = Boolean(preselectedAppointment);

  const reduxLoading = useSelector((s) => s.prescription?.loading ?? false);
  const medicines = useSelector(
    (s) => s.medicine?.medicines || s.pharmacy?.medicines || [],
  );
  const appointments = useSelector((s) => s.appointment?.appointments ?? []);

  const [state, dispatchAction] = useReducer(reducer, initialState);

  /* ------------------------------- Effects ------------------------------- */

  useEffect(() => {
    if (!isOpen) return;
    dispatch(fetchAllMedicines());
    dispatch(fetchAppointments());
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (!isOpen) return;

    if (isEditMode && initialData) {
      dispatchAction({
        type: "INIT",
        form: {
          patient_id: initialData.patient_id || "",
          doctor_id: initialData.doctor_id || "",
          appointment_id: initialData.appointment_id || "",
          prescription_date: initialData.prescription_date
            ? initialData.prescription_date.split("T")[0]
            : TODAY(),
          diagnosis: initialData.diagnosis || "",
          symptoms: initialData.symptoms || "",
          notes: initialData.notes || "",
          items:
            initialData.items?.length > 0 ? initialData.items : [emptyItem()],
        },
      });
    } else if (preselectedAppointment) {
      dispatchAction({
        type: "INIT",
        form: {
          patient_id: preselectedAppointment.patient_id || "",
          doctor_id: preselectedAppointment.doctor_id || "",
          appointment_id:
            preselectedAppointment.id || preselectedAppointment._id || "",
          prescription_date: TODAY(),
          diagnosis: "",
          symptoms: "",
          notes: "",
          items: [emptyItem()],
        },
      });
    } else {
      dispatchAction({ type: "RESET" });
    }
  }, [isOpen, isEditMode, initialData, preselectedAppointment]);

  /* ------------------------------ Handlers ------------------------------- */

  const close = useCallback(() => {
    dispatchAction({ type: "RESET" });
    onClose();
  }, [onClose]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    dispatchAction({ type: "SET_FIELD", field: name, value });
  }, []);

  const handleAppointmentChange = useCallback(
    (e) => {
      const appointmentId = e.target.value;
      const selected = appointments.find(
        (app) => String(app.id || app._id) === String(appointmentId),
      );

      if (selected) {
        dispatchAction({
          type: "SET_FIELD",
          field: "appointment_id",
          value: appointmentId,
        });
        dispatchAction({
          type: "SET_FIELD",
          field: "patient_id",
          value: selected.patient_id || "",
        });
        dispatchAction({
          type: "SET_FIELD",
          field: "doctor_id",
          value: selected.doctor_id || "",
        });
      } else {
        dispatchAction({
          type: "SET_FIELD",
          field: "appointment_id",
          value: appointmentId,
        });
        dispatchAction({
          type: "SET_FIELD",
          field: "patient_id",
          value: "",
        });
        dispatchAction({
          type: "SET_FIELD",
          field: "doctor_id",
          value: "",
        });
      }
    },
    [appointments],
  );

  const handleItemChange = useCallback(
    (index, field, value) => {
      const items = [...state.form.items];
      items[index] = { ...items[index], [field]: value };
      dispatchAction({ type: "SET_ITEMS", items });

      const errKey = `items_${index}_${field}`;
      if (state.errors[errKey]) {
        dispatchAction({
          type: "SET_ERRORS",
          errors: { ...state.errors, [errKey]: "" },
        });
      }
    },
    [state.form.items, state.errors],
  );

  const handleAddItem = useCallback(() => {
    dispatchAction({
      type: "SET_ITEMS",
      items: [...state.form.items, emptyItem()],
    });
  }, [state.form.items]);

  const handleRemoveItem = useCallback(
    (index) => {
      if (state.form.items.length === 1) {
        toast.error("At least one medicine is required.");
        return;
      }
      dispatchAction({
        type: "SET_ITEMS",
        items: state.form.items.filter((_, i) => i !== index),
      });
    },
    [state.form.items],
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const errors = validate(state.form);
      dispatchAction({ type: "SET_ERRORS", errors });
      if (Object.keys(errors).length) {
        toast.error("Please fix the errors before submitting.");
        return;
      }

      try {
        if (isEditMode) {
          const id = initialData.id || initialData._id;
          await dispatch(updatePrescription({ id, ...state.form })).unwrap();
          toast.success("Prescription updated successfully!");
        } else {
          await dispatch(createPrescription(state.form)).unwrap();
          toast.success("Prescription created successfully!");
        }
        dispatch(fetchAllPrescriptions());
        close();
      } catch (err) {
        toast.error(err?.message || "Operation failed.");
        if (err?.errors) {
          const fieldErrors = {};
          Object.keys(err.errors).forEach((k) => {
            fieldErrors[k] = err.errors[k][0];
          });
          dispatchAction({ type: "SET_ERRORS", errors: fieldErrors });
        }
      }
    },
    [state.form, isEditMode, initialData, dispatch, close],
  );

  /* --------------------------- Display helpers --------------------------- */

  const selectedAppointment = useMemo(
    () =>
      appointments.find(
        (app) =>
          String(app.id || app._id) === String(state.form.appointment_id),
      ),
    [appointments, state.form.appointment_id],
  );

  const getPatientName = () => {
    if (selectedAppointment)
      return (
        selectedAppointment.patient?.name ||
        selectedAppointment.patient_name ||
        `Patient #${selectedAppointment.patient_id}`
      );
    if (preselectedAppointment && !state.form.appointment_id)
      return (
        preselectedAppointment.patient?.name ||
        preselectedAppointment.patient_name ||
        `Patient #${preselectedAppointment.patient_id}`
      );
    return "No appointment selected";
  };

  const getDoctorName = () => {
    if (selectedAppointment)
      return (
        selectedAppointment.doctor?.name ||
        selectedAppointment.doctor_name ||
        `Doctor #${selectedAppointment.doctor_id}`
      );
    if (preselectedAppointment && !state.form.appointment_id)
      return (
        preselectedAppointment.doctor?.name ||
        preselectedAppointment.doctor_name ||
        `Doctor #${preselectedAppointment.doctor_id}`
      );
    return "No appointment selected";
  };

  const isLoading = reduxLoading;

  /* ------------------------------- Render -------------------------------- */

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={close}
      disabled={isLoading}
      title={
        <>
          {isEditMode ? "Update Prescription" : "New Prescription"}
          <Sparkles size={16} className="text-teal-500 inline ml-1" />
        </>
      }
      subtitle={
        isEditMode
          ? "Update details for selected prescription"
          : "Create a new prescription for patient"
      }
      icon={isEditMode ? <Edit size={22} /> : <FileText size={22} />}
      iconClass="from-[#034A52] to-teal-500"
      accentShadow="shadow-teal-900/20"
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Appointment */}
          <div className="sm:col-span-2">
            {isAppointmentPreselected ? (
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Appointment <span className="text-rose-500">*</span>
                </label>
                <div className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-4 pr-4 py-2.5 text-sm text-slate-700 flex items-center">
                  <span className="font-medium">
                    #{preselectedAppointment.id || preselectedAppointment._id} -
                    Patient: {getPatientName()} - Doctor: {getDoctorName()}
                  </span>
                  <span className="ml-2 text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                    Pre-selected
                  </span>
                </div>
              </div>
            ) : (
              <FormField
                label="Select Appointment"
                icon={Calendar}
                name="appointment_id"
                value={state.form.appointment_id}
                onChange={handleAppointmentChange}
                disabled={isLoading}
                error={state.errors.appointment_id}
                required
                options={appointments.map((app) => ({
                  value: app.id || app._id,
                  label: `#${app.id || app._id} - ${
                    app.patient?.name ||
                    app.patient_name ||
                    `Patient #${app.patient_id}`
                  } - ${
                    app.doctor?.name ||
                    app.doctor_name ||
                    `Doctor #${app.doctor_id}`
                  } (${app.appointment_date})`,
                }))}
              />
            )}
          </div>

          {/* Patient (read-only) */}
          <FormField
            label="Patient"
            icon={User}
            name="patient_name"
            value={getPatientName()}
            disabled
            hint="Auto-filled from appointment"
          />

          {/* Doctor (read-only) */}
          <FormField
            label="Doctor"
            icon={Stethoscope}
            name="doctor_name"
            value={getDoctorName()}
            disabled
            hint="Auto-filled from appointment"
          />

          <FormField
            label="Prescription Date"
            icon={Calendar}
            name="prescription_date"
            type="date"
            value={state.form.prescription_date}
            onChange={handleChange}
            disabled={isLoading}
            error={state.errors.prescription_date}
            required
          />

          <div className="sm:col-span-2">
            <FormField
              label="Diagnosis"
              icon={ClipboardList}
              name="diagnosis"
              value={state.form.diagnosis}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="e.g., Type 2 Diabetes Mellitus"
              error={state.errors.diagnosis}
              required
            />
          </div>

          <FormField
            label="Symptoms"
            name="symptoms"
            multiline
            rows={2}
            value={state.form.symptoms}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="List symptoms..."
          />

          <FormField
            label="Notes"
            name="notes"
            multiline
            rows={2}
            value={state.form.notes}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="Additional notes..."
          />
        </div>

        {/* Medicines */}
        <div className="border-t border-slate-100 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Pill size={16} className="text-[#00A3AD]" />
              Prescribed Medicines
            </h3>
            <button
              type="button"
              onClick={handleAddItem}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 text-[#00A3AD] hover:text-[#008C94] text-sm font-semibold transition-all"
            >
              <Plus size={16} />
              Add Medicine
            </button>
          </div>

          <div className="space-y-4">
            {state.form.items.map((item, index) => (
              <MedicineItemRow
                key={index}
                index={index}
                item={item}
                medicines={medicines}
                errors={state.errors}
                onChange={handleItemChange}
                onRemove={handleRemoveItem}
                disabled={isLoading}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={close}
            disabled={isLoading}
            className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-50 active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-xl bg-[#034A52] hover:bg-[#02373d] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#034A52]/20 transition-all duration-200 active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                {isEditMode ? "Updating..." : "Saving..."}
              </>
            ) : isEditMode ? (
              "Update Prescription"
            ) : (
              "Save Prescription"
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export default PrescriptionModal;
