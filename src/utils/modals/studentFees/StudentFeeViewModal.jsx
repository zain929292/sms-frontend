
import {
  Receipt,
  UserRound,
  GraduationCap,
  CalendarDays,
  Wallet,
  BadgeCheck,
  MessageSquare,
  Hash,
} from "lucide-react";

import ModalShell from "../../../shared/ModalShell.shared";
import { useModalAnimation } from "../../../shared/useModalAnimation.hook";

const formatCurrency = (value) =>
  `Rs. ${Number(value ?? 0).toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatMonth = (value) => {
  if (!value) return "N/A";

  const [year, month] = String(value).split("-");

  const date = new Date(Number(year), Number(month) - 1);

  return date.toLocaleDateString("en-PK", {
    month: "long",
    year: "numeric",
  });
};

const formatDate = (value) => {
  if (!value) return "N/A";

  return new Date(`${String(value).slice(0, 10)}T00:00:00`)
    .toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
};

const STATUS_STYLES = {
  paid: "bg-green-50 text-green-700 border-green-200",
  partial: "bg-amber-50 text-amber-700 border-amber-200",
  unpaid: "bg-red-50 text-red-700 border-red-200",
};

const DetailItem = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
    <div className="mb-1.5 flex items-center gap-2">
      <Icon size={14} className="text-teal-700" />
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>
    </div>

    <p className="break-words text-sm font-semibold text-slate-800">
      {value || "N/A"}
    </p>
  </div>
);

export default function StudentFeeViewModal({
  isOpen,
  onClose,
  fee,
}) {
  const { shouldRender, isAnimating } =
    useModalAnimation(isOpen, 300);

  if (!shouldRender) return null;

  if (!fee) return null;

  const status = String(fee.status || "unpaid").toLowerCase();

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Student Fee Details"
      subtitle="View complete fee and payment information."
      icon={<Receipt size={22} />}
      maxWidth="max-w-2xl"
    >
      <div
        className={`transform transition-all duration-300 ease-out ${
          isAnimating
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-95 opacity-0"
        }`}
      >
        <div className="space-y-5 p-5 sm:p-6">

          {/* Student Information */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              Student Information
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailItem
                icon={UserRound}
                label="Student Name"
                value={fee.student_name}
              />

              <DetailItem
                icon={GraduationCap}
                label="Class"
                value={fee.class_name}
              />

              <DetailItem
                icon={Hash}
                label="Student ID"
                value={fee.student_id}
              />

              <DetailItem
                icon={Hash}
                label="Fee Record ID"
                value={fee.id}
              />
            </div>
          </div>

          {/* Fee Information */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              Fee Information
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailItem
                icon={CalendarDays}
                label="Fee Month"
                value={formatMonth(fee.fee_month)}
              />

              <DetailItem
                icon={CalendarDays}
                label="Payment Date"
                value={formatDate(fee.payment_date)}
              />

              <DetailItem
                icon={Wallet}
                label="Original Amount"
                value={formatCurrency(fee.amount)}
              />

              <DetailItem
                icon={Wallet}
                label="Discount"
                value={formatCurrency(fee.discount)}
              />

              <DetailItem
                icon={Wallet}
                label="Total Amount"
                value={formatCurrency(fee.total_amount)}
              />

              <DetailItem
                icon={Wallet}
                label="Paid Amount"
                value={formatCurrency(fee.paid_amount)}
              />

              <DetailItem
                icon={Wallet}
                label="Remaining Amount"
                value={formatCurrency(fee.remaining_amount)}
              />

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <div className="mb-1.5 flex items-center gap-2">
                  <BadgeCheck
                    size={14}
                    className="text-teal-700"
                  />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Payment Status
                  </p>
                </div>

                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold capitalize ${
                    STATUS_STYLES[status] ||
                    "border-slate-200 bg-slate-100 text-slate-600"
                  }`}
                >
                  {status}
                </span>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              Remarks
            </h3>

            <div className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <MessageSquare
                size={16}
                className="mt-0.5 shrink-0 text-teal-700"
              />

              <p className="whitespace-pre-wrap break-words text-sm text-slate-700">
                {fee.remarks || "No remarks added."}
              </p>
            </div>
          </div>

          {/* Record Timestamps */}
          <div className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Created At
              </p>
              <p className="mt-1 text-xs font-medium text-slate-600">
                {formatDate(fee.created_at)}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Last Updated
              </p>
              <p className="mt-1 text-xs font-medium text-slate-600">
                {formatDate(fee.updated_at)}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
