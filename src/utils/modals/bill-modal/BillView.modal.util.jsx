/**
 * @file BillView.modal.util.jsx
 * @module BillViewModal
 * @description Read-only view of a full bill with all charge breakdowns.
 *              Shows refund section when the bill has an associated refund.
 *              Handles both "refund" and "refunded" status strings.
 */

import { useMemo } from "react";
import {
  Receipt,
  Hash,
  User,
  Calendar,
  Wallet,
  Percent,
  Banknote,
  FileText,
  Building,
  Stethoscope,
  FlaskConical,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  CreditCard,
  Sparkles,
} from "lucide-react";

import ModalShell from "../../../shared/ModalShell.shared";

/* ------------------------------- Helpers --------------------------------- */

const num = (v) => {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
};

const fmt = (v) => `PKR ${num(v).toFixed(2)}`;

const humanizeMethod = (m) => {
  if (!m) return "—";
  return String(m)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

/**
 * Normalize status: "refunded" / "refund" / "Refund" → "refund"
 */
const normalizeStatus = (s) => {
  const v = String(s || "").toLowerCase();
  if (v === "refunded" || v === "refund") return "refund";
  return v;
};

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
    partial: {
      icon: <Clock size={11} />,
      label: "Partial",
      cls: "bg-amber-50 text-amber-600 border-amber-200",
    },
    unpaid: {
      icon: <XCircle size={11} />,
      label: "Unpaid",
      cls: "bg-rose-50 text-rose-600 border-rose-200",
    },
    refund: {
      icon: <RotateCcw size={11} />,
      label: "Refund",
      cls: "bg-purple-50 text-purple-600 border-purple-200",
    },
  };
  const preset = map[status] || map.unpaid;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${preset.cls}`}
    >
      {preset.icon} {preset.label}
    </span>
  );
};

const RefundStatusPill = ({ status }) => {
  const map = {
    pending: {
      icon: <Clock size={11} />,
      label: "Pending",
      cls: "bg-amber-50 text-amber-600 border-amber-200",
    },
    approved: {
      icon: <CheckCircle2 size={11} />,
      label: "Approved",
      cls: "bg-emerald-50 text-emerald-600 border-emerald-200",
    },
    completed: {
      icon: <CheckCircle2 size={11} />,
      label: "Completed",
      cls: "bg-emerald-50 text-emerald-600 border-emerald-200",
    },
    rejected: {
      icon: <XCircle size={11} />,
      label: "Rejected",
      cls: "bg-rose-50 text-rose-600 border-rose-200",
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

const BillViewModal = ({ isOpen, onClose, bill, refund = null }) => {
  // Debug — remove after verifying
  console.log("[BillViewModal]", {
    billId: bill?.id,
    billStatus: bill?.status,
    hasRefund: Boolean(refund),
    refund,
  });

  // Normalize bill
  const b = useMemo(() => {
    if (!bill) return null;

    const ipd = num(bill.ipd_charges);
    const consult = num(bill.consultation_fee);
    const medical = num(bill.medical_charges);
    const lab = num(bill.lab_charges);
    const other = num(bill.other_charges);

    const subtotal =
      num(bill.subtotal) || ipd + consult + medical + lab + other;

    const discount = num(bill.discounted_amount);
    const total = num(bill.total_amount) || subtotal - discount;
    const paid = num(bill.paid_amount);
    const balance =
      bill.outstanding_amount != null
        ? num(bill.outstanding_amount)
        : Math.max(0, total - paid);

    // Normalize status
    let payment_status = normalizeStatus(bill.status || bill.payment_status);
    if (!payment_status) {
      if (paid >= total && total > 0) payment_status = "paid";
      else if (paid > 0) payment_status = "partial";
      else payment_status = "unpaid";
    }

    // If a refund exists, force "refund" (source of truth)
    if (refund) payment_status = "refund";

    return {
      ...bill,
      ipd_charges: ipd,
      consultation_fee: consult,
      medical_charges: medical,
      lab_charges: lab,
      other_charges: other,
      subtotal,
      discounted_amount: discount,
      total_amount: total,
      paid_amount: paid,
      balance,
      payment_status,
    };
  }, [bill, refund]);

  // Normalize refund
  const r = useMemo(() => {
    if (!refund) return null;
    return {
      ...refund,
      consultation_fee: num(refund.consultation_fee),
      lab_charges: num(refund.lab_charges),
      ipd_charges: num(refund.ipd_charges),
      medical_charges: num(refund.medical_charges),
      // backend sends "others" (plural) for refund; fallback to "other_charges"
      others: num(refund.others ?? refund.other_charges),
      total_refund_amount: num(refund.total_refund_amount),
    };
  }, [refund]);

  if (!isOpen || !b) return null;

  const hasRefund = Boolean(r);
  const hasRefundBreakdown =
    hasRefund &&
    (r.consultation_fee > 0 ||
      r.lab_charges > 0 ||
      r.ipd_charges > 0 ||
      r.medical_charges > 0 ||
      r.others > 0);

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          Bill Details
          <Sparkles size={16} className="text-teal-500 inline ml-1" />
        </>
      }
      subtitle={`Bill ${b.bill_number || `#${b.id}`} • ${
        b.patient_name || "Patient"
      }`}
      icon={<Receipt size={22} />}
      iconClass="from-[#034A52] to-teal-500"
      accentShadow="shadow-teal-900/20"
      maxWidth="max-w-3xl"
    >
      <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
        {/* ---------------- Bill header ---------------- */}
        <div className="rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50/60 to-cyan-50/60 p-4">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Hash size={14} className="text-slate-400" />
                <span className="font-bold text-slate-900 text-base">
                  {b.bill_number || `BILL-${b.id}`}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                <User size={11} className="inline mr-1" />
                {b.patient_name || "—"}
                {b.patient_id ? (
                  <span className="text-slate-400">
                    {" "}
                    (PID: #{b.patient_id})
                  </span>
                ) : null}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Status
              </p>
              <StatusPill status={b.payment_status} />
            </div>
          </div>
        </div>

        {/* ---------------- Charges breakdown ---------------- */}
        <Section icon={Receipt} title="Charges Breakdown">
          <Row icon={Building} label="IPD Charges" value={fmt(b.ipd_charges)} />
          <Row
            icon={Stethoscope}
            label="Consultation Fee"
            value={fmt(b.consultation_fee)}
          />
          <Row
            icon={ShieldCheck}
            label="Medical Charges"
            value={fmt(b.medical_charges)}
          />
          <Row
            icon={FlaskConical}
            label="Lab Charges"
            value={fmt(b.lab_charges)}
          />
          <Row
            icon={Banknote}
            label="Other Charges"
            value={fmt(b.other_charges)}
          />
          <Row
            icon={Receipt}
            label="Subtotal"
            value={fmt(b.subtotal)}
            valueClass="text-slate-900 font-bold"
          />
        </Section>

        {/* ---------------- Adjustments ---------------- */}
        <Section icon={Percent} title="Adjustments">
          <Row
            icon={Percent}
            label="Discount"
            value={`− ${fmt(b.discounted_amount)}`}
            valueClass="text-rose-600"
          />
          <Row
            icon={Receipt}
            label="Total Amount"
            value={fmt(b.total_amount)}
            valueClass="text-slate-900 font-bold text-sm"
          />
        </Section>

        {/* ---------------- Payment ---------------- */}
        <Section icon={Wallet} title="Payment">
          <Row
            icon={Wallet}
            label="Paid Amount"
            value={fmt(b.paid_amount)}
            valueClass="text-emerald-600 font-bold"
          />
          <Row
            icon={Clock}
            label="Outstanding"
            value={fmt(b.balance)}
            valueClass={
              b.balance > 0 ? "text-rose-600 font-bold" : "text-slate-500"
            }
          />
          {b.paid_at ? (
            <Row
              icon={Calendar}
              label="Paid At"
              value={new Date(b.paid_at).toLocaleDateString()}
            />
          ) : null}
          {b.payment_method ? (
            <Row
              icon={Wallet}
              label="Payment Method"
              value={humanizeMethod(b.payment_method)}
            />
          ) : null}
        </Section>

        {/* ---------------- Refund section ---------------- */}
        {hasRefund && (
          <Section icon={RotateCcw} title="Refund">
            <Row
              icon={Hash}
              label="Refund No."
              value={r.refund_number || `RE-${r.id}`}
              valueClass="text-purple-700 font-bold"
            />
            {r.total_refund_amount > 0 && (
              <Row
                icon={RotateCcw}
                label="Total Refund Amount"
                value={fmt(r.total_refund_amount)}
                valueClass="text-purple-700 font-bold"
              />
            )}
            {r.refund_method && (
              <Row
                icon={CreditCard}
                label="Refund Method"
                value={humanizeMethod(r.refund_method)}
              />
            )}
            <div className="flex items-center justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
              <span className="text-xs font-medium text-slate-600">Status</span>
              <RefundStatusPill status={r.status} />
            </div>
            {r.reason && (
              <div className="py-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Reason
                </p>
                <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {r.reason}
                </p>
              </div>
            )}
          </Section>
        )}

        {/* ---------------- Refund breakdown ---------------- */}
        {hasRefundBreakdown && (
          <Section icon={RotateCcw} title="Refund Breakdown">
            {r.ipd_charges > 0 && (
              <Row
                icon={Building}
                label="IPD Charges"
                value={fmt(r.ipd_charges)}
                valueClass="text-purple-700"
              />
            )}
            {r.consultation_fee > 0 && (
              <Row
                icon={Stethoscope}
                label="Consultation Fee"
                value={fmt(r.consultation_fee)}
                valueClass="text-purple-700"
              />
            )}
            {r.medical_charges > 0 && (
              <Row
                icon={ShieldCheck}
                label="Medical Charges"
                value={fmt(r.medical_charges)}
                valueClass="text-purple-700"
              />
            )}
            {r.lab_charges > 0 && (
              <Row
                icon={FlaskConical}
                label="Lab Charges"
                value={fmt(r.lab_charges)}
                valueClass="text-purple-700"
              />
            )}
            {r.others > 0 && (
              <Row
                icon={Banknote}
                label="Others"
                value={fmt(r.others)}
                valueClass="text-purple-700"
              />
            )}
            <Row
              icon={RotateCcw}
              label="Refund Total"
              value={fmt(
                r.total_refund_amount > 0
                  ? r.total_refund_amount
                  : r.consultation_fee +
                      r.lab_charges +
                      r.ipd_charges +
                      r.medical_charges +
                      r.others,
              )}
              valueClass="text-purple-700 font-bold"
            />
          </Section>
        )}

        {/* ---------------- If status is refund but no refund row ---------------- */}
        {!hasRefund && b.payment_status === "refund" && (
          <Section icon={RotateCcw} title="Refund">
            <div className="py-2">
              <p className="text-xs text-slate-600">
                This bill has been marked as{" "}
                <span className="font-semibold text-purple-700">Refunded</span>{" "}
                by the system, but no refund record is available.
              </p>
            </div>
          </Section>
        )}

        {/* ---------------- Appointment / reference ---------------- */}
        {(b.appointment_id || b.notes) && (
          <Section icon={FileText} title="Additional Info">
            {b.appointment_id ? (
              <Row
                icon={Calendar}
                label="Appointment"
                value={`#${b.appointment_id}`}
              />
            ) : null}
            {b.notes ? (
              <div className="py-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Notes
                </p>
                <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {b.notes}
                </p>
              </div>
            ) : null}
          </Section>
        )}

        {/* ---------------- Created / Updated ---------------- */}
        {(b.created_at || b.updated_at) && (
          <Section icon={Calendar} title="Timeline">
            {b.created_at ? (
              <Row
                icon={Calendar}
                label="Created"
                value={new Date(b.created_at).toLocaleString()}
              />
            ) : null}
            {b.updated_at ? (
              <Row
                icon={Calendar}
                label="Last Updated"
                value={new Date(b.updated_at).toLocaleString()}
              />
            ) : null}
          </Section>
        )}
      </div>

      {/* Footer */}
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

export default BillViewModal;
