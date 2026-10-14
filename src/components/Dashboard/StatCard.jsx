import React, { memo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { TONES } from "../../constants/dashboard/constants";

export const StatCard = memo(
  ({
    label,
    value,
    Icon,
    tone,
    to,
    linkLabel = "View All",
    loading,
    progress,
  }) => {
    const t = TONES[tone];
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {label}
            </p>
            {loading ? (
              <div className="h-9 w-16 mt-2 rounded-lg bg-slate-100 animate-pulse" />
            ) : (
              <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
            )}
          </div>
          <div
            className={`w-12 h-12 rounded-xl ${t.bg} flex items-center justify-center`}
          >
            <Icon size={24} className={t.icon} />
          </div>
        </div>

        {progress !== undefined && !loading && (
          <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <Link
          to={to}
          className={`${
            progress !== undefined ? "mt-3" : "mt-4"
          } inline-flex text-xs font-semibold items-center gap-1 ${t.link}`}
        >
          {linkLabel} <ArrowUpRight size={14} />
        </Link>
      </div>
    );
  }
);
StatCard.displayName = "StatCard";