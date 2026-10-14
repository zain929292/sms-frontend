
import React from "react";
import { GraduationCap } from "lucide-react";

export const SidebarBrand = ({ isCollapsed }) => (
  <div className="flex items-center px-4 h-20 shrink-0 border-b border-white/10">
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 flex items-center justify-center rounded-full"
        style={{ backgroundColor: "#00a8b5" }}
      >
        <GraduationCap size={22} className="text-white" />
      </div>
      {!isCollapsed && (
        <div className="flex flex-col truncate">
          <span className="font-bold text-base text-white">EduCore SMS</span>
          <span className="text-xs text-slate-400">School Admin</span>
        </div>
      )}
    </div>
  </div>
);