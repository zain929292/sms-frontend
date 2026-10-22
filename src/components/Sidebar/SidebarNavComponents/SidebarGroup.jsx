
import React, { memo } from "react";
import SidebarItem from "./SideItem";

const SidebarGroup = memo(({ group, collapsed, onNavigate }) => {
  return (
    <div className="space-y-1">
      {!collapsed && (
        <h3
          className="px-3 text-[11px] font-bold uppercase tracking-wider mb-2 opacity-70"
          style={{ color: "var(--gray)" }}
        >
          {group.moduleName}
        </h3>
      )}

      <div className="space-y-1">
        {group.items.map((item) => (
          <SidebarItem
            key={item.to}
            item={item}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  );
});

export default SidebarGroup;
