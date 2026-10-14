import React from "react";
import { GraduationCap, X } from "lucide-react";
import { SidebarNav } from "./SidebarNav";

export const SidebarMobile = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      <div onClick={onClose} className="fixed inset-0 bg-black/60" />
      <aside className="relative w-72 h-full bg-[#0b1329] text-white flex flex-col">
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 flex items-center justify-center rounded-full"
              style={{ backgroundColor: "#00a8b5" }}
            >
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="font-bold">EduCore SMS</span>
          </div>
          <button onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          <SidebarNav collapsed={false} onNavigate={onClose} />
        </div>
      </aside>
    </div>
  );
};