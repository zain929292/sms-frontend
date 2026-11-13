
import { Wallet, CheckCircle2, CircleSlash } from "lucide-react";

const SalaryStructureStats = ({
  totalCount = 0,
  activeCount = 0,
  inactiveCount = 0,
}) => {
  const stats = [
    {
      label: "Total Salaries",
      value: totalCount,
      icon: Wallet,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Active Structures",
      value: activeCount,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Inactive Structures",
      value: inactiveCount,
      icon: CircleSlash,
      color: "bg-rose-50 text-rose-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <div
          key={label}
          className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-lg ${color}`}
          >
            <Icon size={21} />
          </div>

          <div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SalaryStructureStats;
