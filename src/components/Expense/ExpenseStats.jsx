
import {
  Wallet,
  CalendarDays,
  CalendarRange,
  Clock,
} from "lucide-react";

import StatCard from "../../utils/cards/Stat.card.util";

const ExpenseStats = ({ stats = {} }) => {
  const statCards = [
    {
      key: "total",
      title: "Total Expenses",
      value: stats.total ?? 0,
      icon: Wallet,
      color: "teal",
      subtitle: "All recorded expenses",
    },
    {
      key: "today",
      title: "Today's Expenses",
      value: stats.today ?? 0,
      icon: CalendarDays,
      color: "blue",
      subtitle: "Expenses recorded today",
    },
    {
      key: "monthly",
      title: "Monthly Expenses",
      value: stats.monthly ?? 0,
      icon: CalendarRange,
      color: "emerald",
      subtitle: "Expenses this month",
    },
    {
      key: "pending",
      title: "Pending Expenses",
      value: stats.pending ?? 0,
      icon: Clock,
      color: "amber",
      subtitle: "Awaiting payment",
    },
  ];

  const formatAmount = (amount) =>
    `Rs. ${Number(amount || 0).toLocaleString("en-PK", {
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {statCards.map((card) => (
        <div
          key={card.key}
          className="min-w-0 [&>*]:h-full"
        >
          <StatCard
            {...card}
            value={formatAmount(card.value)}
          />
        </div>
      ))}
    </div>
  );
};

export default ExpenseStats;
