/**
 * @file StaffDetails.modal.util.jsx
 * @module Utils/Modals/StaffModal
 * @description Read-only staff member details modal.
 */

import { memo } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Stethoscope,
  Clock,
  CreditCard,
  Shield,
  Sparkles,
  UserCircle,
  BadgeCheck,
  FileText,
  Building,
} from "lucide-react";
import ModalShell from "../../../shared/ModalShell.shared";

/* -------------------------------------------------------------------------- */
/*                              Helpers                                       */
/* -------------------------------------------------------------------------- */

const ROLE_STYLES = {
  admin: "bg-purple-50 text-purple-700 border-purple-200",
  doctor: "bg-blue-50 text-blue-700 border-blue-200",
  receptionist: "bg-green-50 text-green-700 border-green-200",
  nurse: "bg-teal-50 text-teal-700 border-teal-200",
  pharmacist: "bg-orange-50 text-orange-700 border-orange-200",
  lab_technician: "bg-indigo-50 text-indigo-700 border-indigo-200",
  accountant: "bg-amber-50 text-amber-700 border-amber-200",
  staff: "bg-slate-100 text-slate-700 border-slate-200",
};

const ROLE_LABELS = {
  admin: "Administrator",
  doctor: "Doctor",
  receptionist: "Receptionist",
  nurse: "Nurse",
  pharmacist: "Pharmacist",
  lab_technician: "Lab Technician",
  accountant: "Accountant",
  staff: "Staff",
};

const STATUS_STYLES = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Inactive: "bg-slate-100 text-slate-600 border-slate-200",
  "On Leave": "bg-amber-50 text-amber-700 border-amber-200",
  Terminated: "bg-rose-50 text-rose-700 border-rose-200",
};

const SHIFT_STYLES = {
  morning: "bg-amber-50 text-amber-700 border-amber-200",
  evening: "bg-indigo-50 text-indigo-700 border-indigo-200",
  night: "bg-slate-50 text-slate-700 border-slate-200",
};

const getRoleStyle = (role) =>
  ROLE_STYLES[role?.toLowerCase()] || ROLE_STYLES.staff;
const getRoleLabel = (role) =>
  ROLE_LABELS[role?.toLowerCase()] || role || "Staff";
const getStatusStyle = (status) =>
  STATUS_STYLES[status] || STATUS_STYLES.Active;
const getShiftStyle = (shift) =>
  SHIFT_STYLES[shift?.toLowerCase()] || SHIFT_STYLES.morning;

const formatDate = (d) => {
  if (!d) return "N/A";
  const date = new Date(d);
  return isNaN(date.getTime())
    ? d
    : date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
};

const getInitials = (name) =>
  !name
    ? "S"
    : name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

/* -------------------------------------------------------------------------- */
/*                              Sub-components                                */
/* -------------------------------------------------------------------------- */

