import React from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

export const SidebarFooter = ({ isCollapsed, onToggleCollapse }) => (
  <div className="p-3 border-t border-white/5">
    <button
      onClick={onToggleCollapse}
      className="w-full flex items-center justify-center py-2.5 rounded-xl hover:bg-slate-800/40 text-slate-400 hover:text-white transition-all"
    >
      {isCollapsed ? (
        <PanelLeftOpen size={20} />
      ) : (
        <div className="flex items-center gap-3 w-full px-3">
          <PanelLeftClose size={20} />
          <span className="text-sm">Collapse</span>
        </div>
      )}
    </button>
  </div>
);