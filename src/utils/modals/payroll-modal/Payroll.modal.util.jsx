/**
 * @file Payroll.modal.util.jsx
 * @module PayrollModal
 * @description Create / Edit a payroll record.
 * Auto-fills basic_salary and total_commission when an employee is selected
 * or changed. Respects manual edits made by the user (won't overwrite).
 */

import {
    useCallback,
    useEffect,
    useMemo,
    useReducer,
    useRef,
    useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
    Receipt,
    User,
    Wallet,
    FileText,
    Calendar,
    Loader2,
    Edit,
    Sparkles,
    AlertCircle,
    Banknote,
    Percent,
    TrendingUp,
    Gift,
    Minus,
    Clock,
} from "lucide-react";

import {
    createPayroll,
    updatePayroll,
    fetchAllPayrolls,
} from "../../../redux/slices/Payroll.slice.redux";
import ModalShell from "../../../shared/ModalShell.shared";

/* ------------------------------- Constants ------------------------------- */

const MONTH_OPTIONS = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
];

const STATUS_OPTIONS = [
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "paid", label: "Paid" },
    { value: "cancelled", label: "Cancelled" },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

const DEFAULT_FORM = {
    staff_id: "",
    month: String(new Date().getMonth() + 1).padStart(2, "0"),
    year: String(currentYear),
    basic_salary: "",
    overtime_amount: "",
    total_commission: "",
    total_bonus: "",
    total_deductions: "",
    advance_salary: "",
    net_salary: "",
    status: "pending",
    paid_at: "",
    notes: "",
};

const initialState = { form: DEFAULT_FORM, errors: {} };

/* ------------------------------- Reducer --------------------------------- */

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
        case "SET_FIELDS":
            return {
                ...state,
                form: { ...state.form, ...action.fields },
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
    if (!form.staff_id) errors.staff_id = "Employee is required";
    if (!form.month) errors.month = "Month is required";
    if (!form.year) errors.year = "Year is required";
    if (form.basic_salary === "" || num(form.basic_salary) < 0)
        errors.basic_salary = "Basic salary is required";
    if (!form.status) errors.status = "Status is required";
    if (form.status === "paid" && !form.paid_at)
        errors.paid_at = "Paid date is required when status is Paid";
    return errors;
};

/* ------------------------------- Component ------------------------------- */

