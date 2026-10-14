import React from "react";
import { StatCard } from "./StatCard";

export const StatsGridSection = ({ stats = [] }) => {
  if (!stats || stats.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <StatCard
          key={s.key}
          label={s.label}
          value={s.value}
          Icon={s.Icon}
          tone={s.tone}
          to={s.to}
          linkLabel={s.linkLabel}
          progress={s.progress}
          loading={false}
        />
      ))}
    </div>
  );
};

export default StatsGridSection;