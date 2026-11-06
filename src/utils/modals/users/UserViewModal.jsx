
import { X, UserRound, Mail, ShieldCheck, Phone, MapPin, Calendar, CreditCard, Hash } from "lucide-react";

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

  const fields = [
    { label: "User ID", value: user.id, icon: Hash },
    { label: "Full Name", value: user.name, icon: UserRound },
    { label: "Email Address", value: user.email, icon: Mail },
    { label: "Phone", value: details.phone ?? user.phone, icon: Phone },
    { label: "Gender", value: details.gender ?? user.gender },
    {
      label: "Date of Birth",
      value: (details.dob ?? user.dob)?.substring(0, 10),
      icon: Calendar,
    },
    { label: "CNIC", value: details.cnic ?? user.cnic, icon: CreditCard },
    { label: "Address", value: details.address ?? user.address, icon: MapPin },

  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <UserRound size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                User Details
              </h2>
              <p className="text-xs text-slate-500">
                Account information
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Profile */}
        <div className="mx-5 mt-5 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-100 text-lg font-bold text-teal-800">
            {user.name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-bold text-slate-800">
              {user.name || "—"}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-500">
              <Mail size={13} />
              {user.email || "—"}
            </p>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-700">
              <ShieldCheck size={13} />
              {roleName}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="px-5 py-5">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
            Account Information
          </h3>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {fields.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="min-w-0 rounded-lg border border-slate-100 p-3 transition hover:border-teal-100"
              >
                <div className="flex items-center gap-2 text-slate-400">
                  {Icon && <Icon size={14} />}
                  <span className="text-[11px] font-medium">{label}</span>
                </div>

                <p className="mt-2 break-words text-xs font-semibold text-slate-700">
                  {value || "—"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-100 bg-slate-50/60 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-teal-700 px-5 py-2 text-xs font-semibold text-white transition hover:bg-teal-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
