/**
 * @file PayrollView.modal.util.jsx
 * @module PayrollViewModal
 * @description Read-only view of a payroll record.
 *              Uses backend fields: employee_name, role, payroll_month, etc.
 */

import { useMemo } from "react";
import {
  Receipt,
  User,
  Wallet,
  FileText,
  Calendar,
  Banknote,
  Percent,
  TrendingUp,
  Gift,
  Minus,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  Hash,
  Building,
} from "lucide-react";

import ModalShell from "../../../shared/ModalShell.shared";

/* ------------------------------- Helpers --------------------------------- */

const num = (v) => {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
};

const fmt = (v) =>
  `PKR ${num(v).toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatMonthLabel = (m) => {
  if (!m) return "—";
  const [year, month] = String(m).split("-");
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const idx = parseInt(month, 10) - 1;
  return `${months[idx] || month} ${year}`;
};

const formatDate = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return d;
  }
};

const employeeCode = (userId) => `EMP-${String(userId ?? "").padStart(4, "0")}`;

/* ---------------------------- Sub-components ----------------------------- */

const Row = ({ icon: Icon, label, value, valueClass = "text-slate-800" }) => (
  <div className="flex items-center justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
    <div className="flex items-center gap-2 min-w-0">
      {Icon && <Icon size={14} className="text-slate-400 shrink-0" />}
      <span className="text-xs font-medium text-slate-600 truncate">
        {label}
      </span>
    </div>
    <span className={`text-xs font-semibold text-right ${valueClass}`}>
      {value}
    </span>
  </div>
);

const Section = ({ icon: Icon, title, children }) => (
  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
    <div className="flex items-center gap-2 bg-slate-50/70 border-b border-slate-100 px-4 py-2.5">
      <Icon size={14} className="text-[#00A3AD]" />
      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
        {title}
      </span>
    </div>
    <div className="px-4 py-2">{children}</div>
  </div>
);

const StatusPill = ({ status }) => {
  const map = {
    paid: {
      icon: <CheckCircle2 size={11} />,
      label: "Paid",
      cls: "bg-emerald-50 text-emerald-600 border-emerald-200",
    },
    pending: {
      icon: <Clock size={11} />,
      label: "Pending",
      cls: "bg-amber-50 text-amber-600 border-amber-200",
    },
    processing: {
      icon: <TrendingUp size={11} />,
      label: "Processing",
      cls: "bg-blue-50 text-blue-600 border-blue-200",
    },
    cancelled: {
      icon: <XCircle size={11} />,
      label: "Cancelled",
      cls: "bg-rose-50 text-rose-600 border-rose-200",
    },
  };
  const preset = map[status] || map.pending;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${preset.cls}`}
    >
      {preset.icon} {preset.label}
    </span>
  );
};

/* ------------------------------- Component ------------------------------- */

