import React, { memo } from "react";
import { Activity } from "lucide-react";
import { QuickAction } from "./QuickAction";
import { QUICK_ACTIONS, DEFAULT_ACTIONS } from "../../constants/dashboard/constants";

export const QuickActionsGrid = memo(({ roleKey }) => {
  const quickActions = QUICK_ACTIONS[roleKey] || DEFAULT_ACTIONS;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Activity size={20} className="text-[#00A3AD]" />
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {quickActions.map((action) => (
          <QuickAction key={action.label} {...action} />
        ))}
      </div>
    </div>
  );
});

QuickActionsGrid.displayName = "QuickActionsGrid";