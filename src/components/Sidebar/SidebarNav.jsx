import React, { memo } from "react";
import SidebarGroup from "./SidebarNavComponents/SidebarGroup";
import { useRolePermissions } from "../../hook/Role&Permissions/useRolePermission";
import { formatSidebarGroups } from "./SidebarNavComponents/SidebarData";

export const SidebarNav = memo(
  ({ collapsed, onNavigate }) => {
    const { modules, loading } = useRolePermissions();

    const groups = formatSidebarGroups(modules);

    if (loading && !modules.length) {
      return (
        <nav className="px-3 py-4">
          <p className="text-sm text-gray-400">Loading menu...</p>
        </nav>
      );
    }

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