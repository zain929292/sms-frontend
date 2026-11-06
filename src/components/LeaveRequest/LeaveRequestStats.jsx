import {
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

import StatCard from "../../utils/cards/Stat.card.util";

const LeaveRequestStats = ({ stats = {} }) => {
  const total = Number(stats.total ?? 0);
  const pending = Number(stats.pending ?? 0);
  const approved = Number(stats.approved ?? 0);
  const rejected = Number(stats.rejected ?? 0);

  const pendingRate = total
    ? Math.round((pending / total) * 100)
    : 0;

  const approvedRate = total
    ? Math.round((approved / total) * 100)
    : 0;

  const rejectedRate = total
    ? Math.round((rejected / total) * 100)
    : 0;

  const cards = [
    {
      key: "total",
      title: "Total Requests",
      value: total,
      icon: ClipboardList,
      color: "teal",
      subtitle: "All leave requests",
    },
    {
      key: "pending",
      title: "Pending Requests",
      value: pending,
      icon: Clock,
      color: "amber",
      subtitle: `${pendingRate}% of total`,
      progressPct: pendingRate,
      progressColor: "bg-amber-500",
    },
    {
      key: "approved",
      title: "Approved Requests",
      value: approved,
      icon: CheckCircle,
      color: "emerald",
      subtitle: `${approvedRate}% of total`,
      progressPct: approvedRate,
      progressColor: "bg-emerald-500",
    },
    {
      key: "rejected",
      title: "Rejected Requests",
      value: rejected,
      icon: XCircle,
      color: "rose",
      subtitle: `${rejectedRate}% of total`,
      progressPct: rejectedRate,
      progressColor: "bg-rose-500",
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

export default LeaveRequestStats;