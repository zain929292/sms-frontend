
import {
  Users,
  UserCheck,
  UserCog,
  ShieldCheck,
} from "lucide-react";

import StatCard from "../../utils/cards/Stat.card.util";

const UsersSummaryCards = ({ stats = {} }) => {
  const cards = [
    {
      key: "total_users",
      title: "Total Users",
      value: Number(stats.total_users ?? 0),
      icon: Users,
      color: "teal",
      subtitle: "All registered users",
    },
    {
      key: "total_teachers",
      title: "Total Teachers",
      value: Number(stats.total_teachers ?? 0),
      icon: UserCheck,
      color: "blue",
      subtitle: "Registered teachers",
    },
    {
      key: "other_staff",
      title: "Other Staff",
      value: Number(stats.other_staff ?? 0),
      icon: UserCog,
      color: "emerald",
      subtitle: "Non-teaching staff",
    },
    {
      key: "permanent_teachers",
      title: "Permanent Teachers",
      value: Number(stats.permanent_teachers ?? 0),
      icon: ShieldCheck,
      color: "amber",
      subtitle: "Permanent employees",
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

export default UsersSummaryCards;
