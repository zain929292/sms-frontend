
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
  IdCard,
  Award,
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
    if (value === null || value === undefined || value === "") {
      return "Not provided";
    }

    return value;
  };

  const formatDate = (date) => {
    if (!date) return "Not provided";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const initials =
    user.name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "U";

  const overview = [
    {
      label: "Account ID",
      value: `#${user.id}`,
      icon: Hash,
    },
    {
      label: "Staff ID",
      value: details.staff_id ? `#${details.staff_id}` : "Not assigned",
      icon: IdCard,
    },
    {
      label: "Experience",
      value:
        details.experience !== null &&
        details.experience !== undefined &&
        details.experience !== ""
          ? `${details.experience} Years`
          : "Not provided",
      icon: Award,
    },
  ];

  const sections = [
    {
      title: "Account Information",
      description: "Basic account and login details",
      icon: ShieldCheck,
      fields: [
        { label: "User ID", value: user.id, icon: Hash },
        { label: "Full Name", value: user.name, icon: UserRound },
        { label: "Email Address", value: user.email, icon: Mail },
        {
          label: "Assigned Role",
          value: roleName,
          icon: ShieldCheck,
          capitalize: true,
        },
      ],
    },
    {
      title: "Personal Information",
      description: "Personal records and contact information",
      icon: User,
      fields: [
        { label: "Phone Number", value: details.phone, icon: Phone },
        {
          label: "Gender",
          value: details.gender,
          icon: User,
          capitalize: true,
        },
        {
          label: "Date of Birth",
          value: formatDate(details.dob),
          icon: Calendar,
        },
        { label: "CNIC Number", value: details.cnic, icon: CreditCard },
        {
          label: "Emergency Contact",
          value: details.emergency_contact,
          icon: Contact,
        },
        {
          label: "Address",
          value: details.address,
          icon: MapPin,
          full: true,
        },
      ],
    },
    {
      title: "Professional Information",
      description: "Qualification and employment details",
      icon: BriefcaseBusiness,
      fields: [
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
          value:
            details.experience !== null &&
            details.experience !== undefined &&
            details.experience !== ""
              ? `${details.experience} Years`
              : null,
          icon: Clock,
        },
        {
          label: "Employment Type",
          value: details.employment_type,
          icon: BriefcaseBusiness,
          capitalize: true,
        },
        {
          label: "Joining Date",
          value: formatDate(details.joining_date),
          icon: Calendar,
        },
      ],
    },
  ];

  const DetailItem = ({ field }) => {
    const Icon = field.icon;
    const hasValue =
      field.value !== null &&
      field.value !== undefined &&
      field.value !== "";

    return (
      <div
        className={`group min-w-0 rounded-xl border border-slate-200/80 bg-white p-4 transition-all duration-200 hover:border-teal-200 hover:shadow-md hover:shadow-slate-200/50 ${
          field.full ? "sm:col-span-2" : ""
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 transition-colors group-hover:bg-teal-50 group-hover:text-teal-700">
            <Icon size={17} strokeWidth={1.8} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {field.label}
            </p>

            <p
              className={`break-words text-[13px] font-semibold leading-5 ${
                hasValue ? "text-slate-700" : "italic text-slate-400"
              } ${field.capitalize ? "capitalize" : ""}`}
            >
              {formatValue(field.value)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const Section = ({ section }) => {
    const Icon = section.icon;

    return (
      <section className="mb-7 last:mb-0">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
            <Icon size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-slate-800">
              {section.title}
            </h3>
            <p className="mt-0.5 text-[11px] text-slate-400">
              {section.description}
            </p>
          </div>

          <span className="text-[10px] font-semibold text-slate-400">
            {section.fields.length} fields
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {section.fields.map((field) => (
            <DetailItem key={field.label} field={field} />
          ))}
        </div>
      </section>
    );
  };

  return (
    <>
      <style>{`
        @keyframes modalBackdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modalEnter {
          from {
            opacity: 0;
            transform: translateY(12px) scale(.99);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .user-modal-backdrop {
          animation: modalBackdrop .2s ease-out both;
        }

        .user-modal-content {
          animation: modalEnter .25s ease-out both;
        }

        @media (prefers-reduced-motion: reduce) {
          .user-modal-backdrop,
          .user-modal-content {
            animation: none !important;
          }
        }
      `}</style>

      <div
        className="user-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-[3px] sm:p-5"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="user-details-title"
          className="user-modal-content flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <h2
                id="user-details-title"
                className="text-base font-bold text-slate-800"
              >
                User Profile
              </h2>
              <p className="mt-1 text-[11px] text-slate-400">
                Account details and professional information
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="rounded-lg border border-slate-200 p-2 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
            >
              <X size={17} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/70 px-4 py-5 sm:px-6 sm:py-6">
            {/* Profile Header */}
            <div className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center">
              <div className="relative mx-auto shrink-0 sm:mx-0">
                {details.photo ? (
                  <img
                    src={details.photo}
                    alt={user.name || "User"}
                    className="h-20 w-20 rounded-2xl border border-slate-200 object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-teal-700 text-2xl font-bold text-white">
                    {initials}
                  </div>
                )}

                <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-[3px] border-white bg-emerald-500" />
              </div>

              <div className="min-w-0 flex-1 text-center sm:text-left">
                <h3 className="break-words text-xl font-bold text-slate-800">
                  {user.name || "Unnamed User"}
                </h3>

                <p className="mt-1 flex items-center justify-center gap-2 break-all text-xs text-slate-500 sm:justify-start">
                  <Mail size={14} className="shrink-0" />
                  {user.email || "No email available"}
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-1.5 text-[11px] font-semibold capitalize text-teal-800">
                    <ShieldCheck size={13} />
                    {roleName}
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-600">
                    <IdCard size={13} />
                    User #{user.id}
                  </span>
                </div>
              </div>

              <div className="hidden border-l border-slate-100 pl-5 text-right lg:block">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Account
                </p>
                <p className="mt-1 text-sm font-bold text-slate-700">
                  Profile Details
                </p>
              </div>
            </div>

            {/* Quick Overview */}
            <div className="mb-7">
              <div className="mb-3">
                <h3 className="text-sm font-bold text-slate-800">
                  Quick Overview
                </h3>
                <p className="mt-1 text-[11px] text-slate-400">
                  Important details at a glance
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {overview.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                        <Icon size={19} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {item.label}
                        </p>
                        <p className="mt-1 break-words text-sm font-bold capitalize text-slate-800">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Information Sections */}
            {sections.map((section) => (
              <Section key={section.title} section={section} />
            ))}

            {/* Additional Information */}
            <section className="mt-7">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                  <FileText size={18} />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Additional Information
                  </h3>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Notes and other relevant details
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Remarks
                </p>

                <p className="whitespace-pre-wrap break-words text-[13px] leading-6 text-slate-700">
                  {formatValue(details.remarks)}
                </p>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-white px-5 py-3 sm:px-6">
            <p className="text-[11px] text-slate-400">
              Account ID: <span className="font-semibold text-slate-600">#{user.id}</span>
            </p>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-teal-700 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-teal-800 active:scale-[0.98]"
            >
              Close Profile
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
