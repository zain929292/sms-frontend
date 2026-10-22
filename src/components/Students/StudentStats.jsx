import { Users, UserCheck, UserX } from "lucide-react";
import StatCard from "../../utils/cards/Stat.card.util";

const StudentStats = ({ total, active, inactive }) => {
  const activeRate = total ? Math.round((active / total) * 100) : 0;
  const inactiveRate = total ? Math.round((inactive / total) * 100) : 0;

  const cards = [
    {
      key: "total",
      title: "Total Students",
      value: total,
      icon: Users,
      color: "teal",
      subtitle: "All matching records",
    },
    {
      key: "active",
      title: "Active Students",
      value: active,
      icon: UserCheck,
      color: "emerald",
      subtitle: `${activeRate}% of total`,
      progressPct: activeRate,
      progressColor: "bg-emerald-500",
    },
    {
      key: "inactive",
      title: "Inactive Students",
      value: inactive,
      icon: UserX,
      color: "rose",
      subtitle: `${inactiveRate}% of total`,
      progressPct: inactiveRate,
      progressColor: "bg-rose-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <StatCard key={card.key} {...card} />
      ))}
    </div>
  );
};

export default StudentStats;
