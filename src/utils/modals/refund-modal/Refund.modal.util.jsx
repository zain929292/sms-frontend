/**
 * @file Refund.modal.util.jsx
 * @module RefundModal
 * @description Create / Edit a refund for a specific bill.
 *              Triggered from the Bill row actions menu.
 *
 * Payload:
 *   {
 *     bill_id, consultation_fee, lab_charges, ipd_charges,
 *     medical_charges, others, total_refund_amount,
 *     refund_method, reason
 *   }
 *
 * Features:
 *   - Auto-fills breakdown from the bill's actual charges.
 *   - Auto-calculates total_refund_amount = sum of breakdown (create mode).
 *   - Refreshes BOTH refunds and bills after submit so status updates.
 */

import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  RotateCcw,
  User,
  FileText,
  Loader2,
  Edit,
  Sparkles,
  AlertCircle,
  Stethoscope,
  Hash,
  CreditCard,
  Building,
  ShieldCheck,
  FlaskConical,
  Banknote,
} from "lucide-react";

import {
  createRefund,
  updateRefund,
  fetchAllRefunds,
} from "../../../redux/slices/Refund.slice.redux";
import { fetchAllBills } from "../../../redux/slices/Bill.slice.redux";
import ModalShell from "../../../shared/ModalShell.shared";

/* ------------------------------- Constants ------------------------------- */

const DEFAULT_FORM = {
  bill_id: "",
  consultation_fee: "",
  lab_charges: "",
  ipd_charges: "",
  medical_charges: "",
  others: "",
  total_refund_amount: "",
  refund_method: "cash",
  reason: "",
};

const REFUND_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "jazzcash", label: "JazzCash" },
  { value: "easypaisa", label: "Easypaisa" },
  { value: "cheque", label: "Cheque" },
];

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

/* ------------------------------- Helpers --------------------------------- */

const num = (v) => {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
};

const fmt = (v) => `PKR ${num(v).toFixed(2)}`;

const withMinDelay = (promise, ms = 500) =>
  Promise.all([
    promise,
    new Promise((resolve) => setTimeout(resolve, ms)),
  ]).then(([result]) => result);

const validate = (form) => {
  const errors = {};
  if (!form.bill_id) errors.bill_id = "Bill is required";

  const amountFields = [
    ["consultation_fee", "Consultation fee"],
    ["lab_charges", "Lab charges"],
    ["ipd_charges", "IPD charges"],
    ["medical_charges", "Medical charges"],
    ["others", "Others"],
  ];
  for (const [key, label] of amountFields) {
    if (form[key] !== "" && num(form[key]) < 0) {
      errors[key] = `${label} must be 0 or more`;
    }
  }

  if (form.total_refund_amount === "" || num(form.total_refund_amount) <= 0) {
    errors.total_refund_amount = "Refund amount must be greater than 0";
  }
  if (!form.refund_method) errors.refund_method = "Refund method is required";
  if (!form.reason.trim()) errors.reason = "Reason is required";
  return errors;
};

/* ------------------------------- Component ------------------------------- */

