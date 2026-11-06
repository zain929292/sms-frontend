
import {
  Users,
  UserCheck,
  UserX,
  Clock,
} from "lucide-react";

import StatCard from "../../utils/cards/Stat.card.util";

const StaffAttendanceStats = ({ stats = {} }) => {
  const total = Number(stats.total ?? 0);
  const present = Number(stats.present ?? 0);
  const absent = Number(stats.absent ?? 0);
  const late = Number(stats.late ?? 0);

  const presentRate = total
    ? Math.round((present / total) * 100)
    : 0;

  const absentRate = total
    ? Math.round((absent / total) * 100)
    : 0;

  const lateRate = total
    ? Math.round((late / total) * 100)
    : 0;

  const cards = [
    {
      key: "total",
      title: "Total Staff",
      value: total,
      icon: Users,
      color: "teal",
      subtitle: "All staff records",
    },
    {
      key: "present",
      title: "Present Staff",
      value: present,
      icon: UserCheck,
      color: "emerald",
      subtitle: `${presentRate}% of total`,
      progressPct: presentRate,
      progressColor: "bg-emerald-500",
    },
    {
      key: "absent",
      title: "Absent Staff",
      value: absent,
      icon: UserX,
      color: "rose",
      subtitle: `${absentRate}% of total`,
      progressPct: absentRate,
      progressColor: "bg-rose-500",
    },
    {
      key: "late",
      title: "Late Staff",
      value: late,
      icon: Clock,
      color: "amber",
      subtitle: `${lateRate}% of total`,
      progressPct: lateRate,
      progressColor: "bg-amber-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.key} {...card} />
      ))}
    </div>
  );
};

export default StaffAttendanceStats;
