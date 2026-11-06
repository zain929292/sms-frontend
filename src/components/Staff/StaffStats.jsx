import {
  Users,
  BriefcaseBusiness,
  GraduationCap,
  Award,
  FileCheck,
} from "lucide-react";

import StatCard from "../../utils/cards/Stat.card.util";

const StaffStats = ({ stats = {} }) => {
  const {
    total_users = 0,
    total_teachers = 0,
    qualified_teachers = 0,
    contract_teachers = 0,
    permanent_teachers = 0,
  } = stats;

  const qualifiedRate = total_teachers
    ? Math.round((qualified_teachers / total_teachers) * 100)
    : 0;

  const permanentRate = total_teachers
    ? Math.round((permanent_teachers / total_teachers) * 100)
    : 0;

  const cards = [
    {
      key: "total_users",
      title: "Total Users",
      value: total_users,
      icon: Users,
      color: "teal",
      subtitle: "All registered users",
    },
    {
      key: "total_teachers",
      title: "Total Teachers",
      value: total_teachers,
      icon: GraduationCap,
      color: "blue",
      subtitle: "Teaching staff",
    },
    {
      key: "qualified_teachers",
      title: "Qualified Teachers",
      value: qualified_teachers,
      icon: Award,
      color: "violet",
      subtitle: `${qualifiedRate}% of teachers`,
      progressPct: qualifiedRate,
      progressColor: "bg-violet-500",
    },
    {
      key: "permanent_teachers",
      title: "Permanent Teachers",
      value: permanent_teachers,
      icon: BriefcaseBusiness,
      color: "emerald",
      subtitle: `${permanentRate}% of teachers`,
      progressPct: permanentRate,
      progressColor: "bg-rose-500",
    },
    {
      key: "contract_teachers",
      title: "Contract Teachers",
      value: contract_teachers,
      icon: FileCheck,
      color: "rose",
      subtitle: "Contract employees",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => (
        <StatCard key={card.key} {...card} />
      ))}
    </div>
  );
};

export default StaffStats;