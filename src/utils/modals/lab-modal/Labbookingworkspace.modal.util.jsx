/**
 * @file LabBookingWorkspace.modal.util.jsx
 * @module LabBookingWorkspaceModal
 * @description Sample / Result / Charge management scoped to a single Lab Booking.
 * Each Sample / Result is now tied to a specific `lab_booking_test_id`
 * (the junction row) — required by the backend.
 */

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  FlaskConical,
  TestTube,
  Sparkles,
  Hash,
  Clock,
  Activity,
  FileText,
  User,
  Calendar,
  FileImage,
  CheckCircle2,
  Receipt,
  Percent,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import {
  createLabSample,
  updateLabSample,
  createLabTestResult,
  updateLabTestResult,
  createLabCharge,
  updateLabCharge,
  fetchLabBookingTestsByBooking,
  fetchAllLabSamples,
  fetchAllLabTestResults,
} from "../../../redux/slices/Lab.slice.redux";
import { getAllUsers } from "../../../redux/slices/Auth.slice.redux";
import ModalShell from "../../../shared/ModalShell.shared";
import FormField from "../../../shared/FormField.shared";

/* ------------------------- URL correction -------------------------------- */

const getCorrectedReportUrl = (url) =>
  url?.replace(
    "shoai-boot-backend.retailer-connect.com/public/storage/",
    "hms.retailer-connect.com/storage/app/public/",
  ) || url;

/* ------------------------------- Constants ------------------------------- */

const SAMPLE_STATUS_OPTIONS = [
  { value: "collected", label: "Collected" },
  { value: "received", label: "Received" },
  { value: "processing", label: "Processing" },
  { value: "rejected", label: "Rejected" },
  { value: "completed", label: "Completed" },
];

const RESULT_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "unpaid", label: "Unpaid" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
  { value: "refund", label: "Refund" },
];

const PAYMENT_METHOD_OPTIONS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "insurance", label: "Insurance" },
  { value: "online", label: "Online Payment" },
];

const SAMPLE_TYPES = ["blood", "urine", "stool", "saliva", "other"].map((v) => ({
  value: v,
  label: v.charAt(0).toUpperCase() + v.slice(1),
}));

const detectSampleType = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("urine")) return "urine";
  if (n.includes("stool") || n.includes("fobt")) return "stool";
  if (n.includes("saliva")) return "saliva";
  if (n.includes("blood") || n.includes("cbc") || n.includes("lft") || n.includes("rft"))
    return "blood";
  return "other";
};

const toLocalDateTime = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 16);
};

/* ------------------------------- Tab button ------------------------------ */

