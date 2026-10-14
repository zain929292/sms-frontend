import React, { memo } from "react";
import { Link } from "react-router-dom";

export const QuickAction = memo(({ label, Icon, color, to }) => (
  <Link
    to={to}
    className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 transition-colors group"
  >
    <div
      className={`w-12 h-12 rounded-xl ${color} text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
    >
      <Icon size={22} />
    </div>
    <span className="text-xs font-semibold text-slate-700 text-center">
      {label}
    </span>
  </Link>
));
QuickAction.displayName = "QuickAction";