const Badge = memo(({ icon: Icon, label, className }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${className}`}
  >
    <Icon size={12} className="mr-1" />
    {label}
  </span>
));
Badge.displayName = "Badge";

const DetailField = ({ label, value, icon: Icon, mono, valueClass }) => (
  <div>
    <p className="text-[10px] text-slate-500 uppercase font-bold">{label}</p>
    <p
      className={`text-sm font-medium flex items-center gap-1.5 ${
        valueClass || "text-slate-800"
      } ${mono ? "font-mono" : ""}`}
    >
      {Icon && <Icon size={14} className="text-slate-400" />}
      {value ?? "N/A"}
    </p>
  </div>
);

const DetailSection = ({ icon: Icon, title, children }) => (
  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80">
    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
      <Icon size={14} className="text-[#034A52]" />
      {title}
    </p>
    {children}
  </div>
);

/* -------------------------------------------------------------------------- */
/*                              Component                                     */
/* -------------------------------------------------------------------------- */

const StaffDetailsModal = ({ isOpen, onClose, staffData }) => {
  if (!staffData) return null;

  const fullName = staffData.name || staffData.full_name || "Staff Member";
  const role = staffData.role || "staff";
  const status = staffData.status || "Active";
  const shift = staffData.shift || "Morning";
  const specialization = staffData.specialization || "General";
  const consultationFee = staffData.consultation_fee || 0;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          Staff Details
          <Sparkles size={16} className="text-teal-500 inline ml-1" />
        </>
      }
      subtitle={`Staff ID: #${staffData.id || staffData._id || "N/A"}`}
      icon={<UserCircle size={22} />}
      iconClass="from-[#034A52] to-teal-500"
      accentShadow="shadow-teal-900/20"
      maxWidth="max-w-2xl"
    >
      <div className="p-6 space-y-6">
        {/* Profile header */}
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-teal-50/50 rounded-2xl border border-slate-200">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#034A52] to-teal-500 text-white text-xl font-bold shadow-lg shadow-teal-900/20">
            {getInitials(fullName)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-800 truncate">
              {fullName}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge
                icon={Shield}
                label={getRoleLabel(role)}
                className={getRoleStyle(role)}
              />
              <Badge
                icon={BadgeCheck}
                label={status}
                className={getStatusStyle(status)}
              />
              <Badge
                icon={Clock}
                label={shift}
                className={getShiftStyle(shift)}
              />
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <DetailSection icon={User} title="Personal Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DetailField label="Full Name" value={fullName} />
            <DetailField
              label="Email Address"
              value={staffData.email}
              icon={Mail}
            />
            <DetailField label="CNIC" value={staffData.cnic} mono />
            <DetailField
              label="Phone Number"
              value={staffData.phone}
              icon={Phone}
            />
            <DetailField
              label="Date of Birth"
              value={formatDate(staffData.dob)}
              icon={Calendar}
            />
            <DetailField label="Gender" value={staffData.gender} />
            {staffData.address && (
              <div className="sm:col-span-2">
                <DetailField
                  label="Address"
                  value={staffData.address}
                  icon={MapPin}
                />
              </div>
            )}
          </div>
        </DetailSection>

        {/* Professional Info */}
        <DetailSection icon={Briefcase} title="Professional Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DetailField
              label="Role"
              value={getRoleLabel(role)}
              icon={Shield}
            />
            <DetailField
              label="Specialization"
              value={specialization}
              icon={Stethoscope}
            />
            <DetailField label="Shift" value={shift} icon={Clock} />
            <DetailField
              label="Consultation Fee"
              value={consultationFee > 0 ? `PKR ${consultationFee}` : "N/A"}
              icon={CreditCard}
              valueClass="text-emerald-600 font-bold"
            />
            <DetailField label="Status" value={status} />
            {staffData.department && (
              <DetailField
                label="Department"
                value={staffData.department}
                icon={Building}
              />
            )}
          </div>
        </DetailSection>

        {/* Additional Info */}
        {(staffData.notes ||
          staffData.qualifications ||
          staffData.experience) && (
          <DetailSection icon={FileText} title="Additional Information">
            <div className="space-y-3">
              {staffData.qualifications && (
                <DetailField
                  label="Qualifications"
                  value={staffData.qualifications}
                />
              )}
              {staffData.experience && (
                <DetailField
                  label="Experience"
                  value={`${staffData.experience} years`}
                />
              )}
              {staffData.notes && (
                <DetailField label="Notes" value={staffData.notes} />
              )}
            </div>
          </DetailSection>
        )}

        {/* Timestamps */}
        {(staffData.created_at || staffData.updated_at) && (
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {staffData.created_at && (
              <DetailField
                label="Created At"
                value={formatDate(staffData.created_at)}
                icon={Calendar}
              />
            )}
            {staffData.updated_at && (
              <DetailField
                label="Last Updated"
                value={formatDate(staffData.updated_at)}
                icon={Calendar}
              />
            )}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 flex items-center justify-end px-6 py-4 border-t border-slate-100 bg-white/80 backdrop-blur-md rounded-b-3xl">
        <button
          onClick={onClose}
          className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-50 active:scale-95"
        >
          Close
        </button>
      </div>
    </ModalShell>
  );
};

export default StaffDetailsModal;
