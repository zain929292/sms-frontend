/**
 * @file LabBookingDetails.modal.util.jsx
 * @module LabBookingDetailsModal
 * @description Read-only booking details — self-fetches linked lab tests via Redux.
 */

import { memo, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Calendar,
  User,
  Stethoscope,
  DollarSign,
  TestTube,
  FlaskConical,
  Receipt,
  Clock,
  Activity,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Download,
  Hash,
  Percent,
  CreditCard,
  Sparkles,
  ListChecks,
  Loader2,
} from "lucide-react";
import ModalShell from "../../../shared/ModalShell.shared";
import {
  fetchLabBookingTestsByBooking,
  clearLabBookingTestsByBooking,
} from "../../../redux/slices/Lab.slice.redux";

/* -------------------------------------------------------------------------- */
/*                             URL correction                                 */
/* -------------------------------------------------------------------------- */

const getCorrectedReportUrl = (url) =>
  url?.replace(
    "shoaib-boot-backend.retailer-connect.com/public/storage/",
    "hms.retailer-connect.com/storage/app/public/",
  ) || null;

/* -------------------------------------------------------------------------- */
/*                             Status badges                                  */
/* -------------------------------------------------------------------------- */

const Badge = ({ icon, label, className }) => (
  <span
    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${className}`}
  >
    {icon} {label}
  </span>
);

const STATUS_MAP = {
  completed: {
    icon: <CheckCircle2 size={12} />,
    label: "Completed",
    className: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  pending: {
    icon: <Clock size={12} />,
    label: "Pending",
    className: "bg-amber-50 text-amber-600 border-amber-200",
  },
  sample_collected: {
    icon: <TestTube size={12} />,
    label: "Sample Collected",
    className: "bg-blue-50 text-blue-600 border-blue-200",
  },
  collected: {
    icon: <TestTube size={12} />,
    label: "Collected",
    className: "bg-blue-50 text-blue-600 border-blue-200",
  },
  received: {
    icon: <Clock size={12} />,
    label: "Received",
    className: "bg-amber-50 text-amber-600 border-amber-200",
  },
  processing: {
    icon: <Activity size={12} />,
    label: "Processing",
    className: "bg-purple-50 text-purple-600 border-purple-200",
  },
  rejected: {
    icon: <XCircle size={12} />,
    label: "Rejected",
    className: "bg-rose-50 text-rose-600 border-rose-200",
  },
  cancel: {
    icon: <XCircle size={12} />,
    label: "Cancelled",
    className: "bg-rose-50 text-rose-600 border-rose-200",
  },
  cancelled: {
    icon: <XCircle size={12} />,
    label: "Cancelled",
    className: "bg-rose-50 text-rose-600 border-rose-200",
  },
};

const StatusBadge = memo(({ status }) => {
  const preset = STATUS_MAP[status?.toLowerCase()];
  if (!preset) {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
        {status || "Pending"}
      </span>
    );
  }
  return <Badge {...preset} />;
});
StatusBadge.displayName = "StatusBadge";

const CHARGE_MAP = {
  paid: {
    icon: <CheckCircle2 size={12} />,
    label: "Paid",
    className: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  partial: {
    icon: <Clock size={12} />,
    label: "Partial",
    className: "bg-amber-50 text-amber-600 border-amber-200",
  },
  unpaid: {
    icon: <XCircle size={12} />,
    label: "Unpaid",
    className: "bg-rose-50 text-rose-600 border-rose-200",
  },
  refund: {
    icon: <XCircle size={12} />,
    label: "Refund",
    className: "bg-purple-50 text-purple-600 border-purple-200",
  },
};

const ChargeStatusBadge = memo(({ status }) => {
  const preset = CHARGE_MAP[status?.toLowerCase()];
  if (!preset)
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
        {status || "Not billed"}
      </span>
    );
  return <Badge {...preset} />;
});
ChargeStatusBadge.displayName = "ChargeStatusBadge";

/* -------------------------------------------------------------------------- */
/*                          Format / display helpers                          */
/* -------------------------------------------------------------------------- */

const formatDate = (d) => {
  if (!d) return "N/A";
  const date = new Date(d);
  return isNaN(date.getTime())
    ? "N/A"
    : date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
};

const formatDateTime = (d) => {
  if (!d) return "N/A";
  const date = new Date(d);
  return isNaN(date.getTime())
    ? "N/A"
    : date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
};

const DetailField = ({ label, children }) => (
  <div>
    <p className="text-[10px] text-slate-500 uppercase font-bold">{label}</p>
    <div className="text-sm font-semibold text-slate-800">{children}</div>
  </div>
);

const DetailSection = ({ icon: Icon, title, children, trailing }) => (
  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
      <Icon size={14} /> {title}
      {trailing}
    </h3>
    {children}
  </div>
);

const LinkedTestRow = memo(({ test, index }) => (
  <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2.5">
    <div className="flex items-center gap-2.5 min-w-0">
      <div className="w-7 h-7 shrink-0 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
        {(test.testName || "T").charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-800 truncate">
          {test.testName}
        </p>
        <p className="text-[10px] text-slate-500 truncate">
          {test.category || "General"}
          {test.testId != null && ` • Test #${test.testId}`}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-3 shrink-0">
      <span className="text-xs font-bold text-emerald-600 font-mono">
        Rs. {Number(test.price || 0).toFixed(2)}
      </span>
      <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
        #{index + 1}
      </span>
    </div>
  </div>
));
LinkedTestRow.displayName = "LinkedTestRow";

