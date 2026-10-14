import React, { memo, useState } from "react";
import { SidebarBrand } from "../components/Sidebar/SidebarBrand";
import { SidebarFooter } from "../components/Sidebar/SidebarFooter";
import { SidebarNav } from "../components/Sidebar/SidebarNav";
import { SidebarMobile } from "../components/Sidebar/SidebarMobile";

const Sidebar = ({ isOpen, onClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col h-screen sticky top-0 select-none shrink-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-64"
        }`}
        style={{
          backgroundColor: "var(--primary)",
          borderRight: "1px solid rgba(255, 255, 255, 0.05)",
        }}
      >
        <SidebarBrand isCollapsed={isCollapsed} />

        <div className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <SidebarNav collapsed={isCollapsed} />
        </div>

        <SidebarFooter
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        />
      </aside>

      {/* Mobile Sidebar */}
      <SidebarMobile isOpen={isOpen} onClose={onClose} />
    </>
  );
};

export default memo(Sidebar);