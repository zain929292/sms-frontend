
import {
  Bell,
  CheckCircle2,
  FileEdit,
} from "lucide-react";

import StatCard from "../../utils/cards/Stat.card.util";

const AnnouncementsStats = ({
  announcements = [],
  publishedCount = 0,
  draftCount = 0,
}) => {
  const statCards = [
    {
      key: "total",
      title: "Total Announcements",
      value: announcements.length,
      icon: Bell,
      color: "teal",
      subtitle: "All school announcements",
    },
    {
      key: "published",
      title: "Published Announcements",
      value: publishedCount,
      icon: CheckCircle2,
      color: "emerald",
      subtitle: "Currently published",
      progressPct: announcements.length
        ? Math.round((publishedCount / announcements.length) * 100)
        : 0,
      progressColor: "bg-emerald-500",
    },
    {
      key: "draft",
      title: "Draft Announcements",
      value: draftCount,
      icon: FileEdit,
      color: "amber",
      subtitle: "Waiting to be published",
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

export default AnnouncementsStats;