const PayrollViewModal = ({ isOpen, onClose, payroll }) => {
  const p = useMemo(() => {
    if (!payroll) return null;

    const basic = num(payroll.basic_salary);
    const ot = num(payroll.overtime_amount);
    const commission = num(payroll.total_commission);
    const bonus = num(payroll.total_bonus);
    const deductions = num(payroll.total_deductions);
    const advance = num(payroll.advance_salary);
    const net = num(payroll.net_salary);

    const gross = basic + ot + commission + bonus;
    const totalDeduct = deductions + advance;

    // ✅ Resolve display fields from backend keys
    const employeeName =
      payroll.employee_name || payroll.staff_name || payroll.name || "—";

    const role = payroll.role || payroll.department || "—";

    const staffCode =
      payroll.staff_code ||
      (payroll.staff_id != null ? employeeCode(payroll.staff_id) : "—");

    return {
      ...payroll,
      employeeName,
      role,
      staffCode,
      basic_salary: basic,
      overtime_amount: ot,
      total_commission: commission,
      total_bonus: bonus,
      total_deductions: deductions,
      advance_salary: advance,
      net_salary: net,
      gross,
      totalDeduct,
    };
  }, [payroll]);

  if (!isOpen || !p) return null;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          Payroll Details
          <Sparkles size={16} className="text-teal-500 inline ml-1" />
        </>
      }
      subtitle={`${p.employeeName} • ${formatMonthLabel(p.payroll_month)}`}
      icon={<Receipt size={22} />}
      iconClass="from-[#034A52] to-teal-500"
      accentShadow="shadow-teal-900/20"
      maxWidth="max-w-3xl"
    >
      <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Header */}
        <div className="rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50/60 to-cyan-50/60 p-4">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Hash size={14} className="text-slate-400" />
                <span className="font-bold text-slate-900 text-base">
                  Payroll #{p.id || p._id}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                <User size={11} className="inline mr-1" />
                {p.employeeName}
                {p.staffCode && p.staffCode !== "—" ? (
                  <span className="text-slate-400"> · {p.staffCode}</span>
                ) : null}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                <Calendar size={11} className="inline mr-1" />
                {formatMonthLabel(p.payroll_month)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Status
              </p>
              <StatusPill status={p.status} />
            </div>
          </div>
        </div>

        {/* Employee info */}
        <Section icon={User} title="Employee">
          <Row icon={User} label="Name" value={p.employeeName} />
          <Row icon={Hash} label="Employee Code" value={p.staffCode} />
          {p.role && p.role !== "—" ? (
            <Row icon={Building} label="Role" value={p.role} />
          ) : null}
        </Section>

        {/* Earnings */}
        <Section icon={Wallet} title="Earnings">
          <Row icon={Wallet} label="Basic Salary" value={fmt(p.basic_salary)} />
          {p.overtime_amount > 0 && (
            <Row icon={Clock} label="Overtime" value={fmt(p.overtime_amount)} />
          )}
          {p.total_commission > 0 && (
            <Row
              icon={Percent}
              label="Commission"
              value={fmt(p.total_commission)}
            />
          )}
          {p.total_bonus > 0 && (
            <Row icon={Gift} label="Bonus" value={fmt(p.total_bonus)} />
          )}
          <Row
            icon={Banknote}
            label="Gross"
            value={fmt(p.gross)}
            valueClass="text-slate-900 font-bold"
          />
        </Section>

        {/* Deductions */}
        {(p.total_deductions > 0 || p.advance_salary > 0) && (
          <Section icon={Minus} title="Deductions">
            {p.total_deductions > 0 && (
              <Row
                icon={Minus}
                label="Total Deductions"
                value={`− ${fmt(p.total_deductions)}`}
                valueClass="text-rose-600"
              />
            )}
            {p.advance_salary > 0 && (
              <Row
                icon={TrendingUp}
                label="Advance Salary"
                value={`− ${fmt(p.advance_salary)}`}
                valueClass="text-rose-600"
              />
            )}
            <Row
              icon={Minus}
              label="Total Deducted"
              value={`− ${fmt(p.totalDeduct)}`}
              valueClass="text-rose-600 font-bold"
            />
          </Section>
        )}

        {/* Net salary highlight */}
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50/60 to-teal-50/60 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Banknote size={18} className="text-emerald-600" />
            <span className="text-sm font-bold text-slate-700">Net Salary</span>
          </div>
          <span className="text-lg font-extrabold text-emerald-700">
            {fmt(p.net_salary)}
          </span>
        </div>

        {/* Payment info */}
        {p.paid_at ? (
          <Section icon={Calendar} title="Payment">
            <Row
              icon={Calendar}
              label="Paid At"
              value={formatDate(p.paid_at)}
            />
          </Section>
        ) : null}

        {/* Notes */}
        {p.notes ? (
          <Section icon={FileText} title="Notes">
            <p className="text-xs text-slate-700 whitespace-pre-wrap py-2">
              {p.notes}
            </p>
          </Section>
        ) : null}

        {/* Timeline */}
        {(p.created_at || p.updated_at) && (
          <Section icon={Clock} title="Timeline">
            {p.created_at ? (
              <Row
                icon={Calendar}
                label="Created"
                value={new Date(p.created_at).toLocaleString()}
              />
            ) : null}
            {p.updated_at ? (
              <Row
                icon={Calendar}
                label="Last Updated"
                value={new Date(p.updated_at).toLocaleString()}
              />
            ) : null}
          </Section>
        )}
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-100 p-5">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-50 active:scale-95"
        >
          Close
        </button>
      </div>
    </ModalShell>
  );
};

export default PayrollViewModal;
