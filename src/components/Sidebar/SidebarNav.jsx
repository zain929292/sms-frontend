
import React, { memo } from "react";
import SidebarGroup from "./SidebarNavComponents/sidebarGroup";
import { STATIC_GROUPS } from "./SidebarNavComponents/sidebarData";

export const SidebarNav = memo(
  ({ groups = STATIC_GROUPS, collapsed, onNavigate }) => {
    return (
      <nav className="px-3 py-4 space-y-6">
        {groups.map((group) => (
          <SidebarGroup
            key={group.moduleName}
            group={group}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
    );
  }
);

