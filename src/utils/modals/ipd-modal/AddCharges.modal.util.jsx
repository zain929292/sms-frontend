/**
 * @file IpdCharge.modal.util.jsx
 * @module IpdChargeModal
 * @description Add multiple IPD charges against a single admission.
 * POST /ipd-charges body:
 *   { admission_id, charge_type, description, charge_date, amount }
 *
 * Selectors are memoized to prevent unnecessary rerenders and the Redux
 * "Selector unknown returned a different result" warning.
 */

import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  Receipt,
  Plus,
  Trash2,
  Calendar,
  FileText,
  Activity,
  Loader2,
  Sparkles,
  AlertCircle,
  Banknote,
} from "lucide-react";

import {
  createIpdCharge,
  fetchIpdChargesByAdmission,
} from "../../../redux/slices/Admissions.slice.redux";
import ModalShell from "../../../shared/ModalShell.shared";

/* ------------------------------- Constants ------------------------------- */

// Module-level constant — SAME reference on every render (never a new array)
const EMPTY = [];

const CHARGE_TYPES = [
  {
    value: "Admission Fee",
    label: "Admission Fee",
    defaultDescription: "One-time admission fee",
  },
  {
    value: "Room Charge",
    label: "Room Charge",
    defaultDescription: "Daily room charge",
  },
  {
    value: "Doctor Visit",
    label: "Doctor Visit",
    defaultDescription: "Doctor consultation / visit",
  },
  {
    value: "Nursing",
    label: "Nursing",
    defaultDescription: "Nursing care charges",
  },
  {
    value: "Medicine",
    label: "Medicine",
    defaultDescription: "Medicines administered",
  },
  {
    value: "Procedure",
    label: "Procedure",
    defaultDescription: "Medical procedure charges",
  },
  { value: "Lab", label: "Lab", defaultDescription: "Laboratory tests" },
  { value: "Other", label: "Other", defaultDescription: "" },
];

const DEFAULT_DESC_BY_TYPE = Object.fromEntries(
  CHARGE_TYPES.map((t) => [t.value, t.defaultDescription]),
);

const TODAY = () => new Date().toISOString().split("T")[0];

const emptyRow = () => ({
  uid: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  charge_type: "Room Charge",
  description: DEFAULT_DESC_BY_TYPE["Room Charge"] || "",
  amount: "",
  charge_date: TODAY(),
});

/* ------------------------------- Reducer --------------------------------- */

const initialState = {
  rows: [emptyRow()],
  errors: {},
};

const reducer = (state, action) => {
  switch (action.type) {
    case "RESET":
      return { rows: [emptyRow()], errors: {} };

    case "ADD_ROW":
      return { ...state, rows: [...state.rows, emptyRow()] };

    case "REMOVE_ROW":
      return {
        ...state,
        rows: state.rows.filter((r) => r.uid !== action.uid),
      };

    case "SET_ROW_FIELD":
      return {
        ...state,
        rows: state.rows.map((r) =>
          r.uid === action.uid ? { ...r, [action.field]: action.value } : r,
        ),
        errors: { ...state.errors, [`${action.uid}.${action.field}`]: "" },
      };

    case "SET_ROW_TYPE": {
      const prevDefaults = new Set(
        Object.values(DEFAULT_DESC_BY_TYPE).filter(Boolean),
      );
      return {
        ...state,
        rows: state.rows.map((r) => {
          if (r.uid !== action.uid) return r;
          const currentDesc = (r.description || "").trim();
          const shouldReplace = !currentDesc || prevDefaults.has(currentDesc);
          const nextDesc = shouldReplace
            ? DEFAULT_DESC_BY_TYPE[action.value] || ""
            : r.description;
          return { ...r, charge_type: action.value, description: nextDesc };
        }),
        errors: { ...state.errors, [`${action.uid}.charge_type`]: "" },
      };
    }

    case "SET_ERRORS":
      return { ...state, errors: action.errors };

    default:
      return state;
  }
};

/* ------------------------------- Validation ------------------------------ */

