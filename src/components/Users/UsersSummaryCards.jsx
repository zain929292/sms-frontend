
import {
  Users,
  UserCheck,
  UserCog,
  ShieldCheck,
} from "lucide-react";

const cardStyles = [
  {
    label: "Total Users",
    key: "total_users",
    icon: Users,
    iconStyle: "bg-teal-50 text-teal-700",
  },
  {
    label: "Active Users",
    key: "active_users",
    icon: UserCheck,
    iconStyle: "bg-blue-50 text-blue-700",
  },
  {
    label: "Inactive Users",
    key: "inactive_users",
    icon: UserCog,
    iconStyle: "bg-emerald-50 text-emerald-700",
  },
  {
    label: "Total Roles",
    key: "total_roles",
    icon: ShieldCheck,
    iconStyle: "bg-amber-50 text-amber-700",
  },
];

export default function UsersSummaryCards({ stats = {} }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cardStyles.map((card) => {
        const Icon = card.icon;

        const value = Array.isArray(stats)
          ? stats.find(
              (item) =>
                item.key === card.key ||
                item.label === card.label
            )?.value
          : stats?.[card.key];

        return (
          <div
            key={card.key}
            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3"
          >
            <div className={`rounded-lg p-2 ${card.iconStyle}`}>
              <Icon size={18} />
            </div>

            <div>
              <p className="text-xs text-slate-500">
                {card.label}
              </p>

              <p className="text-lg font-semibold text-slate-800">
                {value ?? "—"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