const PayrollModal = ({
    isOpen,
    onClose,
    payroll = null,
    staffList = [],
}) => {
    const dispatch = useDispatch();
    const isEditMode = Boolean(payroll);

    const creating = useSelector((s) => s.payroll?.creating || false);
    const updating = useSelector((s) => s.payroll?.updating || false);

    const [submitting, setSubmitting] = useState(false);
    const isLoading = submitting || creating || updating;

    const [state, dispatchAction] = useReducer(reducer, initialState);

    /* ------------- Ref: remember the last auto-filled values ------------- */

    const lastAutoRef = useRef({
        basic: "",
        commission: "",
        staffId: null,
    });

    /* ---------------------------- Populate ------------------------------- */

    useEffect(() => {
        if (!isOpen) return;
        if (payroll) {
            const [y, m] = String(payroll.payroll_month || "").split("-");
            dispatchAction({
                type: "INIT",
                form: {
                    staff_id: payroll.staff_id ?? "",
                    month: m || String(new Date().getMonth() + 1).padStart(2, "0"),
                    year: y || String(currentYear),
                    basic_salary: payroll.basic_salary ?? "",
                    overtime_amount: payroll.overtime_amount ?? "",
                    total_commission: payroll.total_commission ?? "",
                    total_bonus: payroll.total_bonus ?? "",
                    total_deductions: payroll.total_deductions ?? "",
                    advance_salary: payroll.advance_salary ?? "",
                    net_salary: payroll.net_salary ?? "",
                    status: payroll.status || "pending",
                    paid_at: payroll.paid_at || "",
                    notes: payroll.notes || "",
                },
            });
        } else {
            dispatchAction({ type: "RESET" });
            lastAutoRef.current = { basic: "", commission: "", staffId: null };
        }
    }, [isOpen, payroll]);

    /* ------------------------------------------------------------------ */
    /*  Auto-fill basic_salary + commission when employee changes.          */
    /*                                                                     */
    /*  On employee change:                                                */
    /*   - If field value equals the last auto-filled value → replace with */
    /*     the new employee's value (user didn't edit).                    */
    /*   - Otherwise (user typed manually), keep their edit.               */
    /* ------------------------------------------------------------------ */

    useEffect(() => {
        if (!isOpen || isEditMode) return;
        const id = state.form.staff_id;

        // Employee cleared
        if (!id) {
            const prev = lastAutoRef.current;
            const fields = {};
            if (state.form.basic_salary === prev.basic) fields.basic_salary = "";
            if (state.form.total_commission === prev.commission)
                fields.total_commission = "";
            if (Object.keys(fields).length > 0) {
                dispatchAction({ type: "SET_FIELDS", fields });
            }
            lastAutoRef.current = { basic: "", commission: "", staffId: null };
            return;
        }

        const emp = staffList.find((s) => Number(s.id) === Number(id));
        if (!emp) return;

        const newBasic = String(emp.basic_salary ?? "");
        const newCommission = String(emp.commission ?? "");

        const prev = lastAutoRef.current;

        // Did the user manually edit the field since last auto-fill?
        const basicManuallyEdited =
            prev.staffId !== null &&
            state.form.basic_salary !== prev.basic &&
            state.form.basic_salary !== "";

        const commissionManuallyEdited =
            prev.staffId !== null &&
            state.form.total_commission !== prev.commission &&
            state.form.total_commission !== "";

        const fields = {};

        if (!basicManuallyEdited) {
            fields.basic_salary = newBasic;
        }
        if (!commissionManuallyEdited) {
            fields.total_commission = newCommission;
        }

        // Update the "last auto-filled" refs
        lastAutoRef.current = {
            basic: fields.basic_salary ?? prev.basic,
            commission: fields.total_commission ?? prev.commission,
            staffId: id,
        };

        if (Object.keys(fields).length > 0) {
            dispatchAction({ type: "SET_FIELDS", fields });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.form.staff_id, isOpen, isEditMode, staffList]);

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

    /* ---------------- Computed previews ---------------- */

    const computed = useMemo(() => {
        const basic = num(state.form.basic_salary);
        const ot = num(state.form.overtime_amount);
        const commission = num(state.form.total_commission);
        const bonus = num(state.form.total_bonus);
        const deductions = num(state.form.total_deductions);
        const advance = num(state.form.advance_salary);

        const gross = basic + ot + commission + bonus;
        const totalDeduct = deductions + advance;
        const net = Math.max(0, gross - totalDeduct);

        return {
            basic,
            ot,
            commission,
            bonus,
            deductions,
            advance,
            gross,
            totalDeduct,
            net,
        };
    }, [
        state.form.basic_salary,
        state.form.overtime_amount,
        state.form.total_commission,
        state.form.total_bonus,
        state.form.total_deductions,
        state.form.advance_salary,
    ]);

    const applyComputedNet = useCallback(() => {
        dispatchAction({
            type: "SET_FIELD",
            field: "net_salary",
            value: String(computed.net),
        });
        toast.success("Net salary updated from calculation");
    }, [computed.net]);

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();

            const errors = validate(state.form);
            dispatchAction({ type: "SET_ERRORS", errors });
            if (Object.keys(errors).length > 0) {
                toast.error("Please fix the errors.");
                return;
            }

            const finalNet =
                state.form.net_salary !== ""
                    ? num(state.form.net_salary)
                    : computed.net;

            const payload = {
                staff_id: Number(state.form.staff_id),
                payroll_month: `${state.form.year}-${state.form.month}`,
                basic_salary: num(state.form.basic_salary),
                overtime_amount: num(state.form.overtime_amount),
                total_commission: num(state.form.total_commission),
                total_bonus: num(state.form.total_bonus),
                total_deductions: num(state.form.total_deductions),
                advance_salary: num(state.form.advance_salary),
                net_salary: finalNet,
                status: state.form.status,
                paid_at:
                    state.form.status === "paid" ? state.form.paid_at || null : null,
                notes: (state.form.notes || "").trim(),
            };

            setSubmitting(true);
            try {
                if (isEditMode) {
                    const id = payroll.id || payroll._id;
                    const res = await withMinDelay(
                        dispatch(updatePayroll({ id, ...payload })).unwrap(),
                        500,
                    );
                    toast.success(res?.message || "Payroll updated successfully!");
                } else {
                    const res = await withMinDelay(
                        dispatch(createPayroll(payload)).unwrap(),
                        500,
                    );
                    toast.success(res?.message || "Payroll created successfully!");
                }
                dispatch(fetchAllPayrolls());
                setSubmitting(false);
                dispatchAction({ type: "RESET" });
                onClose();
            } catch (err) {
                setSubmitting(false);
                const message =
                    typeof err === "string"
                        ? err
                        : err?.message ||
                        `Failed to ${isEditMode ? "update" : "create"} payroll.`;
                toast.error(message);
            }
        },
        [
            state.form,
            isEditMode,
            payroll,
            dispatch,
            onClose,
            submitting,
            computed.net,
        ],
    );

    if (!isOpen) return null;

    const selectedEmployee = staffList.find(
        (s) => Number(s.id) === Number(state.form.staff_id),
    );

    return (
        <ModalShell
            isOpen={isOpen}
            onClose={close}
            disabled={isLoading}
            title={
                <>
                    {isEditMode ? "Edit Payroll" : "New Payroll"}
                    <Sparkles size={16} className="text-teal-500 inline ml-1" />
                </>
            }
            subtitle={
                isEditMode
                    ? `Editing payroll #${payroll?.id || payroll?._id}`
                    : "Create a new monthly payroll entry"
            }
            icon={isEditMode ? <Edit size={22} /> : <Receipt size={22} />}
            iconClass="from-[#034A52] to-teal-500"
            accentShadow="shadow-teal-900/20"
            maxWidth="max-w-3xl"
        >
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Employee + Month/Year + Status */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-3">
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                            Employee <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <User
                                size={18}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                            />
                            <select
                                name="staff_id"
                                value={state.form.staff_id}
                                onChange={handleChange}
                                disabled={isLoading || isEditMode}
                                className={`w-full rounded-xl border ${state.errors.staff_id
                                        ? "border-rose-500 bg-rose-50/30"
                                        : "border-slate-200 bg-slate-50/50"
                                    } pl-10 pr-4 py-2.5 text-sm text-slate-800 outline-none transition-all duration-200 focus:bg-white focus:border-[#034A52] focus:ring-2 focus:ring-[#034A52]/20 disabled:opacity-60`}
                            >
                                <option value="">Select Employee</option>
                                {staffList.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} — {s.code}
                                        {s.role ? ` (${s.role})` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {state.errors.staff_id && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-rose-500">
                                <AlertCircle size={12} /> {state.errors.staff_id}
                            </p>
                        )}
                        {selectedEmployee && !isEditMode && (
                            <p className="mt-1 text-[11px] text-slate-500">
                                Auto-filled: Basic Salary{" "}
                                <span className="font-semibold text-slate-700">
                                    {fmt(selectedEmployee.basic_salary)}
                                </span>{" "}
                                · Commission{" "}
                                <span className="font-semibold text-slate-700">
                                    {fmt(selectedEmployee.commission)}
                                </span>
                            </p>
                        )}
                        {isEditMode && (
                            <p className="mt-1 text-[11px] text-slate-400">
                                Employee cannot be changed after payroll is created.
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                            Month <span className="text-rose-500">*</span>
                        </label>
                        <select
                            name="month"
                            value={state.form.month}
                            onChange={handleChange}
                            disabled={isLoading}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:bg-white focus:border-[#034A52] focus:ring-2 focus:ring-[#034A52]/20"
                        >
                            {MONTH_OPTIONS.map((m) => (
                                <option key={m.value} value={m.value}>
                                    {m.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                            Year <span className="text-rose-500">*</span>
                        </label>
                        <select
                            name="year"
                            value={state.form.year}
                            onChange={handleChange}
                            disabled={isLoading}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:bg-white focus:border-[#034A52] focus:ring-2 focus:ring-[#034A52]/20"
                        >
                            {YEAR_OPTIONS.map((y) => (
                                <option key={y} value={String(y)}>
                                    {y}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                            Status <span className="text-rose-500">*</span>
                        </label>
                        <select
                            name="status"
                            value={state.form.status}
                            onChange={handleChange}
                            disabled={isLoading}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:bg-white focus:border-[#034A52] focus:ring-2 focus:ring-[#034A52]/20 capitalize"
                        >
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Earnings */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                        Earnings
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <MoneyField
                            label="Basic Salary"
                            name="basic_salary"
                            value={state.form.basic_salary}
                            onChange={handleChange}
                            error={state.errors.basic_salary}
                            icon={Wallet}
                            disabled={isLoading}
                            required
                        />
                        <MoneyField
                            label="Overtime Amount"
                            hint="Optional"
                            name="overtime_amount"
                            value={state.form.overtime_amount}
                            onChange={handleChange}
                            icon={Clock}
                            disabled={isLoading}
                        />
                        <MoneyField
                            label="Total Commission"
                            hint="Optional"
                            name="total_commission"
                            value={state.form.total_commission}
                            onChange={handleChange}
                            icon={Percent}
                            disabled={isLoading}
                        />
                        <MoneyField
                            label="Total Bonus"
                            hint="Optional"
                            name="total_bonus"
                            value={state.form.total_bonus}
                            onChange={handleChange}
                            icon={Gift}
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {/* Deductions */}
                <div className="rounded-2xl border border-slate-200 bg-rose-50/30 p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-3">
                        Deductions
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <MoneyField
                            label="Total Deductions"
                            hint="Optional"
                            name="total_deductions"
                            value={state.form.total_deductions}
                            onChange={handleChange}
                            icon={Minus}
                            disabled={isLoading}
                        />
                        <MoneyField
                            label="Advance Salary"
                            hint="Optional"
                            name="advance_salary"
                            value={state.form.advance_salary}
                            onChange={handleChange}
                            icon={TrendingUp}
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {/* Computed preview */}
                <div className="bg-gradient-to-r from-teal-50/60 to-cyan-50/60 border border-teal-100 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 font-medium">
                            Gross (Basic + OT + Commission + Bonus)
                        </span>
                        <span className="font-semibold text-slate-700">
                            {fmt(computed.gross)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 font-medium">
                            Total Deductions + Advance
                        </span>
                        <span className="font-semibold text-rose-600">
                            − {fmt(computed.totalDeduct)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm border-t border-teal-100 pt-2">
                        <span className="text-slate-700 font-bold">Computed Net</span>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-base">
                                {fmt(computed.net)}
                            </span>
                            <button
                                type="button"
                                onClick={applyComputedNet}
                                className="text-[10px] font-semibold bg-[#00A3AD] hover:bg-[#008C94] text-white px-2 py-1 rounded-lg"
                            >
                                Use this
                            </button>
                        </div>
                    </div>
                </div>

                {/* Net salary + Paid at */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <MoneyField
                        label="Net Salary (final)"
                        hint="Blank = use computed"
                        name="net_salary"
                        value={state.form.net_salary}
                        onChange={handleChange}
                        icon={Banknote}
                        disabled={isLoading}
                    />
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                            Paid At{" "}
                            {state.form.status === "paid" && (
                                <span className="text-rose-500">*</span>
                            )}
                        </label>
                        <div className="relative">
                            <Calendar
                                size={16}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                            />
                            <input
                                type="date"
                                name="paid_at"
                                value={state.form.paid_at}
                                onChange={handleChange}
                                disabled={isLoading}
                                className={`w-full rounded-xl border ${state.errors.paid_at
                                        ? "border-rose-400 bg-rose-50/40"
                                        : "border-slate-200 bg-slate-50/50"
                                    } pl-10 pr-3 py-2.5 text-sm text-slate-800 outline-none focus:bg-white focus:border-[#034A52] focus:ring-2 focus:ring-[#034A52]/20`}
                            />
                        </div>
                        {state.errors.paid_at && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-rose-500">
                                <AlertCircle size={12} /> {state.errors.paid_at}
                            </p>
                        )}
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
                            placeholder="Monthly salary notes..."
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
                                {isEditMode ? <Edit size={16} /> : <Receipt size={16} />}
                                {isEditMode ? "Update Payroll" : "Create Payroll"}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </ModalShell>
    );
};

/* ----------------------------- Sub-components ---------------------------- */

const MoneyField = ({
    label,
    hint,
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
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
            {hint && (
                <span className="ml-1 text-[10px] text-slate-400 font-normal normal-case">
                    ({hint})
                </span>
            )}
        </label>
        <div className="relative">
            {Icon && (
                <Icon
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
            )}
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
                        : "border-slate-200 bg-white/70"
                    } ${Icon ? "pl-10" : "pl-3"} pr-3 py-2.5 text-sm text-slate-800 outline-none transition-all duration-200 focus:bg-white focus:border-[#034A52] focus:ring-2 focus:ring-[#034A52]/20 disabled:opacity-50`}
            />
        </div>
        {error && (
            <p className="mt-1 flex items-center gap-1 text-xs text-rose-500">
                <AlertCircle size={12} /> {error}
            </p>
        )}
    </div>
);

export default PayrollModal;