const validate = (rows) => {
  const errors = {};
  if (rows.length === 0) {
    errors._form = "Add at least one charge.";
    return errors;
  }
  rows.forEach((r) => {
    if (!r.charge_type) errors[`${r.uid}.charge_type`] = "Type required";
    if (!r.charge_date) errors[`${r.uid}.charge_date`] = "Date required";
    const amt = parseFloat(r.amount);
    if (r.amount === "" || isNaN(amt) || amt <= 0) {
      errors[`${r.uid}.amount`] = "Amount must be greater than 0";
    }
  });
  return errors;
};

/* ------------------------------- Component ------------------------------- */

const IpdChargeModal = ({ isOpen, onClose, admission }) => {
  const dispatch = useDispatch();

  const [state, dispatchAction] = useReducer(reducer, initialState);
  const [submitting, setSubmitting] = useState(false);

  /* --------------- Selectors (stable references) ------------------- */

  // 1. Raw array from store (reference is stable unless the slice updates)
  const allIpdCharges = useSelector((s) => s.admissions?.ipdCharges ?? EMPTY);

  // 2. Memoized filter — runs only when the raw array or id changes
  const admissionId = admission?.id ?? admission?._id ?? null;

  const existingCharges = useMemo(() => {
    if (admissionId == null) return EMPTY;
    return allIpdCharges.filter(
      (c) => Number(c.admission_id) === Number(admissionId),
    );
  }, [allIpdCharges, admissionId]);

  // 3. Existing total (memoized)
  const existingTotal = useMemo(
    () =>
      existingCharges.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0),
    [existingCharges],
  );

  /* ------------------------------ Effects ------------------------------ */

  useEffect(() => {
    if (!isOpen) return;
    dispatchAction({ type: "RESET" });
    if (admissionId != null) {
      dispatch(fetchIpdChargesByAdmission(admissionId));
    }
  }, [isOpen, admissionId, dispatch]);

  /* ------------------------------ Handlers ------------------------------ */

  const close = useCallback(() => {
    if (submitting) return;
    dispatchAction({ type: "RESET" });
    onClose();
  }, [onClose, submitting]);

  const handleAddRow = useCallback(() => {
    dispatchAction({ type: "ADD_ROW" });
  }, []);

  const handleRemoveRow = useCallback(
    (uid) => {
      if (state.rows.length === 1) {
        toast.error("At least one charge is required.");
        return;
      }
      dispatchAction({ type: "REMOVE_ROW", uid });
    },
    [state.rows.length],
  );

  const handleChange = useCallback((uid, field, value) => {
    dispatchAction({ type: "SET_ROW_FIELD", uid, field, value });
  }, []);

  const handleTypeChange = useCallback((uid, value) => {
    dispatchAction({ type: "SET_ROW_TYPE", uid, value });
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      console.log("═══════════════════════════════════════════");
      console.log("🚀 [handleSubmit] START");
      console.log("═══════════════════════════════════════════");

      // ─── 1. admissionId check ───────────────────────────────
      console.log(
        "📌 [Step 1] admissionId =",
        admissionId,
        "| type:",
        typeof admissionId,
      );

      if (admissionId == null) {
        console.error("❌ [Step 1] No admissionId — aborting");
        toast.error("No admission selected.");
        return;
      }

      // ─── 2. Validate rows ───────────────────────────────────
      console.log("📌 [Step 2] Validating rows...");
      console.log("   rows count:", state.rows.length);
      console.log("   rows raw:", JSON.stringify(state.rows, null, 2));

      const errors = validate(state.rows);
      dispatchAction({ type: "SET_ERRORS", errors });

      console.log("   validation errors:", errors);

      if (Object.keys(errors).length > 0) {
        console.error("❌ [Step 2] Validation failed — aborting");
        toast.error("Please fix the form errors.");
        return;
      }
      console.log("✅ [Step 2] Validation passed");

      const admissionIdNum = Number(admissionId);
      console.log("📌 [Step 2b] admissionIdNum =", admissionIdNum);

      // ─── 3. Loop over rows and POST ─────────────────────────
      setSubmitting(true);
      let succeeded = 0;
      let failed = 0;

      console.log(
        "📌 [Step 3] Starting POST loop for",
        state.rows.length,
        "row(s)",
      );

      for (let i = 0; i < state.rows.length; i++) {
        const row = state.rows[i];

        // Build the EXACT payload that will be sent
        const payload = {
          admission_id: admissionIdNum,
          charge_type: row.charge_type,
          description: row.description?.trim() || "",
          amount: parseFloat(row.amount),
          charge_date: row.charge_date,
        };

        console.log("───────────────────────────────────────────");
        console.log(`📤 [Row ${i + 1}/${state.rows.length}] PAYLOAD:`);
        console.log("   row.uid        :", row.uid);
        console.log("   charge_type    :", JSON.stringify(payload.charge_type));
        console.log("   charge_type len:", payload.charge_type?.length);
        console.log("   description    :", JSON.stringify(payload.description));
        console.log(
          "   amount         :",
          payload.amount,
          "(type:",
          typeof payload.amount,
          ")",
        );
        console.log("   charge_date    :", JSON.stringify(payload.charge_date));
        console.log("   FULL JSON      :", JSON.stringify(payload));

        try {
          const result = await dispatch(createIpdCharge(payload)).unwrap();

          console.log(`✅ [Row ${i + 1}] SUCCESS:`, result);
          succeeded++;
        } catch (err) {
          console.error(`❌ [Row ${i + 1}] FAILED`);
          console.error("   Raw error      :", err);
          console.error("   typeof error   :", typeof err);
          console.error("   error.message  :", err?.message);
          console.error("   error.errors   :", err?.errors);
          console.error("   error.status   :", err?.status);
          console.error("   FULL JSON      :", JSON.stringify(err, null, 2));
          failed++;
        }
      }

      setSubmitting(false);

      // ─── 4. Summary ─────────────────────────────────────────
      console.log("═══════════════════════════════════════════");
      console.log("🏁 [Step 4] DONE");
      console.log("   succeeded:", succeeded);
      console.log("   failed   :", failed);
      console.log("═══════════════════════════════════════════");

      if (failed === 0) {
        toast.success(
          succeeded === 1
            ? "Charge added successfully!"
            : `${succeeded} charges added successfully!`,
        );
        dispatch(fetchIpdChargesByAdmission(admissionIdNum));
        close();
      } else if (succeeded === 0) {
        toast.error("Failed to add charges. Please try again.");
      } else {
        toast.error(
          `${succeeded} added, ${failed} failed. Please review the failed rows.`,
        );
      }
    },
    [state.rows, admissionId, dispatch, close],
  );

  /* ------------------------------- Derived ------------------------------ */

  const patientLabel =
    admission?.patientName ||
    admission?.patient?.name ||
    `Patient #${admission?.patient_id ?? "?"}`;

  // Sum of currently-typed amounts (memoized)
  const currentTotal = useMemo(
    () =>
      state.rows.reduce((sum, r) => {
        const a = parseFloat(r.amount);
        return sum + (isNaN(a) ? 0 : a);
      }, 0),
    [state.rows],
  );

  /* -------------------------------- Render ------------------------------ */

  if (!isOpen) return null;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={close}
      disabled={submitting}
      title={
        <>
          Add IPD Charges
          <Sparkles size={16} className="text-teal-500 inline ml-1" />
        </>
      }
      subtitle={`Admission #${admissionId ?? "?"} • ${patientLabel}`}
      icon={<Receipt size={22} />}
      iconClass="from-[#034A52] to-teal-500"
      accentShadow="shadow-teal-900/20"
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Existing charges (read-only quick view) */}
        {existingCharges.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Existing charges ({existingCharges.length})
              </p>
              {existingTotal > 0 && (
                <span className="text-xs font-bold text-teal-700">
                  Total: PKR {existingTotal.toFixed(2)}
                </span>
              )}
            </div>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {existingCharges.map((c) => (
                <div
                  key={c.id || c._id}
                  className="grid grid-cols-12 gap-2 text-xs bg-white border border-slate-200 rounded-lg px-3 py-1.5"
                >
                  <span className="col-span-3 font-semibold text-slate-700 truncate">
                    {c.charge_type}
                  </span>
                  <span className="col-span-5 text-slate-500 truncate">
                    {c.description || "—"}
                  </span>
                  <span className="col-span-2 text-slate-700 font-mono text-right">
                    {c.amount != null ? `PKR ${c.amount}` : "—"}
                  </span>
                  <span className="col-span-2 text-slate-500 font-mono text-right">
                    {c.charge_date || "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New charges */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Receipt size={16} className="text-[#00A3AD]" />
              New Charges
              <span className="ml-1 text-xs font-semibold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">
                {state.rows.length}
              </span>
            </h3>
            <button
              type="button"
              onClick={handleAddRow}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00A3AD] hover:bg-teal-50 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              <Plus size={14} /> Add Row
            </button>
          </div>

          <div className="space-y-3">
            {state.rows.map((row, idx) => (
              <div
                key={row.uid}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-white border border-slate-200 rounded-xl p-3"
              >
                <div className="md:col-span-1 flex items-center justify-center h-full">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                </div>

                {/* Charge Type */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Type <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Activity
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <select
                      value={row.charge_type}
                      onChange={(e) =>
                        handleTypeChange(row.uid, e.target.value)
                      }
                      disabled={submitting}
                      className={`w-full rounded-lg border ${
                        state.errors[`${row.uid}.charge_type`]
                          ? "border-rose-400 bg-rose-50/40"
                          : "border-slate-200 bg-slate-50/50"
                      } pl-8 pr-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-[#034A52] focus:ring-2 focus:ring-[#034A52]/15`}
                    >
                      {CHARGE_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <div className="relative">
                    <FileText
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      type="text"
                      value={row.description}
                      onChange={(e) =>
                        handleChange(row.uid, "description", e.target.value)
                      }
                      disabled={submitting}
                      placeholder="e.g., Daily room charge"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#034A52] focus:ring-2 focus:ring-[#034A52]/15"
                    />
                  </div>
                </div>

                {/* Amount */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Amount (PKR) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Banknote
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.amount}
                      onChange={(e) =>
                        handleChange(row.uid, "amount", e.target.value)
                      }
                      disabled={submitting}
                      placeholder="0.00"
                      className={`w-full rounded-lg border ${
                        state.errors[`${row.uid}.amount`]
                          ? "border-rose-400 bg-rose-50/40"
                          : "border-slate-200 bg-slate-50/50"
                      } pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#034A52] focus:ring-2 focus:ring-[#034A52]/15`}
                    />
                  </div>
                </div>

                {/* Charge Date */}
                <div className="md:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Date <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      type="date"
                      value={row.charge_date}
                      onChange={(e) =>
                        handleChange(row.uid, "charge_date", e.target.value)
                      }
                      disabled={submitting}
                      className={`w-full rounded-lg border ${
                        state.errors[`${row.uid}.charge_date`]
                          ? "border-rose-400 bg-rose-50/40"
                          : "border-slate-200 bg-slate-50/50"
                      } pl-8 pr-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-[#034A52] focus:ring-2 focus:ring-[#034A52]/15`}
                    />
                  </div>
                </div>

                {/* Remove */}
                <div className="md:col-span-1 flex justify-end md:justify-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(row.uid)}
                    disabled={submitting || state.rows.length === 1}
                    className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Remove row"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Per-row error hint */}
                {state.errors[`${row.uid}.amount`] && (
                  <p className="md:col-span-12 mt-1 flex items-center gap-1 text-[11px] text-rose-500">
                    <AlertCircle size={11} />{" "}
                    {state.errors[`${row.uid}.amount`]}
                  </p>
                )}
              </div>
            ))}
          </div>

          {state.errors._form && (
            <p className="mt-2 flex items-center gap-1 text-xs text-rose-500">
              <AlertCircle size={12} /> {state.errors._form}
            </p>
          )}
        </div>

        {/* Running total */}
        {currentTotal > 0 && (
          <div className="bg-gradient-to-r from-teal-50/60 to-cyan-50/60 border border-teal-100 rounded-xl p-4 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              New Charges Total:
            </span>
            <span className="text-lg font-extrabold text-[#00A3AD]">
              PKR {currentTotal.toFixed(2)}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={close}
            disabled={submitting}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-50 active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-gradient-to-r from-[#034A52] to-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-900/20 transition-all duration-200 hover:shadow-teal-900/30 active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Receipt size={16} />
                Save{" "}
                {state.rows.length > 1
                  ? `${state.rows.length} Charges`
                  : "Charge"}
              </>
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export default IpdChargeModal;
