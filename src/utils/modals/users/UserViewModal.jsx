import {
  X,
  UserRound,
  Mail,
  ShieldCheck,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Hash,
  GraduationCap,
  BriefcaseBusiness,
  Clock,
  Contact,
  FileText,
  Building2,
  User,
} from "lucide-react";

export default function UserViewModal({ isOpen, onClose, user }) {
  if (!isOpen || !user) return null;

  const details = user.user_details || {};

  const roleName =
    user.role_name ||
    user.role?.name ||
    (Array.isArray(user.roles)
      ? user.roles.map((role) => role.name).filter(Boolean).join(", ")
      : null) ||
    "No role assigned";

  const formatValue = (value) => {
    if (value === null || value === undefined || value === "") return "—";
    return value;
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const initials = user.name
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  const accountFields = [
    { label: "User ID", value: user.id, icon: Hash },
    { label: "Full Name", value: user.name, icon: UserRound },
    { label: "Email Address", value: user.email, icon: Mail },
    { label: "Role", value: roleName, icon: ShieldCheck },
  ];

  const personalFields = [
    { label: "Phone Number", value: details.phone, icon: Phone },
    { label: "Gender", value: details.gender, icon: User },
    {
      label: "Date of Birth",
      value: formatDate(details.dob),
      icon: Calendar,
    },
    { label: "CNIC", value: details.cnic, icon: CreditCard },
    {
      label: "Emergency Contact",
      value: details.emergency_contact,
      icon: Contact,
    },
    { label: "Address", value: details.address, icon: MapPin, full: true },
  ];

  const professionalFields = [
    {
      label: "Qualification",
      value: details.qualification,
      icon: GraduationCap,
    },
    {
      label: "Specialization",
      value: details.specialization,
      icon: Building2,
    },
    {
      label: "Experience",
      value: details.experience
        ? `${details.experience} Years`
        : "—",
      icon: Clock,
    },
    {
      label: "Employment Type",
      value: details.employment_type
        ? details.employment_type.replaceAll("_", " ")
        : "—",
      icon: BriefcaseBusiness,
      capitalize: true,
    },
    {
      label: "Joining Date",
      value: formatDate(details.joining_date),
      icon: Calendar,
    },
  ];

  const DetailItem = ({ label, value, icon: Icon, full, capitalize }) => (
    <div className={`${full ? "sm:col-span-2" : ""} min-w-0`}>
      <div className="mb-1.5 flex items-center gap-2 text-slate-400">
        {Icon && <Icon size={14} strokeWidth={1.8} />}
        <span className="text-[11px] font-medium">{label}</span>
      </div>

      <p
        className={`break-words text-[13px] font-medium text-slate-700 ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {formatValue(value)}
      </p>
    </div>
  );

  const Section = ({ title, children }) => (
    <section className="mb-6">
      <h3 className="mb-4 border-b border-slate-100 pb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        {title}
      </h3>

      <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
        {children}
      </div>
    </section>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-details-title"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <div>
            <h2
              id="user-details-title"
              className="text-sm font-bold text-slate-800"
            >
              User Details
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Complete account and personal information
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-5 py-5">
          {/* Profile Header */}
          <div className="mb-6 flex items-center gap-3">
            {details.photo ? (
              <img
                src={details.photo}
                alt={user.name || "User"}
                className="h-14 w-14 shrink-0 rounded-full border border-slate-200 object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-teal-50 text-lg font-bold text-teal-700">
                {initials || "U"}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-bold text-slate-800">
                {user.name || "Unnamed User"}
              </h3>

              <p className="mt-0.5 truncate text-xs text-slate-500">
                {user.email || "No email available"}
              </p>

              <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-1 text-[10px] font-semibold capitalize text-teal-700">
                <ShieldCheck size={12} />
                {roleName}
              </span>
            </div>
          </div>

          {/* Account Information */}
          <Section title="Account Information">
            {accountFields.map((field) => (
              <DetailItem key={field.label} {...field} />
            ))}
          </Section>

          {/* Personal Information */}
          <Section title="Personal Information">
            {personalFields.map((field) => (
              <DetailItem key={field.label} {...field} />
            ))}
          </Section>

          {/* Professional Information */}
          <Section title="Professional Information">
            {professionalFields.map((field) => (
              <DetailItem key={field.label} {...field} />
            ))}
          </Section>

          {/* Additional Information */}
          <Section title="Additional Information">
            <DetailItem
              label="Remarks"
              value={details.remarks}
              icon={FileText}
              full
            />
          </Section>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-end border-t border-slate-100 bg-white px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-teal-700 px-5 py-2 text-xs font-semibold text-white transition hover:bg-teal-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
