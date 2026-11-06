
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import StatCard from "../../utils/cards/Stat.card.util";

const AcademicSessionsStats = ({
  sessions = [],
  activeCount = 0,
  currentSession,
}) => {
  const statCards = [
    {
      key: "total",
      title: "Total Sessions",
      value: sessions.length,
      icon: CalendarDays,
      color: "teal",
      subtitle: "All academic sessions",
    },
    {
      key: "active",
      title: "Active Sessions",
      value: activeCount,
      icon: CheckCircle2,
      color: "emerald",
      subtitle: "Currently enabled",
      progressPct: sessions.length
        ? Math.round((activeCount / sessions.length) * 100)
        : 0,
      progressColor: "bg-emerald-500",
    },
    {
      key: "current-session",
      title: "Current Session",
      value:
        currentSession?.name ||
        currentSession?.session_name ||
        "No Active Session",
      icon: Clock3,
      color: "teal",
      subtitle: currentSession
        ? "Currently active session"
        : "No active session available",
    },
  ];

  return (
    <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {statCards.map((card) => (
        <div
          key={card.key}
          className="min-w-0 [&>*]:h-full"
        >
          <StatCard {...card} />
        </div>
      ))}
    </div>
  );
};

export default AcademicSessionsStats;
