
import React, { memo } from "react";
import { NavLink } from "react-router-dom";
import { FileText } from "lucide-react";

const SidebarItem = memo(({ item, collapsed, onNavigate }) => {
  const Icon = item.icon || menuIcons[item.label] || FileText;

  return (
    <NavLink
      to={item.to}
      end
      onClick={onNavigate}
      className={({ isActive: a }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors ${
          collapsed ? "justify-center px-0" : ""
        } ${
          a
            ? "bg-[var(--secondary)] text-white"
            : "text-[rgba(255,255,255,0.75)] hover:bg-slate-800/60"
        }`
      }
    >
      {({ isActive: a }) => (
        <>
          <Icon
            size={20}
            className="shrink-0"
            style={{ color: a ? "var(--tertiary)" : "var(--gray)" }}
          />

          {!collapsed && (
            <span className="truncate capitalize">
              {item.label.replace(/_/g, " ")}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
});

export default SidebarItem;
