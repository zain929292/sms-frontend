
import {
  Wallet,
  TrendingUp,
  Clock,
} from "lucide-react";

const PayrollStats = ({ stats = {}, onStatusChange }) => {
  const {
    total_amount = 0,
    paid_amount = 0,
    remaining_amount = 0,
    partial = 0,
    unpaid = 0,
    paid = 0,
  } = stats;

  const paidRate = total_amount
    ? Math.round((paid_amount / total_amount) * 100)
    : 0;

  const formatAmount = (amount) =>
    `Rs. ${Number(amount || 0).toLocaleString("en-PK")}`;

  const amounts = [
    {
      title: "Total Payroll",
      value: total_amount,
      subtitle: "Total generated salary",
      icon: Wallet,
      color: "text-teal-700",
      bg: "bg-teal-50",
    },
    {
      title: "Paid Amount",
      value: paid_amount,
      subtitle: `${paidRate}% paid`,
      icon: TrendingUp,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
    },
    {
      title: "Remaining",
      value: remaining_amount,
      subtitle: "Outstanding salary",
      icon: Clock,
      color: "text-orange-700",
      bg: "bg-orange-50",
    },
  ];

  const statuses = [
    {
      key: "paid",
      title: "Paid",
      value: paid,
      color: "text-emerald-700",
      dot: "bg-emerald-500",
    },
    {
      key: "partial",
      title: "Partial",
      value: partial,
      color: "text-amber-700",
      dot: "bg-amber-500",
    },
    {
      key: "unpaid",
      title: "Unpaid",
      value: unpaid,
      color: "text-rose-700",
      dot: "bg-rose-500",
    },
  ];

  return (
    <div className="space-y-3">
      {/* Financial Summary */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {amounts.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">
                  {item.title}
                </span>

                <span className={`rounded-md p-1.5 ${item.bg}`}>
                  <Icon size={15} className={item.color} />
                </span>
              </div>

              <p className="mt-2 truncate text-lg font-bold text-gray-800">
                {formatAmount(item.value)}
              </p>

              <p className="mt-0.5 text-[11px] text-gray-500">
                {item.subtitle}
              </p>
            </div>
          );
        })}
      </div>

      {/* Payment Status */}
      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
        <div className="mb-2.5 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-gray-700">
            Payroll Payment Status
          </h3>

          <span className="text-[10px] text-gray-400">
            Payroll records
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {statuses.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onStatusChange?.(item.key)}
              className="flex items-center justify-between gap-2 rounded-md border border-gray-100 px-2.5 py-2 text-left transition hover:border-gray-300 hover:bg-gray-50"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${item.dot}`}
                  />

                  <span className="text-[11px] font-medium text-gray-500">
                    {item.title}
                  </span>
                </div>

                <p className={`mt-1 text-lg font-bold ${item.color}`}>
                  {Number(item.value).toLocaleString("en-PK")}
                </p>
              </div>

              <span className="text-[10px] text-gray-400">
                Records
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PayrollStats;
