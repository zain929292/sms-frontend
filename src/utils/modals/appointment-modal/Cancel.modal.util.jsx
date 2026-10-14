/**
 * @file CancelAppointment.modal.util.jsx
 * @module Utils/Modals/CancelAppointment
 * @description Modal to cancel an appointment with a reason.
 */

import { useState, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { AlertCircle, Loader2, FileText, XCircle } from "lucide-react";
import {
  cancelAppointment,
  fetchAppointments,
} from "../../../redux/slices/Appointment.slice.redux";
import ModalShell from "../../../shared/ModalShell.shared";

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

const CancelAppointmentModal = ({ isOpen, onClose, appointment }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setErrors({});
      setLoading(false);
    }
  }, [isOpen]);

  const validate = useCallback(() => {
    const newErrors = {};
    const trimmed = reason.trim();
    if (!trimmed) newErrors.reason = "Please provide a reason for cancellation";
    else if (trimmed.length < 5)
      newErrors.reason = "Reason must be at least 5 characters long";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [reason]);

  const handleClose = useCallback(() => {
    setReason("");
    setErrors({});
    onClose();
  }, [onClose]);

  const handleReasonChange = useCallback((e) => {
    setReason(e.target.value);
    setErrors((prev) => (prev.reason ? { ...prev, reason: "" } : prev));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validate()) {
        toast.error("Please provide a valid reason for cancellation.");
        return;
      }

      setLoading(true);
      const id = appointment.id || appointment._id;

      try {
        await dispatch(
          cancelAppointment({ id, reason: reason.trim() }),
        ).unwrap();
        toast.success("Appointment cancelled successfully!");
        dispatch(fetchAppointments());
        handleClose();
      } catch (err) {
        const message =
          err?.message || "Failed to cancel appointment. Please try again.";
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
    [appointment, reason, validate, dispatch, handleClose],
  );

  if (!appointment) return null;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      disabled={loading}
      title="Cancel Appointment"
      subtitle="Cancel the appointment and provide a reason"
      icon={<XCircle size={22} />}
      iconClass="from-rose-500 to-red-500"
      accentShadow="shadow-rose-900/20"
    >
      {/* Summary */}
      <div className="px-6 pt-4 pb-2">
        <div className="bg-rose-50/80 rounded-2xl p-4 border border-rose-200/80">
          <p className="text-xs font-semibold text-rose-800 uppercase tracking-wider mb-2 flex items-center gap-2">
            <AlertCircle size={14} />
            Appointment to Cancel
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <SummaryRow
              label="Patient"
              value={appointment.patient?.name}
              color="text-rose-700"
            />
            <SummaryRow
              label="Doctor"
              value={appointment.doctor?.name}
              color="text-rose-700"
            />
            <SummaryRow
              label="Date"
              value={formatDate(appointment.appointment_date)}
              color="text-rose-700"
            />
            <SummaryRow
              label="Time"
              value={formatTime(appointment.appointment_time)}
              color="text-rose-700"
            />
            <div className="col-span-2">
              <span className="text-rose-700">Status:</span>
              <span className="ml-2 font-medium text-slate-800">
                {appointment.status || "Pending"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Reason for Cancellation <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <FileText
              size={18}
              className="absolute left-3.5 top-3 text-slate-400"
            />
            <textarea
              value={reason}
              onChange={handleReasonChange}
              placeholder="Please provide a detailed reason for canceling this appointment..."
              rows={4}
              className={`w-full rounded-xl border ${
                errors.reason ? "border-rose-500" : "border-slate-200"
              } bg-white pl-10 pr-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-[#034A52] focus:ring-2 focus:ring-[#034A52]/20 resize-none`}
            />
          </div>
          {errors.reason && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-500">
              <AlertCircle size={12} /> {errors.reason}
            </p>
          )}
          <p className="mt-1 text-xs text-slate-400">
            Minimum 5 characters required
          </p>
        </div>

        <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
          <p className="text-xs text-amber-700 flex items-center gap-2">
            <AlertCircle size={14} />
            This action cannot be undone. The appointment status will be updated
            to "Cancelled".
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-50 active:scale-95 disabled:opacity-50"
          >
            Keep Appointment
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-gradient-to-r from-rose-500 to-red-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-900/20 transition-all duration-200 active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Cancelling...
              </>
            ) : (
              <>
                <XCircle size={16} />
                Cancel Appointment
              </>
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

const SummaryRow = ({ label, value, color }) => (
  <div>
    <span className={color}>{label}:</span>
    <span className="ml-2 font-medium text-slate-800">{value || "N/A"}</span>
  </div>
);

export default CancelAppointmentModal;
