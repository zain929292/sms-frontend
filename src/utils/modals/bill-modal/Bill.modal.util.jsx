/**
 * @file Bill.modal.util.jsx
 * @module BillModal
 * @description Create / Edit a patient bill.
 * Total = ipd + consultation + medical + lab + other − discount.
 * Amounts are OPTIONAL. Only the patient is required.
 * If the selected patient already has a bill (create mode only), the
 * "Create Bill" button is disabled automatically.
 */

import { useCallback, useEffect, useReducer, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  Receipt,
  User,
  Wallet,
  FileText,
  Percent,
  Banknote,
  Loader2,
  Edit,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Building,
  Stethoscope,
  FlaskConical,
  ShieldCheck,
} from "lucide-react";

import {
  createBill,
  updateBill,
  fetchAllBills,
} from "../../../redux/slices/Bill.slice.redux";
import ModalShell from "../../../shared/ModalShell.shared";

/* ------------------------------- Constants ------------------------------- */

const DEFAULT_FORM = {
  patient_id: "",
  discounted_amount: "",
  other_charges: "",
  paid_amount: "",
  notes: "",
};

// Extra read-only fields we keep locally for the total/balance calculation
const DEFAULT_EXTRAS = {
  ipd_charges: 0,
  consultation_fee: 0,
  medical_charges: 0,
  lab_charges: 0,
};

const initialState = { form: DEFAULT_FORM, extras: DEFAULT_EXTRAS, errors: {} };

