/**
 * @file IpdBillingModal.util.jsx
 * @module Utils/Modals/IPDModal
 * @description Modal for viewing IPD billing details.
 */

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Receipt,
  Sparkles,
  User,
  Stethoscope,
  Building,
  Calendar,
  FileText,
  Loader2,
  Banknote,
  CreditCard,
  Wallet,
  CheckCircle2,
  Clock,
} from "lucide-react";

import { fetchIpdChargesByAdmission } from "../../../redux/slices/Admissions.slice.redux";
import ModalShell from "../../../shared/ModalShell.shared";

/* -------------------------------------------------------------------------- */
/*                                 Helpers                                    */
/* -------------------------------------------------------------------------- */

const formatCurrency = (amount) => {
  if (!amount || amount === "0.00" || amount === 0 || amount === null)
    return "N/A";
  return `PKR ${Number(amount).toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const StatusBadge = ({ status }) => {
  const s = status?.toLowerCase();
  if (s === "discharged") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 size={12} /> Discharged
      </span>
    );
  }
  if (s === "admitted") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
        <Clock size={12} /> Admitted
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
      {status || "N/A"}
    </span>
  );
};

const BillingRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-100">
    <div className="flex items-center gap-2">
      <Icon size={16} className="text-slate-400" />
      <span className="text-sm text-slate-600">{label}</span>
    </div>
    <span className="text-sm font-semibold text-slate-800">
      {formatCurrency(value)}
    </span>
  </div>
);

const InfoBlock = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
      <Icon size={18} className="text-teal-600" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
        {label}
      </p>
      <p className="text-sm font-bold text-slate-800 truncate">{value}</p>
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/*                              Component                                     */
/* -------------------------------------------------------------------------- */

const IpdBillingModal = ({ isOpen, onClose, admissionData }) => {
  const dispatch = useDispatch();

  const { ipdChargesByAdmission, ipdChargesByAdmissionLoading } = useSelector(
    (s) => s.admissions || {},
  );

  useEffect(() => {
    if (isOpen && admissionData?.id) {
      dispatch(fetchIpdChargesByAdmission(admissionData.id));
    }
  }, [isOpen, dispatch, admissionData?.id]);

  const charges = ipdChargesByAdmission;
  const data = admissionData;

  const locationString = useMemo(() => {
    if (!data) return "N/A";
    const ward = data?.ward?.name || data?.wardName || "N/A";
    const room = data?.room?.room_number || data?.roomNumber || "N/A";
    const bed = data?.bed?.bed_number || data?.bedNumber || "N/A";
    return `${ward} • ${room} • ${bed}`;
  }, [data]);

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          IPD Billing Details
          <Sparkles size={16} className="text-teal-500 inline ml-1" />
        </>
      }
      subtitle={`Admission ID: #${data?.id || "N/A"}`}
      icon={<Receipt size={22} />}
      iconClass="from-[#034A52] to-teal-500"
      accentShadow="shadow-teal-900/20"
      maxWidth="max-w-2xl"
    >
      <div className="p-6 space-y-6">
        {ipdChargesByAdmissionLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 size={40} className="animate-spin text-[#034A52] mb-4" />
            <p className="text-sm font-medium text-slate-600">
              Loading billing details...
            </p>
          </div>
        ) : (
          <>
            {/* Patient info */}
            <div className="bg-gradient-to-r from-slate-50 to-teal-50/50 rounded-2xl p-4 border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoBlock
                  icon={User}
                  label="Patient"
                  value={data?.patient?.name || data?.patientName || "N/A"}
                />
                <InfoBlock
                  icon={Stethoscope}
                  label="Doctor"
                  value={data?.doctor?.name || data?.doctorName || "N/A"}
                />
                <InfoBlock
                  icon={Building}
                  label="Ward / Room / Bed"
                  value={locationString}
                />
                <InfoBlock
                  icon={Calendar}
                  label="Admission Date"
                  value={data?.admission_date || "N/A"}
                />
              </div>
            </div>

            {/* Billing breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Wallet size={16} className="text-[#034A52]" />
                Billing Breakdown
              </h3>

              {charges ? (
                <div className="space-y-3">
                  <BillingRow
                    icon={Banknote}
                    label="Admission Fee"
                    value={charges.admission_fee}
                  />
                  <BillingRow
                    icon={Building}
                    label="Room Charge"
                    value={charges.room_charge}
                  />
                  <BillingRow
                    icon={Stethoscope}
                    label="Doctor Visit"
                    value={charges.doctor_visit}
                  />
                  <BillingRow
                    icon={User}
                    label="Nursing Charge"
                    value={charges.nursing_charge}
                  />
                  <BillingRow
                    icon={FileText}
                    label="Other Charges"
                    value={charges.other}
                  />

                  <div className="flex items-center justify-between py-3 bg-teal-50/50 rounded-xl px-4 -mx-1">
                    <div className="flex items-center gap-2">
                      <CreditCard size={18} className="text-[#034A52]" />
                      <span className="text-sm font-bold text-slate-800">
                        Total Amount
                      </span>
                    </div>
                    <span className="text-lg font-extrabold text-[#034A52]">
                      {formatCurrency(charges.total_amount)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Receipt size={40} className="mx-auto mb-3 text-slate-300" />
                  <p className="text-sm font-medium">
                    No billing records found
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Charges have not been generated for this admission yet
                  </p>
                </div>
              )}
            </div>

            {/* Status & dates */}
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">
                    Status
                  </p>
                  <StatusBadge status={data?.status} />
                </div>
                {data?.discharge_date && (
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                      Discharge Date
                    </p>
                    <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-400" />
                      {data.discharge_date}
                    </p>
                  </div>
                )}
                {data?.reason && (
                  <div className="md:col-span-2">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                      Reason for Admission
                    </p>
                    <p className="text-sm font-medium text-slate-800">
                      {data.reason}
                    </p>
                  </div>
                )}
                {data?.notes && (
                  <div className="md:col-span-2">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                      Notes
                    </p>
                    <p className="text-sm font-medium text-slate-800">
                      {data.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end pt-4 border-t border-slate-100">
              <button
                onClick={onClose}
                className="rounded-xl bg-[#034A52] hover:bg-[#02373d] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#034A52]/20 transition-all duration-200 active:scale-95"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </ModalShell>
  );
};

export default IpdBillingModal;
