import { BookOpen, CheckCircle2 } from "lucide-react";
import StatCard from "../../utils/cards/Stat.card.util";

const ClassesStats = ({ totalCount = 0, activeCount = 0 }) => {
  const cards = [
    { key: "total", title: "Total Classes", value: totalCount, icon: BookOpen, color: "teal", subtitle: "All class records" },
    { key: "active", title: "Active Classes", value: activeCount, icon: CheckCircle2, color: "emerald", subtitle: "Currently enabled" },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {cards.map((card) => (
        <div key={card.key} className="min-w-0 [&>*]:h-full">
          <StatCard {...card} />
        </div>
      ))}
    </div>
  );
};

export default ClassesStats;