const reducer = (state, action) => {
  switch (action.type) {
    case "RESET":
      return { form: DEFAULT_FORM, extras: DEFAULT_EXTRAS, errors: {} };
    case "INIT":
      return {
        form: action.form,
        extras: action.extras || DEFAULT_EXTRAS,
        errors: {},
      };
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
  if (!form.patient_id) errors.patient_id = "Patient is required";

  if (form.discounted_amount !== "" && num(form.discounted_amount) < 0)
    errors.discounted_amount = "Must be 0 or more";
  if (form.other_charges !== "" && num(form.other_charges) < 0)
    errors.other_charges = "Must be 0 or more";
  if (form.paid_amount !== "" && num(form.paid_amount) < 0)
    errors.paid_amount = "Must be 0 or more";
  return errors;
};

/* ------------------------------- Component ------------------------------- */

const BillModal = ({
  isOpen,
  onClose,
  bill = null,
  patients = [],
  existingPatientIds = new Set(),
}) => {
  const dispatch = useDispatch();
  const isEditMode = Boolean(bill);

  const creating = useSelector((s) => s.billing?.creating || false);
  const updating = useSelector((s) => s.billing?.updating || false);

  const [submitting, setSubmitting] = useState(false);
  const isLoading = submitting || creating || updating;

  const [state, dispatchAction] = useReducer(reducer, initialState);

  /* ------------------------ Duplicate detection ------------------------ */

  const existingSet = useMemo(() => {
    if (existingPatientIds instanceof Set) return existingPatientIds;
    const s = new Set();
    for (const x of existingPatientIds || []) s.add(Number(x));
    return s;
  }, [existingPatientIds]);

  const duplicateExists = useMemo(() => {
    if (isEditMode) return false;
    const pid = state.form.patient_id;
    if (pid === "" || pid == null) return false;
    return existingSet.has(Number(pid));
  }, [state.form.patient_id, existingSet, isEditMode]);

  const canSubmit = !isLoading && !duplicateExists;

  /* ---------------------------- Populate ------------------------------- */

  useEffect(() => {
    if (!isOpen) return;
    if (bill) {
      dispatchAction({
        type: "INIT",
        form: {
          patient_id: bill.patient_id ?? "",
          discounted_amount: bill.discounted_amount ?? "",
          other_charges: bill.other_charges ?? "",
          paid_amount: bill.paid_amount ?? "",
          notes: bill.notes || "",
        },
        extras: {
          ipd_charges: num(bill.ipd_charges),
          consultation_fee: num(bill.consultation_fee),
          medical_charges: num(bill.medical_charges),
          lab_charges: num(bill.lab_charges),
        },
      });
    } else {
      dispatchAction({ type: "RESET" });
    }
  }, [isOpen, bill]);

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

  /**
   * Correct totals calculation:
   *   subtotal = ipd + consultation + medical + lab + other
   *   total    = subtotal − discount
   *   balance  = total − paid
   */
  const totals = useMemo(() => {
    const { ipd_charges, consultation_fee, medical_charges, lab_charges } =
      state.extras;
    const other = num(state.form.other_charges);
    const discount = num(state.form.discounted_amount);
    const paid = num(state.form.paid_amount);

    const subtotal =
      ipd_charges + consultation_fee + medical_charges + lab_charges + other;
    const total = Math.max(0, subtotal - discount);
    const balance = total - paid;

    let status = "unpaid";
    if (total === 0 && paid === 0) status = "—";
    else if (paid >= total && total > 0) status = "paid";
    else if (paid > 0) status = "partial";

    return {
      ipd_charges,
      consultation_fee,
      medical_charges,
      lab_charges,
      other,
      discount,
      paid,
      subtotal,
      total,
      balance,
      status,
    };
  }, [
    state.extras,
    state.form.discounted_amount,
    state.form.other_charges,
    state.form.paid_amount,
  ]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!canSubmit) return;

      const errors = validate(state.form);
      dispatchAction({ type: "SET_ERRORS", errors });
      if (Object.keys(errors).length > 0) {
        toast.error("Please fix the errors.");
        return;
      }

      const payload = {
        patient_id: Number(state.form.patient_id),
        discounted_amount: num(state.form.discounted_amount),
        other_charges: num(state.form.other_charges),
        paid_amount: num(state.form.paid_amount),
        notes: (state.form.notes || "").trim(),
      };

      setSubmitting(true);
      try {
        if (isEditMode) {
          const id = bill.id || bill._id;
          const res = await withMinDelay(
            dispatch(updateBill({ id, ...payload })).unwrap(),
            500,
          );
          toast.success(res?.message || "Bill updated successfully!");
        } else {
          const res = await withMinDelay(
            dispatch(createBill(payload)).unwrap(),
            500,
          );
          toast.success(res?.message || "Bill created successfully!");
        }
        dispatch(fetchAllBills());
        setSubmitting(false);
        dispatchAction({ type: "RESET" });
        onClose();
      } catch (err) {
        setSubmitting(false);
        const message =
          typeof err === "string"
            ? err
            : err?.message ||
            `Failed to ${isEditMode ? "update" : "create"} bill.`;
        toast.error(message);
      }
    },
    [state.form, isEditMode, bill, dispatch, onClose, submitting, canSubmit],
  );

  if (!isOpen) return null;

  const showExistingCharges = isEditMode && totals.subtotal > 0;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={close}
      disabled={isLoading}
      title={
        <>
          {isEditMode ? "Edit Bill" : "New Bill"}
          <Sparkles size={16} className="text-teal-500 inline ml-1" />
        </>
      }
      subtitle={
        isEditMode
          ? `Editing bill #${bill?.id || bill?._id}`
          : "Create a new bill for a patient"
      }
      icon={isEditMode ? <Edit size={22} /> : <Receipt size={22} />}
      iconClass="from-[#034A52] to-teal-500"
      accentShadow="shadow-teal-900/20"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Patient — REQUIRED */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Patient <span className="text-rose-500">*</span>
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
              disabled={isLoading || isEditMode}
              className={`w-full rounded-xl border ${state.errors.patient_id
                  ? "border-rose-500 bg-rose-50/30"
                  : "border-slate-200 bg-slate-50/50"
                } pl-10 pr-4 py-2.5 text-sm text-slate-800 outline-none transition-all duration-200 focus:bg-white focus:border-[#034A52] focus:ring-2 focus:ring-[#034A52]/20 disabled:opacity-60`}
            >
              <option value="">Select Patient</option>
              {patients.map((p) => {
                const id = p.id || p._id;
                return (
                  <option key={id} value={id}>
                    {p.name || p.full_name || `Patient #${id}`}
                    {p.cnic ? ` — ${p.cnic}` : ""}
                  </option>
                );
              })}
            </select>
          </div>
          {state.errors.patient_id && (
            <p className="mt-1 flex items-center gap-1 text-xs text-rose-500">
              <AlertCircle size={12} /> {state.errors.patient_id}
            </p>
          )}
          {isEditMode && (
            <p className="mt-1 text-[11px] text-slate-400">
              Patient cannot be changed after bill is created.
            </p>
          )}
        </div>

        {/* Read-only existing charges — only in edit mode */}
        {showExistingCharges && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-slate-100 bg-white px-4 py-2.5">
              <Building size={14} className="text-[#00A3AD]" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Existing Charges (from other modules)
              </span>
            </div>
            <div className="px-4 py-1">
              {totals.ipd_charges > 0 && (
                <ExistingRow
                  icon={Building}
                  label="IPD Charges"
                  value={fmt(totals.ipd_charges)}
                />
              )}
              {totals.consultation_fee > 0 && (
                <ExistingRow
                  icon={Stethoscope}
                  label="Consultation Fee"
                  value={fmt(totals.consultation_fee)}
                />
              )}
              {totals.medical_charges > 0 && (
                <ExistingRow
                  icon={ShieldCheck}
                  label="Medical Charges"
                  value={fmt(totals.medical_charges)}
                />
              )}
              {totals.lab_charges > 0 && (
                <ExistingRow
                  icon={FlaskConical}
                  label="Lab Charges"
                  value={fmt(totals.lab_charges)}
                />
              )}
              <ExistingRow
                icon={Receipt}
                label="Subtotal"
                value={fmt(totals.subtotal)}
                bold
              />
            </div>
          </div>
        )}

        {/* Editable fields — OPTIONAL */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MoneyField
            label="Discounted Amount"
            hint="Optional"
            name="discounted_amount"
            value={state.form.discounted_amount}
            onChange={handleChange}
            error={state.errors.discounted_amount}
            icon={Percent}
            disabled={isLoading}
          />
          <MoneyField
            label="Other Charges"
            hint="Optional"
            name="other_charges"
            value={state.form.other_charges}
            onChange={handleChange}
            error={state.errors.other_charges}
            icon={Banknote}
            disabled={isLoading}
          />
          <MoneyField
            label="Paid Amount"
            hint="Optional"
            name="paid_amount"
            value={state.form.paid_amount}
            onChange={handleChange}
            error={state.errors.paid_amount}
            icon={Wallet}
            disabled={isLoading}
          />
        </div>

        {/* Live summary */}
        <div className="bg-gradient-to-r from-teal-50/60 to-cyan-50/60 border border-teal-100 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 font-medium">Subtotal</span>
            <span className="font-semibold text-slate-700">
              {fmt(totals.subtotal)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 font-medium">Discount</span>
            <span className="font-semibold text-rose-600">
              − {fmt(totals.discount)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm border-t border-teal-100 pt-2">
            <span className="text-slate-700 font-bold">Total</span>
            <span className="font-bold text-slate-900">
              {fmt(totals.total)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 font-medium">Paid</span>
            <span className="font-bold text-emerald-600">
              {fmt(totals.paid)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-700 font-bold">Outstanding</span>
            <span
              className={`font-bold ${totals.balance > 0 ? "text-rose-600" : "text-slate-500"
                }`}
            >
              {fmt(Math.max(0, totals.balance))}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 font-medium">Status</span>
            <StatusPill status={totals.status} />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Notes{" "}
            <span className="text-[10px] text-slate-400 font-normal normal-case">
              (Optional)
            </span>
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
              rows={2}
              disabled={isLoading}
              placeholder="Payment method, remarks, etc."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-[#034A52] focus:ring-2 focus:ring-[#034A52]/20 resize-none disabled:opacity-50"
            />
          </div>
        </div>

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
            disabled={!canSubmit}
            className="rounded-xl bg-gradient-to-r from-[#034A52] to-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-900/20 transition-all duration-200 hover:shadow-teal-900/30 active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {isEditMode ? "Updating..." : "Saving..."}
              </>
            ) : (
              <>
                {isEditMode ? <Edit size={16} /> : <Receipt size={16} />}
                {isEditMode ? "Update Bill" : "Create Bill"}
              </>
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

/* ----------------------------- Sub-components ---------------------------- */

const ExistingRow = ({ icon: Icon, label, value, bold }) => (
  <div className="flex items-center justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
    <div className="flex items-center gap-2 min-w-0">
      {Icon && <Icon size={13} className="text-slate-400 shrink-0" />}
      <span
        className={`text-xs truncate ${bold ? "font-bold text-slate-700" : "text-slate-600"
          }`}
      >
        {label}
      </span>
    </div>
    <span
      className={`text-xs text-right ${bold ? "font-bold text-slate-800" : "font-medium text-slate-700"
        }`}
    >
      {value}
    </span>
  </div>
);

const MoneyField = ({
  label,
  hint,
  name,
  value,
  onChange,
  error,
  icon: Icon,
  disabled,
}) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
      {label}
      {hint && (
        <span className="ml-1 text-[10px] text-slate-400 font-normal normal-case">
          ({hint})
        </span>
      )}
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
        className={`w-full rounded-xl border ${error
            ? "border-rose-400 bg-rose-50/40"
            : "border-slate-200 bg-slate-50/50"
          } pl-10 pr-3 py-2.5 text-sm text-slate-800 outline-none transition-all duration-200 focus:bg-white focus:border-[#034A52] focus:ring-2 focus:ring-[#034A52]/20 disabled:opacity-50`}
      />
    </div>
    {error && (
      <p className="mt-1 flex items-center gap-1 text-xs text-rose-500">
        <AlertCircle size={12} /> {error}
      </p>
    )}
  </div>
);

const StatusPill = ({ status }) => {
  const map = {
    paid: {
      icon: <CheckCircle2 size={11} />,
      label: "Paid",
      cls: "bg-emerald-50 text-emerald-600 border-emerald-200",
    },
    partial: {
      icon: <Wallet size={11} />,
      label: "Partial",
      cls: "bg-amber-50 text-amber-600 border-amber-200",
    },
    unpaid: {
      icon: <AlertCircle size={11} />,
      label: "Unpaid",
      cls: "bg-rose-50 text-rose-600 border-rose-200",
    },
  };
  const preset = map[status];
  if (!preset) return <span className="text-xs text-slate-400">—</span>;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${preset.cls}`}
    >
      {preset.icon} {preset.label}
    </span>
  );
};

export default BillModal;