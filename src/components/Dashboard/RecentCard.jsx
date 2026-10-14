import React, { memo } from "react";
import { Link } from "react-router-dom";
import { RecentActivitySection } from "./RecentActivitySection";

export const RecentCard = memo(
  ({
    title,
    Icon,
    iconClass,
    linkClass,
    to,
    rows,
    emptyText,
    avatarClass,
    loading,
  }) => (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Icon size={20} className={iconClass} />
          {title}
        </h2>
        <Link to={to} className={`text-xs font-semibold ${linkClass}`}>
          View All
        </Link>
      </div>

      <div className="space-y-3">
        {loading ? (
          [0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-slate-100 animate-pulse"
            />
          ))
        ) : rows.length > 0 ? (
          rows.map((row) => (
            <RecentActivitySection
              key={row.id}
              name={row.name}
              sub={row.sub}
              status={row.status}
              badge={row.badge}
              avatarClass={avatarClass}
            />
          ))
        ) : (
          <p className="text-xs text-slate-400 py-4 text-center">{emptyText}</p>
        )}
      </div>
    </div>
  )
);
RecentCard.displayName = "RecentCard";