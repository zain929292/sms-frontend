
import {
  Users,
  UserCheck,
  GraduationCap,
  ClipboardCheck,
} from "lucide-react";

export default function EnrollmentSummaryCards({
  stats = {},
}) {
  const cards = [
    {
      title: "Total Enrollments",
      count: stats.total ?? 0,
      description: "All enrollment records",
      icon: Users,
      iconBg: "bg-teal-50",
      iconColor: "text-[var(--primary)]",
      countColor: "text-slate-900",
    },
    {
      title: "Active Enrollments",
      count: stats.active ?? 0,
      description: "Currently enrolled students",
      icon: UserCheck,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      countColor: "text-green-600",
    },
    {
      title: "Promoted Students",
      count: stats.promoted ?? 0,
      description: "Previous enrollment records",
      icon: GraduationCap,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      countColor: "text-blue-600",
    },
    {
      title: "Other Enrollments",
      count: stats.other ?? 0,
      description: "Completed or withdrawn",
      icon: ClipboardCheck,
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
      countColor: "text-slate-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="group rounded-2xl border border-[var(--gray)] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {card.title}
                </p>

                <h3
                  className={`mt-3 text-3xl font-bold tracking-tight ${card.countColor}`}
                >
                  {card.count}
                </h3>
              </div>

              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}
              >
                <Icon size={21} className={card.iconColor} />
              </div>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-3">
              <p className="text-xs text-slate-500">
                {card.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