/* -------------------------------------------------------------------------- */
/*                              Component                                     */
/* -------------------------------------------------------------------------- */

const LabBookingDetailsModal = ({
  isOpen,
  onClose,
  booking,
  sample = null,
  result = null,
  charge = null,
}) => {
  const dispatch = useDispatch();

  /* ---------------------------- Redux lookups ---------------------------- */

  const labTests = useSelector((s) => s.lab?.labTests ?? []);
  const bookingTests = useSelector(
    (s) => s.lab?.labBookingTestsByBooking ?? [],
  );
  const testsLoading = useSelector(
    (s) => s.lab?.labBookingTestsByBookingLoading ?? false,
  );

  const testsById = useMemo(() => {
    const m = new Map();
    for (const t of labTests) m.set(Number(t.id), t);
    return m;
  }, [labTests]);

  /* ----------------------------- Effects --------------------------------- */

  useEffect(() => {
    if (!isOpen || !booking) return;

    const bookingId = booking.id || booking._id;
    if (!bookingId) return;

    dispatch(fetchLabBookingTestsByBooking(bookingId));

    return () => {
      dispatch(clearLabBookingTestsByBooking());
    };
  }, [isOpen, booking, dispatch]);

  /* ------------------------------ Derived -------------------------------- */

  const linkedTests = useMemo(() => {
    return bookingTests.map((row) => {
      const testId = Number(row.lab_test_id);
      const test = testsById.get(testId);
      return {
        testId,
        testName: test?.test_name || test?.name || `Test #${testId}`,
        category: test?.category || "",
        price: test?.price ?? test?.test_price ?? 0,
      };
    });
  }, [bookingTests, testsById]);

  const testsTotal = useMemo(
    () => linkedTests.reduce((sum, t) => sum + Number(t.price || 0), 0),
    [linkedTests],
  );

  const calculateChargeTotal = () => {
    if (!charge) return "0.00";
    const amt = parseFloat(charge.amount) || 0;
    const disc =
      parseFloat(charge.discount_percentage || charge.discount) || 0;
    const total = amt - (amt * disc) / 100;
    return total >= 0 ? total.toFixed(2) : "0.00";
  };

  /* ------------------------------- Render -------------------------------- */

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          Booking Details
          <Sparkles size={16} className="text-[#00A3AD] inline ml-1" />
        </>
      }
      subtitle={`Booking #${booking?.id} • ${booking?.patient_name || "Patient"}`}
      icon={<Receipt size={22} />}
      iconClass="from-[#00A3AD] to-cyan-500"
      accentShadow="shadow-cyan-900/20"
      maxWidth="max-w-3xl"
    >
      <div className="p-6 space-y-6">
        {/* ---------- Booking Info ---------- */}
        <div className="bg-gradient-to-r from-slate-50 to-teal-50/50 rounded-2xl p-4 border border-slate-200">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Calendar size={14} /> Booking Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailField label="Booking ID">#{booking?.id}</DetailField>
            <DetailField label="Status">
              <StatusBadge status={booking?.status} />
            </DetailField>
            <DetailField label="Patient">
              <span className="flex items-center gap-1">
                <User size={14} className="text-[#00A3AD]" />
                {booking?.patient_name || "N/A"}
              </span>
            </DetailField>
            <DetailField label="Doctor">
              <span className="flex items-center gap-1">
                <Stethoscope size={14} className="text-slate-400" />
                {booking?.doctor_name || "N/A"}
              </span>
            </DetailField>
            <DetailField label="Booking Date">
              {formatDate(booking?.booking_date)}
            </DetailField>
            <DetailField label="Notes">
              <span className="text-slate-700 font-medium">
                {booking?.notes || "None"}
              </span>
            </DetailField>
          </div>
        </div>

        {/* ---------- Linked Lab Tests ---------- */}
        <DetailSection
          icon={ListChecks}
          title="Lab Tests"
          trailing={
            <span className="ml-auto text-[10px] font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full normal-case tracking-normal">
              {testsLoading
                ? "Loading..."
                : `${linkedTests.length} test${linkedTests.length !== 1 ? "s" : ""}`}
            </span>
          }
        >
          {testsLoading ? (
            <div className="flex items-center justify-center gap-2 py-6">
              <Loader2 size={18} className="text-[#00A3AD] animate-spin" />
              <span className="text-xs text-slate-500">
                Loading linked tests...
              </span>
            </div>
          ) : linkedTests.length > 0 ? (
            <>
              <div className="space-y-2">
                {linkedTests.map((test, idx) => (
                  <LinkedTestRow
                    key={test.testId ?? idx}
                    test={test}
                    index={idx}
                  />
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign size={13} className="text-[#00A3AD]" />
                  Tests Total
                </span>
                <span className="text-base font-extrabold text-emerald-600">
                  Rs. {testsTotal.toFixed(2)}
                </span>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-400 italic">
              No lab tests linked to this booking.
            </p>
          )}
        </DetailSection>

        {/* ---------- Sample ---------- */}
        <DetailSection icon={FlaskConical} title="Sample Details">
          {sample ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailField label="Sample Code">
                <span className="flex items-center gap-1">
                  <Hash size={14} className="text-slate-400" />
                  {sample.sample_code || "N/A"}
                </span>
              </DetailField>
              <DetailField label="Type">
                <span className="capitalize">
                  {sample.sample_type || "N/A"}
                </span>
              </DetailField>
              <DetailField label="Status">
                <StatusBadge status={sample.status} />
              </DetailField>
              <DetailField label="Collected At">
                {formatDateTime(sample.collected_at)}
              </DetailField>
              <DetailField label="Received At">
                {formatDateTime(sample.received_at)}
              </DetailField>
              <DetailField label="Collected By">
                {sample.collected_by_user?.name || "N/A"}
              </DetailField>
              <DetailField label="Received By">
                {sample.received_by_user?.name || "N/A"}
              </DetailField>
              <DetailField label="Notes">
                <span className="text-slate-700 font-medium">
                  {sample.notes || "None"}
                </span>
              </DetailField>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">
              No sample recorded for this booking.
            </p>
          )}
        </DetailSection>

        {/* ---------- Result ---------- */}
        <DetailSection icon={TestTube} title="Test Result">
          {result ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailField label="Result">{result.result || "N/A"}</DetailField>
              <DetailField label="Status">
                <StatusBadge status={result.status} />
              </DetailField>
              <DetailField label="Reference Range">
                {result.reference_range || "N/A"}
              </DetailField>
              <DetailField label="Unit">{result.unit || "N/A"}</DetailField>
              <DetailField label="Interpretation">
                {result.interpretation || "N/A"}
              </DetailField>
              <DetailField label="Reported At">
                {formatDate(result.reported_at)}
              </DetailField>
              <DetailField label="Reported By">
                {result.reported_by_user?.name || "N/A"}
              </DetailField>
              <DetailField label="Notes">
                <span className="text-slate-700 font-medium">
                  {result.notes || "None"}
                </span>
              </DetailField>
              {result.test_report && (
                <div className="sm:col-span-2">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">
                    Report File
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <a
                      href={getCorrectedReportUrl(result.test_report)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-[#00A3AD] rounded-lg text-xs font-semibold transition-colors"
                    >
                      <ExternalLink size={14} /> View Report
                    </a>
                    <a
                      href={getCorrectedReportUrl(result.test_report)}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00A3AD] hover:bg-[#008C94] text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Download size={14} /> Download
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">
              No result recorded for this booking.
            </p>
          )}
        </DetailSection>

        {/* ---------- Charge ---------- */}
        <DetailSection icon={Receipt} title="Billing / Charge">
          {charge ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailField label="Amount">
                PKR {charge.amount || "0.00"}
              </DetailField>
              <DetailField label="Discount">
                <span className="flex items-center gap-1">
                  <Percent size={14} className="text-slate-400" />
                  {charge.discount_percentage || charge.discount || "0"}%
                </span>
              </DetailField>
              <DetailField label="Total (after discount)">
                <span className="text-emerald-600">
                  PKR {calculateChargeTotal()}
                </span>
              </DetailField>
              <DetailField label="Payment Status">
                <ChargeStatusBadge status={charge.payment_status} />
              </DetailField>
              <DetailField label="Payment Method">
                <span className="flex items-center gap-1">
                  <CreditCard size={14} className="text-slate-400" />
                  {charge.payment_method
                    ? charge.payment_method.replace("_", " ")
                    : "N/A"}
                </span>
              </DetailField>
              <DetailField label="Paid At">
                {formatDate(charge.paid_at)}
              </DetailField>
              <DetailField label="Notes">
                <span className="text-slate-700 font-medium">
                  {charge.notes || "None"}
                </span>
              </DetailField>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">
              No charge record for this booking.
            </p>
          )}
        </DetailSection>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-slate-100 px-6 py-4 rounded-b-3xl flex justify-end">
        <button
          onClick={onClose}
          className="rounded-xl bg-[#00A3AD] hover:bg-[#008C94] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-900/20 transition-all duration-200 active:scale-95"
        >
          Close
        </button>
      </div>
    </ModalShell>
  );
};

export default LabBookingDetailsModal;