const TabButton = ({ active, onClick, icon: Icon, label, done, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-50 ${active
        ? "bg-[#00A3AD] text-white shadow-sm"
        : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
      }`}
  >
    <Icon size={16} />
    {label}
    {done && <CheckCircle2 size={14} />}
  </button>
);

/* ------------------------- Linked test picker ---------------------------- */

/**
 * Dropdown to pick which `lab_booking_test_id` this Sample/Result belongs to.
 * Shows a warning if no tests are linked yet.
 */
const LinkedTestSelect = ({ linkedTests, value, onChange, error, label = "Lab Test" }) => {
  if (linkedTests.length === 0) {
    return (
      <div className="sm:col-span-2">
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">No lab tests linked to this booking.</p>
            <p className="text-xs">
              Pehle booking mein tests add karein (Edit Booking → Add Lab Test), phir sample/result bana sakte hain.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sm:col-span-2">
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
        {label} <span className="text-rose-500">*</span>
      </label>
      <div className="relative">
        <TestTube
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-[#00A3AD] focus:ring-2 focus:ring-[#00A3AD]/20"
        >
          <option value="">Select a test...</option>
          {linkedTests.map((t) => (
            <option key={t.id} value={t.id}>
              {t.test_name}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
};

/* ------------------------------- Sample Tab ------------------------------ */

const SampleTab = memo(
  ({ booking, sample, linkedTests, users, onSuccess, onSubmittingChange }) => {
    const dispatch = useDispatch();
    const isEdit = Boolean(sample);

    const [form, setForm] = useState(() => ({
      lab_booking_test_id: sample?.lab_booking_test_id || "",
      sample_type:
        sample?.sample_type || detectSampleType(booking?.lab_test_name),
      sample_code:
        sample?.sample_code || `SMP-${Date.now().toString().slice(-6)}`,
      collected_at:
        toLocalDateTime(sample?.collected_at) ||
        new Date().toISOString().slice(0, 16),
      received_at: toLocalDateTime(sample?.received_at),
      collected_by: sample?.collected_by || "",
      received_by: sample?.received_by || "",
      status: sample?.status || "collected",
      notes: sample?.notes || "",
    }));
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
      onSubmittingChange(submitting);
    }, [submitting, onSubmittingChange]);

    // Auto-pick first linked test (only in create mode)
    useEffect(() => {
      if (!isEdit && !form.lab_booking_test_id && linkedTests.length > 0) {
        setForm((p) => ({ ...p, lab_booking_test_id: linkedTests[0].id }));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [linkedTests, isEdit]);

    const handleChange = useCallback((e) => {
      const { name, value } = e.target;
      setForm((p) => ({ ...p, [name]: value }));
      setErrors((p) => (p[name] ? { ...p, [name]: "" } : p));
    }, []);

    const handleSubmit = useCallback(
      async (e) => {
        e.preventDefault();
        const errs = {};
        if (!form.lab_booking_test_id)
          errs.lab_booking_test_id = "Lab test is required";
        if (!form.sample_type) errs.sample_type = "Sample type is required";
        if (!form.sample_code) errs.sample_code = "Sample code is required";
        if (!form.collected_at) errs.collected_at = "Collected date is required";
        if (!form.status) errs.status = "Status is required";
        setErrors(errs);
        if (Object.keys(errs).length) {
          toast.error("Please fix the sample form errors.");
          return;
        }

        setSubmitting(true);
        try {
          const payload = {
            ...form,
            lab_booking_id: Number(booking.id),
            lab_booking_test_id: Number(form.lab_booking_test_id),
            collected_by: form.collected_by ? Number(form.collected_by) : null,
            received_by: form.received_by ? Number(form.received_by) : null,
            received_at: form.received_at || null,
          };
          if (isEdit) {
            await dispatch(updateLabSample({ id: sample.id, ...payload })).unwrap();
            toast.success("Sample updated successfully!");
          } else {
            await dispatch(createLabSample(payload)).unwrap();
            toast.success("Sample recorded successfully!");
          }
          await dispatch(fetchAllLabSamples());
          await onSuccess?.();
        } catch (err) {
          toast.error(err?.message || "Failed to save sample.");
        } finally {
          setSubmitting(false);
        }
      },
      [form, booking, isEdit, sample, dispatch, onSuccess],
    );

    const userOptions = useMemo(
      () => users.map((u) => ({ value: u.id, label: `${u.name} (${u.role})` })),
      [users],
    );

    return (
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* NEW: Linked test selector */}
          <LinkedTestSelect
            linkedTests={linkedTests}
            value={form.lab_booking_test_id}
            onChange={(v) =>
              setForm((p) => ({ ...p, lab_booking_test_id: v }))
            }
            error={errors.lab_booking_test_id}
            label="Which Lab Test is this sample for?"
          />

          <FormField
            label="Sample Type"
            icon={FlaskConical}
            name="sample_type"
            value={form.sample_type}
            onChange={handleChange}
            disabled={submitting}
            options={SAMPLE_TYPES}
            error={errors.sample_type}
            required
          />
          <FormField
            label="Sample Code"
            icon={Hash}
            name="sample_code"
            value={form.sample_code}
            onChange={handleChange}
            disabled={submitting}
            placeholder="SMP-001"
            error={errors.sample_code}
            required
          />
          <FormField
            label="Collected At"
            icon={Clock}
            name="collected_at"
            type="datetime-local"
            value={form.collected_at}
            onChange={handleChange}
            disabled={submitting}
            error={errors.collected_at}
            required
          />
          <FormField
            label="Received At"
            icon={Clock}
            name="received_at"
            type="datetime-local"
            value={form.received_at}
            onChange={handleChange}
            disabled={submitting}
          />
          <FormField
            label="Status"
            icon={Activity}
            name="status"
            value={form.status}
            onChange={handleChange}
            disabled={submitting}
            options={SAMPLE_STATUS_OPTIONS}
            required
          />
          <FormField
            label="Collected By"
            icon={User}
            name="collected_by"
            value={form.collected_by}
            onChange={handleChange}
            disabled={submitting}
            options={[{ value: "", label: "Select User" }, ...userOptions]}
          />
          <FormField
            label="Received By"
            icon={User}
            name="received_by"
            value={form.received_by}
            onChange={handleChange}
            disabled={submitting}
            options={[{ value: "", label: "Select User" }, ...userOptions]}
          />
          <div className="sm:col-span-2">
            <FormField
              label="Notes"
              icon={FileText}
              name="notes"
              multiline
              rows={2}
              value={form.notes}
              onChange={handleChange}
              disabled={submitting}
              placeholder="Sample collection notes..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <SubmitButton
            submitting={submitting}
            label={isEdit ? "Update Sample" : "Save Sample"}
          />
        </div>
      </form>
    );
  },
);
SampleTab.displayName = "SampleTab";

/* ------------------------------- Result Tab ------------------------------ */

const ResultTab = memo(
  ({ booking, result, sample, linkedTests, users, onSuccess, onSubmittingChange }) => {
    const dispatch = useDispatch();
    const isEdit = Boolean(result);

    const [form, setForm] = useState(() => ({
      lab_booking_test_id: result?.lab_booking_test_id || "",
      lab_sample_id: result?.lab_sample_id || sample?.id || "",
      result: result?.result || "",
      test_report: result?.test_report || null,
      reference_range: result?.reference_range || "",
      unit: result?.unit || "",
      interpretation: result?.interpretation || "",
      status: result?.status || "completed",
      reported_by: result?.reported_by || "",
      reported_at:
        result?.reported_at || new Date().toISOString().split("T")[0],
      notes: result?.notes || "",
    }));
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
      onSubmittingChange(submitting);
    }, [submitting, onSubmittingChange]);

    useEffect(() => {
      if (!isEdit && !form.lab_booking_test_id && linkedTests.length > 0) {
        setForm((p) => ({ ...p, lab_booking_test_id: linkedTests[0].id }));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [linkedTests, isEdit]);

    const handleChange = useCallback((e) => {
      const { name, value, files } = e.target;
      if (name === "test_report") {
        setForm((p) => ({ ...p, test_report: files[0] || null }));
      } else {
        setForm((p) => ({ ...p, [name]: value }));
      }
      setErrors((p) => (p[name] ? { ...p, [name]: "" } : p));
    }, []);

    const handleSubmit = useCallback(
      async (e) => {
        e.preventDefault();
        const errs = {};
        if (!form.lab_booking_test_id)
          errs.lab_booking_test_id = "Lab test is required";
        if (!form.result) errs.result = "Result is required";
        if (!form.status) errs.status = "Status is required";
        if (!form.reported_at) errs.reported_at = "Reported date is required";
        setErrors(errs);
        if (Object.keys(errs).length) {
          toast.error("Please fix the result form errors.");
          return;
        }

        setSubmitting(true);
        try {
          const fd = new FormData();
          fd.append("lab_booking_id", Number(booking.id));
          fd.append("lab_booking_test_id", Number(form.lab_booking_test_id));
          if (form.lab_sample_id)
            fd.append("lab_sample_id", Number(form.lab_sample_id));
          fd.append("result", form.result);
          if (form.test_report instanceof File)
            fd.append("test_report", form.test_report);
          fd.append("reference_range", form.reference_range || "");
          fd.append("unit", form.unit || "");
          fd.append("interpretation", form.interpretation || "");
          fd.append("status", form.status);
          if (form.reported_by)
            fd.append("reported_by", Number(form.reported_by));
          fd.append("reported_at", form.reported_at);
          fd.append("notes", form.notes || "");

          if (isEdit) {
            await dispatch(
              updateLabTestResult({ id: result.id, payload: fd }),
            ).unwrap();
            toast.success("Result updated successfully!");
          } else {
            await dispatch(createLabTestResult(fd)).unwrap();
            toast.success("Result recorded successfully!");
          }
          await dispatch(fetchAllLabTestResults());
          await onSuccess?.();
        } catch (err) {
          toast.error(err?.message || "Failed to save result.");
        } finally {
          setSubmitting(false);
        }
      },
      [form, booking, isEdit, result, dispatch, onSuccess],
    );

    const userOptions = useMemo(
      () => users.map((u) => ({ value: u.id, label: `${u.name} (${u.role})` })),
      [users],
    );

    return (
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <LinkedTestSelect
            linkedTests={linkedTests}
            value={form.lab_booking_test_id}
            onChange={(v) =>
              setForm((p) => ({ ...p, lab_booking_test_id: v }))
            }
            error={errors.lab_booking_test_id}
            label="Which Lab Test is this result for?"
          />

          <FormField
            label="Result"
            icon={TestTube}
            name="result"
            value={form.result}
            onChange={handleChange}
            disabled={submitting}
            placeholder="e.g., Positive"
            error={errors.result}
            required
          />
          <FormField
            label="Reference Range"
            icon={FileText}
            name="reference_range"
            value={form.reference_range}
            onChange={handleChange}
            disabled={submitting}
            placeholder="e.g., Negative"
          />
          <FormField
            label="Unit"
            icon={Hash}
            name="unit"
            value={form.unit}
            onChange={handleChange}
            disabled={submitting}
            placeholder="e.g., mg/dL"
          />
          <FormField
            label="Interpretation"
            icon={Activity}
            name="interpretation"
            value={form.interpretation}
            onChange={handleChange}
            disabled={submitting}
            placeholder="e.g., Abnormal"
          />
          <FormField
            label="Status"
            icon={Clock}
            name="status"
            value={form.status}
            onChange={handleChange}
            disabled={submitting}
            options={RESULT_STATUS_OPTIONS}
            required
          />
          <FormField
            label="Reported At"
            icon={Calendar}
            name="reported_at"
            type="date"
            value={form.reported_at}
            onChange={handleChange}
            disabled={submitting}
            error={errors.reported_at}
            required
          />
          <div className="sm:col-span-2">
            <FormField
              label="Reported By"
              icon={User}
              name="reported_by"
              value={form.reported_by}
              onChange={handleChange}
              disabled={submitting}
              options={[{ value: "", label: "Select User" }, ...userOptions]}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Test Report File (PDF/Image)
            </label>
            <div className="relative">
              <FileImage
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="file"
                name="test_report"
                onChange={handleChange}
                disabled={submitting}
                accept=".pdf,image/*"
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-[#00A3AD] focus:ring-2 focus:ring-[#00A3AD]/20 disabled:bg-slate-50 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#00A3AD]/10 file:text-[#00A3AD] hover:file:bg-[#00A3AD]/20"
              />
            </div>
            {typeof form.test_report === "string" && form.test_report && (
              <p className="mt-1 text-xs text-slate-500">
                Current file:{" "}
                <a
                  href={getCorrectedReportUrl(form.test_report)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#00A3AD] underline"
                >
                  View existing report
                </a>
              </p>
            )}
          </div>
          <div className="sm:col-span-2">
            <FormField
              label="Notes"
              icon={FileText}
              name="notes"
              multiline
              rows={2}
              value={form.notes}
              onChange={handleChange}
              disabled={submitting}
              placeholder="Result notes..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <SubmitButton
            submitting={submitting}
            label={isEdit ? "Update Result" : "Save Result"}
          />
        </div>
      </form>
    );
  },
);
ResultTab.displayName = "ResultTab";

/* ------------------------------- Charge Tab ------------------------------ */

const ChargeTab = memo(({ booking, charge, onSuccess, onSubmittingChange }) => {
  const dispatch = useDispatch();
  const isEdit = Boolean(charge);

  const [form, setForm] = useState(() => ({
    amount: charge?.amount || booking?.test_amount || "",
    discount: charge?.discount_percentage || charge?.discount || "0",
    payment_status: charge?.payment_status || "unpaid",
    payment_method: charge?.payment_method || "cash",
    paid_at: charge?.paid_at
      ? new Date(charge.paid_at).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    notes: charge?.notes || "",
  }));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    onSubmittingChange(submitting);
  }, [submitting, onSubmittingChange]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => (p[name] ? { ...p, [name]: "" } : p));
  }, []);

  const total = useMemo(() => {
    const amt = parseFloat(form.amount) || 0;
    const disc = parseFloat(form.discount) || 0;
    const t = amt - (amt * disc) / 100;
    return t >= 0 ? t.toFixed(2) : "0.00";
  }, [form.amount, form.discount]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const errs = {};
      if (!form.amount || parseFloat(form.amount) <= 0)
        errs.amount = "Amount must be greater than 0";
      if (!form.payment_status)
        errs.payment_status = "Payment status is required";
      if (!form.paid_at) errs.paid_at = "Payment date is required";
      setErrors(errs);
      if (Object.keys(errs).length) {
        toast.error("Please fix the charge form errors.");
        return;
      }

      setSubmitting(true);
      try {
        const payload = {
          patient_id: Number(booking.patient_id),
          lab_booking_id: Number(booking.id),
          amount: parseFloat(form.amount),
          discount_percentage: parseFloat(form.discount) || 0,
          total_amount: parseFloat(total),
          payment_status: form.payment_status,
          payment_method: form.payment_method || null,
          paid_at: form.paid_at || null,
          notes: form.notes || null,
        };

        if (isEdit) {
          await dispatch(
            updateLabCharge({ id: charge.id, data: payload }),
          ).unwrap();
          toast.success("Charge updated successfully!");
        } else {
          await dispatch(createLabCharge(payload)).unwrap();
          toast.success("Charge created successfully!");
        }
        await onSuccess?.();
      } catch (err) {
        toast.error(err?.message || "Failed to save charge.");
      } finally {
        setSubmitting(false);
      }
    },
    [form, total, booking, isEdit, charge, dispatch, onSuccess],
  );

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="Amount (PKR)"
          icon={Receipt}
          name="amount"
          type="number"
          step="0.01"
          value={form.amount}
          onChange={handleChange}
          disabled={submitting}
          placeholder="0.00"
          error={errors.amount}
          required
        />
        <FormField
          label="Discount (%)"
          icon={Percent}
          name="discount"
          type="number"
          step="0.01"
          value={form.discount}
          onChange={handleChange}
          disabled={submitting}
          placeholder="0"
        />
        <FormField
          label="Payment Status"
          icon={CheckCircle2}
          name="payment_status"
          value={form.payment_status}
          onChange={handleChange}
          disabled={submitting}
          options={PAYMENT_STATUS_OPTIONS}
          error={errors.payment_status}
          required
        />
        <FormField
          label="Payment Method"
          icon={CreditCard}
          name="payment_method"
          value={form.payment_method}
          onChange={handleChange}
          disabled={submitting}
          options={PAYMENT_METHOD_OPTIONS}
        />
        <div className="sm:col-span-2">
          <FormField
            label="Payment Date"
            icon={Calendar}
            name="paid_at"
            type="date"
            value={form.paid_at}
            onChange={handleChange}
            disabled={submitting}
            error={errors.paid_at}
            required
          />
        </div>
        <div className="sm:col-span-2">
          <div className="bg-gradient-to-r from-teal-50/60 to-cyan-50/60 border border-teal-100 rounded-xl p-4 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Calculated Total:
            </span>
            <span className="text-lg font-extrabold text-[#00A3AD]">
              PKR {total}
            </span>
          </div>
        </div>
        <div className="sm:col-span-2">
          <FormField
            label="Notes"
            icon={FileText}
            name="notes"
            multiline
            rows={2}
            value={form.notes}
            onChange={handleChange}
            disabled={submitting}
            placeholder="Billing notes..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <SubmitButton
          submitting={submitting}
          label={isEdit ? "Update Charge" : "Save Charge"}
        />
      </div>
    </form>
  );
});
ChargeTab.displayName = "ChargeTab";

/* -------------------------- Shared submit button ------------------------- */

const SubmitButton = ({ submitting, label }) => (
  <button
    type="submit"
    disabled={submitting}
    className="rounded-xl bg-[#00A3AD] hover:bg-[#008C94] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-900/20 transition-all duration-200 active:scale-95 flex items-center gap-2 disabled:opacity-50"
  >
    {submitting ? (
      <>
        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        Saving...
      </>
    ) : (
      label
    )}
  </button>
);

/* ------------------------------- Main modal ------------------------------ */

const LabBookingWorkspaceModal = ({
  isOpen,
  onClose,
  booking,
  sample = null,
  result = null,
  charge = null,
  onSuccess,
}) => {
  const dispatch = useDispatch();
  const users = useSelector((s) => s.auth?.users ?? []);
  const linkedTests = useSelector(
    (s) => s.lab?.labBookingTestsByBooking ?? [],
  );
  const testsById = useSelector((s) => {
    const m = new Map();
    for (const t of s.lab?.labTests ?? []) m.set(Number(t.id), t);
    return m;
  });

  const [activeTab, setActiveTab] = useState("sample");
  const [sampleSubmitting, setSampleSubmitting] = useState(false);
  const [resultSubmitting, setResultSubmitting] = useState(false);
  const [chargeSubmitting, setChargeSubmitting] = useState(false);

  const anySubmitting =
    sampleSubmitting || resultSubmitting || chargeSubmitting;

  // Fetch users + linked tests for this booking when opening
  useEffect(() => {
    if (!isOpen || !booking?.id) return;
    setActiveTab("sample");
    dispatch(getAllUsers());
    dispatch(fetchLabBookingTestsByBooking(booking.id));
  }, [isOpen, booking?.id, dispatch]);

  // Map junction rows to displayable { id, test_name }
  const linkedTestOptions = useMemo(() => {
    return linkedTests.map((row) => {
      const test = testsById.get(Number(row.lab_test_id));
      return {
        id: row.id || row._id,
        test_name: test?.test_name || test?.name || `Test #${row.lab_test_id}`,
      };
    });
  }, [linkedTests, testsById]);

  const handleClose = useCallback(() => {
    if (anySubmitting) return;
    onClose();
  }, [anySubmitting, onClose]);

  const handleSuccess = useCallback(async () => {
    await onSuccess?.();
  }, [onSuccess]);

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      disabled={anySubmitting}
      title={
        <>
          Manage Sample &amp; Result
          <Sparkles size={16} className="text-[#00A3AD] inline ml-1" />
        </>
      }
      subtitle={`Booking #${booking?.id} • ${booking?.patient_name || "Patient"} • ${booking?.lab_test_name || "Lab Test"}`}
      icon={<FlaskConical size={22} />}
      iconClass="from-[#00A3AD] to-cyan-500"
      accentShadow="shadow-cyan-900/20"
      maxWidth="max-w-2xl"
    >
      <div className="flex items-center gap-2 px-6 pt-5">
        <TabButton
          active={activeTab === "sample"}
          onClick={() => setActiveTab("sample")}
          icon={FlaskConical}
          label="Sample"
          done={Boolean(sample)}
        />
        <TabButton
          active={activeTab === "result"}
          onClick={() => setActiveTab("result")}
          icon={TestTube}
          label="Result"
          done={Boolean(result)}
        />
        <TabButton
          active={activeTab === "charge"}
          onClick={() => setActiveTab("charge")}
          icon={Receipt}
          label="Charge"
          done={Boolean(charge)}
        />
      </div>

      {activeTab === "sample" && (
        <SampleTab
          key={`sample-${sample?.id ?? "new"}`}
          booking={booking}
          sample={sample}
          linkedTests={linkedTestOptions}
          users={users}
          onSuccess={handleSuccess}
          onSubmittingChange={setSampleSubmitting}
        />
      )}
      {activeTab === "result" && (
        <ResultTab
          key={`result-${result?.id ?? "new"}`}
          booking={booking}
          result={result}
          sample={sample}
          linkedTests={linkedTestOptions}
          users={users}
          onSuccess={handleSuccess}
          onSubmittingChange={setResultSubmitting}
        />
      )}
      {activeTab === "charge" && (
        <ChargeTab
          key={`charge-${charge?.id ?? "new"}`}
          booking={booking}
          charge={charge}
          onSuccess={handleSuccess}
          onSubmittingChange={setChargeSubmitting}
        />
      )}
    </ModalShell>
  );
};

export default LabBookingWorkspaceModal;