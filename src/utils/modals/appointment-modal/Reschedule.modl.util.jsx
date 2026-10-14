/**
 * @file RescheduleAppointment.modal.util.jsx
 * @module Utils/Modals/RescheduleAppointment
 * @description Modal to change appointment date and time.
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import {
  Calendar,
  Clock,
  AlertCircle,
  Loader2,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import {
  updateAppointment,
  fetchAppointments,
} from "../../../redux/slices/Appointment.slice.redux";
import ModalShell from "../../../shared/ModalShell.shared";

const EMPTY_FORM = { appointment_date: "", appointment_time: "" };

const TODAY = () => new Date().toISOString().split("T")[0];

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (timeString) => {
  if (!timeString) return "-";
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${minutes} ${ampm}`;
};

const formatTimeWithSeconds = (time) =>
  !time ? null : time.split(":").length === 3 ? time : `${time}:00`;

const RescheduleAppointmentModal = ({ isOpen, onClose, appointment }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && appointment) {
      const timeWithoutSeconds =
        appointment.appointment_time?.split(":").slice(0, 2).join(":") || "";
      setFormData({
        appointment_date: appointment.appointment_date || "",
        appointment_time: timeWithoutSeconds,
      });
      setErrors({});
      setLoading(false);
    }
  }, [isOpen, appointment]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: "" } : prev));
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};
    if (!formData.appointment_date) {
      newErrors.appointment_date = "Appointment date is required";
    } else {
      const selected = new Date(formData.appointment_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        newErrors.appointment_date = "Appointment date cannot be in the past";
      }
    }
    if (!formData.appointment_time) {
      newErrors.appointment_time = "Appointment time is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleClose = useCallback(() => {
    setFormData(EMPTY_FORM);
    setErrors({});
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validate()) {
        toast.error("Please fix the errors in the form before submitting.");
        return;
      }

      setLoading(true);
      const id = appointment.id || appointment._id;

      const updateData = {
        patient_id: appointment.patient_id || appointment.patient?.id,
        doctor_id: appointment.doctor_id || appointment.doctor?.id,
        appointment_date: formData.appointment_date,
        appointment_time: formatTimeWithSeconds(formData.appointment_time),
        status: "Rescheduled",
      };

      try {
        await dispatch(updateAppointment({ id, data: updateData })).unwrap();
        toast.success("Appointment rescheduled successfully!");
        dispatch(fetchAppointments());
        handleClose();
      } catch (err) {
        const message =
          err?.message || "Failed to reschedule appointment. Please try again.";
        toast.error(message);
        if (err?.errors) {
          const fieldErrors = {};
          Object.keys(err.errors).forEach((k) => {
            fieldErrors[k] = err.errors[k][0];
          });
          setErrors(fieldErrors);
        }
      } finally {
        setLoading(false);
      }
    },
    [appointment, formData, validate, dispatch, handleClose],
  );

  const todayStr = useMemo(() => TODAY(), []);

  if (!appointment) return null;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      disabled={loading}
      title={
        <>
          Reschedule Appointment
          <Sparkles size={16} className="text-amber-500 inline ml-1" />
        </>
      }
      subtitle="Change appointment date and time"
      icon={<RefreshCw size={22} />}
      iconClass="from-amber-500 to-orange-500"
      accentShadow="shadow-amber-900/20"
    >
      {/* Summary */}
      <div className="px-6 pt-4 pb-2">
        <div className="bg-amber-50/80 rounded-2xl p-4 border border-amber-200/80">
          <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-2">
            <AlertCircle size={14} />
            Current Appointment Details
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <SummaryRow label="Patient" value={appointment.patient?.name} />
            <SummaryRow label="Doctor" value={appointment.doctor?.name} />
            <SummaryRow
              label="Current Date"
              value={formatDate(appointment.appointment_date)}
            />
            <SummaryRow
              label="Current Time"
              value={formatTime(appointment.appointment_time)}
            />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <DateField
            label="New Date"
            icon={Calendar}
            name="appointment_date"
            type="date"
            value={formData.appointment_date}
            onChange={handleChange}
            min={todayStr}
            error={errors.appointment_date}
          />
          <DateField
            label="New Time"
            icon={Clock}
            name="appointment_time"
            type="time"
            value={formData.appointment_time}
            onChange={handleChange}
            error={errors.appointment_time}
          />
        </div>

        <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
          <p className="text-xs text-blue-700 flex items-center gap-2">
            <AlertCircle size={14} />
            The appointment status will be updated to "Rescheduled"
            automatically.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-50 active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-900/20 transition-all duration-200 active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Rescheduling...
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                Reschedule Appointment
              </>
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

const SummaryRow = ({ label, value }) => (
  <div>
    <span className="text-amber-700">{label}:</span>
    <span className="ml-2 font-medium text-slate-800">{value || "N/A"}</span>
  </div>
);

const DateField = ({
  label,
  icon: Icon,
  name,
  type,
  value,
  onChange,
  error,
  min,
}) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
      {label} <span className="text-rose-500">*</span>
    </label>
    <div className="relative">
      <Icon
        size={18}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        min={min}
        className={`w-full rounded-xl border ${
          error ? "border-rose-500" : "border-slate-200"
        } bg-white pl-10 pr-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-[#034A52] focus:ring-2 focus:ring-[#034A52]/20`}
      />
    </div>
    {error && (
      <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-500">
        <AlertCircle size={12} /> {error}
      </p>
    )}
  </div>
);

export default RescheduleAppointmentModal;
