
import {
  Receipt,
  CheckCircle,
  XCircle,
} from "lucide-react";

import StatCard from "../../utils/cards/Stat.card.util";

const FeeStructureStats = ({ stats = {} }) => {
  const {
    total = 0,
    active = 0,
    inactive = 0,
  } = stats;

  const cards = [
    {
      key: "total",
      title: "Total Fee Structures",
      value: total,
      icon: Receipt,
      color: "teal",
      subtitle: "All fee structures",
    },
    {
      key: "active",
      title: "Active Fees",
      value: active,
      icon: CheckCircle,
      color: "emerald",
      subtitle: "Currently active",
    },
    {
      key: "inactive",
      title: "Inactive Fees",
      value: inactive,
      icon: XCircle,
      color: "rose",
      subtitle: "Currently inactive",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {cards.map((card) => (
        <StatCard key={card.key} {...card} />
      ))}
    </div>
  );
};

export default FeeStructureStats;