const RefundModal = ({ isOpen, onClose, bill = null, refund = null }) => {
  const dispatch = useDispatch();
  const isEditMode = Boolean(refund);

  const creating = useSelector((s) => s.refund?.creating || false);
  const updating = useSelector((s) => s.refund?.updating || false);

  const [submitting, setSubmitting] = useState(false);
  const isLoading = submitting || creating || updating;

  const [state, dispatchAction] = useReducer(reducer, initialState);

  /* --------------------------- Populate form --------------------------- */

  useEffect(() => {
    if (!isOpen) return;

    if (isEditMode && refund) {
      dispatchAction({
        type: "INIT",
        form: {
          bill_id: refund.bill_id ?? bill?.id ?? "",
          consultation_fee: refund.consultation_fee ?? "",
          lab_charges: refund.lab_charges ?? "",
          ipd_charges: refund.ipd_charges ?? "",
          medical_charges: refund.medical_charges ?? "",
          others: refund.others ?? "",
          total_refund_amount: refund.total_refund_amount ?? "",
          refund_method: refund.refund_method || "cash",
          reason: refund.reason || "",
        },
      });
    } else {
      // Create mode — pre-fill from the bill's ACTUAL charges
      dispatchAction({
        type: "INIT",
        form: {
          ...DEFAULT_FORM,
          bill_id: bill?.id || bill?._id || "",
          consultation_fee: bill?.consultation_fee || "",
          lab_charges: bill?.lab_charges || "",
          ipd_charges: bill?.ipd_charges || "",
          medical_charges: bill?.medical_charges || "",
          others: bill?.other_charges || "",
        },
      });
    }
  }, [isOpen, isEditMode, refund, bill]);

  /* --------- Auto-calculate total_refund_amount from breakdown --------- */

  const breakdownTotal = useMemo(() => {
    return (
      num(state.form.consultation_fee) +
      num(state.form.lab_charges) +
      num(state.form.ipd_charges) +
      num(state.form.medical_charges) +
      num(state.form.others)
    );
  }, [
    state.form.consultation_fee,
    state.form.lab_charges,
    state.form.ipd_charges,
    state.form.medical_charges,
    state.form.others,
  ]);

  // Auto-fill total in create mode when breakdown changes
  useEffect(() => {
    if (!isOpen) return;
    if (isEditMode) return;

    const currentTotal = num(state.form.total_refund_amount);
    if (Math.abs(currentTotal - breakdownTotal) > 0.01) {
      dispatchAction({
        type: "SET_FIELD",
        field: "total_refund_amount",
        value: breakdownTotal === 0 ? "" : String(breakdownTotal),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breakdownTotal, isOpen, isEditMode]);

  /* ---------------------------- Handlers ------------------------------- */

  const close = useCallback(() => {
    if (submitting) return;
    dispatchAction({ type: "RESET" });
    onClose();
  }, [onClose, submitting]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    dispatchAction({ type: "SET_FIELD", field: name, value });
  }, []);

  /* --------------------------- Submit handler -------------------------- */

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const errors = validate(state.form);
      dispatchAction({ type: "SET_ERRORS", errors });
      if (Object.keys(errors).length > 0) {
        toast.error("Please fix the errors.");
        return;
      }

      const payload = {
        bill_id: Number(state.form.bill_id),
        consultation_fee: num(state.form.consultation_fee),
        lab_charges: num(state.form.lab_charges),
        ipd_charges: num(state.form.ipd_charges),
        medical_charges: num(state.form.medical_charges),
        others: num(state.form.others),
        total_refund_amount: num(state.form.total_refund_amount),
        refund_method: state.form.refund_method,
        reason: state.form.reason.trim(),
      };

      setSubmitting(true);
      try {
        if (isEditMode) {
          const id = refund.id || refund._id;
          const res = await withMinDelay(
            dispatch(updateRefund({ id, ...payload })).unwrap(),
            500,
          );
          toast.success(res?.message || "Refund updated successfully!");
        } else {
          const res = await withMinDelay(
            dispatch(createRefund(payload)).unwrap(),
            500,
          );
          toast.success(res?.message || "Refund created successfully!");
        }

        // Refresh BOTH refunds AND bills so bill status reflects the change
        await Promise.all([
          dispatch(fetchAllRefunds()),
          dispatch(fetchAllBills()),
        ]);

        setSubmitting(false);
        dispatchAction({ type: "RESET" });
        onClose();
      } catch (err) {
        setSubmitting(false);
        const message =
          typeof err === "string"
            ? err
            : err?.message ||
              `Failed to ${isEditMode ? "update" : "create"} refund.`;
        toast.error(message);
      }
    },
    [state.form, isEditMode, refund, dispatch, onClose],
  );

  if (!isOpen) return null;

  const billNumber = bill?.bill_number || `#${bill?.id || bill?._id || "—"}`;
  const patientName =
    bill?.patient_name || `Patient #${bill?.patient_id ?? "—"}`;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={close}
      disabled={isLoading}
      title={
        <>
          {isEditMode ? "Edit Refund" : "New Refund"}
          <Sparkles size={16} className="text-teal-500 inline ml-1" />
        </>
      }
      subtitle={
        isEditMode
          ? `Editing refund for bill ${billNumber}`
          : `Create a refund for bill ${billNumber}`
      }
      icon={isEditMode ? <Edit size={22} /> : <RotateCcw size={22} />}
      iconClass="from-[#034A52] to-teal-500"
      accentShadow="shadow-teal-900/20"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Bill details card (read-only) */}
        <div className="rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50/60 to-cyan-50/60 p-4">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Hash size={14} className="text-slate-400" />
                <span className="font-bold text-slate-900 text-sm">
                  Bill {billNumber}
                </span>
              </div>
              <p className="text-xs text-slate-600 flex items-center gap-1">
                <User size={11} /> {patientName}
              </p>
              {bill?.patient_id != null && (
                <p className="text-[11px] text-slate-400 mt-0.5">
                  PID: #{bill.patient_id}
                </p>
              )}
            </div>
            {bill?.total_amount != null && (
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Bill Total
                </p>
                <p className="font-bold text-slate-900 text-sm">
                  {fmt(bill.total_amount)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Refund breakdown by charge type */}
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Refund Breakdown (per charge type)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MoneyField
              label="Consultation Fee"
              name="consultation_fee"
              value={state.form.consultation_fee}
              onChange={handleChange}
              error={state.errors.consultation_fee}
              icon={Stethoscope}
              disabled={isLoading}
            />
            <MoneyField
              label="IPD Charges"
              name="ipd_charges"
              value={state.form.ipd_charges}
              onChange={handleChange}
              error={state.errors.ipd_charges}
              icon={Building}
              disabled={isLoading}
            />
            <MoneyField
              label="Medical Charges"
              name="medical_charges"
              value={state.form.medical_charges}
              onChange={handleChange}
              error={state.errors.medical_charges}
              icon={ShieldCheck}
              disabled={isLoading}
            />
            <MoneyField
              label="Lab Charges"
              name="lab_charges"
              value={state.form.lab_charges}
              onChange={handleChange}
              error={state.errors.lab_charges}
              icon={FlaskConical}
              disabled={isLoading}
            />
            <MoneyField
              label="Others"
              name="others"
              value={state.form.others}
              onChange={handleChange}
              error={state.errors.others}
              icon={Banknote}
              disabled={isLoading}
            />
            {/* Total Refund Amount — auto in create mode */}
            <MoneyField
              label={`Total Refund Amount${!isEditMode ? " (auto)" : ""}`}
              name="total_refund_amount"
              value={state.form.total_refund_amount}
              onChange={handleChange}
              error={state.errors.total_refund_amount}
              icon={RotateCcw}
              disabled={isLoading || !isEditMode}
              required
            />
          </div>
        </div>

        {/* Refund method */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Refund Method <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <CreditCard
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <select
              name="refund_method"
              value={state.form.refund_method}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full rounded-xl border ${
                state.errors.refund_method
                  ? "border-rose-500 bg-rose-50/30"
                  : "border-slate-200 bg-slate-50/50"
              } pl-10 pr-4 py-2.5 text-sm text-slate-800 outline-none transition-all duration-200 focus:bg-white focus:border-[#034A52] focus:ring-2 focus:ring-[#034A52]/20 disabled:opacity-60`}
            >
              <option value="">Select refund method</option>
              {REFUND_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          {state.errors.refund_method && (
            <p className="mt-1 flex items-center gap-1 text-xs text-rose-500">
              <AlertCircle size={12} /> {state.errors.refund_method}
            </p>
          )}
        </div>

        {/* Reason */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Reason <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <FileText
              size={18}
              className="absolute left-3.5 top-3 text-slate-400 pointer-events-none"
            />
            <textarea
              name="reason"
              value={state.form.reason}
              onChange={handleChange}
              rows={3}
              disabled={isLoading}
              placeholder="Why is this refund being issued?"
              className={`w-full rounded-xl border ${
                state.errors.reason
                  ? "border-rose-400 bg-rose-50/40"
                  : "border-slate-200 bg-slate-50/50"
              } pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-[#034A52] focus:ring-2 focus:ring-[#034A52]/20 resize-none disabled:opacity-50`}
            />
          </div>
          {state.errors.reason && (
            <p className="mt-1 flex items-center gap-1 text-xs text-rose-500">
              <AlertCircle size={12} /> {state.errors.reason}
            </p>
          )}
        </div>

        {/* Summary */}
        {(breakdownTotal > 0 || num(state.form.total_refund_amount) > 0) && (
          <div className="bg-gradient-to-r from-teal-50/60 to-cyan-50/60 border border-teal-100 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 font-medium">
                Breakdown Total
              </span>
              <span className="font-semibold text-slate-700">
                {fmt(breakdownTotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 font-medium">Refund Amount</span>
              <span className="font-bold text-purple-700">
                {fmt(num(state.form.total_refund_amount))}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={close}
            disabled={isLoading}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-50 active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-xl bg-gradient-to-r from-[#034A52] to-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-900/20 transition-all duration-200 hover:shadow-teal-900/30 active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {isEditMode ? "Updating..." : "Saving..."}
              </>
            ) : (
              <>
                {isEditMode ? <Edit size={16} /> : <RotateCcw size={16} />}
                {isEditMode ? "Update Refund" : "Create Refund"}
              </>
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

/* ---------------------------- Sub-components ---------------------------- */

const MoneyField = ({
  label,
  name,
  value,
  onChange,
  error,
  icon: Icon,
  disabled,
  required,
}) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="relative">
      <Icon
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
      <input
        type="number"
        min="0"
        step="0.01"
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder="0.00"
        className={`w-full rounded-xl border ${
          error
            ? "border-rose-400 bg-rose-50/40"
            : "border-slate-200 bg-slate-50/50"
        } pl-10 pr-3 py-2.5 text-sm text-slate-800 outline-none transition-all duration-200 focus:bg-white focus:border-[#034A52] focus:ring-2 focus:ring-[#034A52]/20 disabled:opacity-60 disabled:bg-slate-100`}
      />
    </div>
    {error && (
      <p className="mt-1 flex items-center gap-1 text-xs text-rose-500">
        <AlertCircle size={12} /> {error}
      </p>
    )}
  </div>
);

export default RefundModal;
