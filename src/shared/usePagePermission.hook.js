/**
 * @file usePagePermissions.js
 * @description Shared permission hooks. Matches by role_name (primary) or
 * role_id (fallback), whichever is available in the auth slice.
 */

import { useMemo } from "react";
import { useSelector } from "react-redux";

const lc = (v) => String(v || "").toLowerCase();
const isActive = (v) => lc(v) === "active";

/* Read the current user's role in every shape your auth slice might use */
const useCurrentRole = () =>
  useSelector((s) => {
    const u = s.auth?.user;
    return {
      name: lc(u?.role ?? u?.role_name ?? u?.role?.name ?? ""),
      id: u?.role_id ?? u?.role?.id ?? null,
    };
  });

/* --------------------------- Single-page hook ---------------------------- */

export const usePagePermissions = (pageName, moduleName) => {
  const rows = useSelector((s) => s.rolePermissions?.rolePermissions || []);
  const ready = useSelector((s) => Boolean(s.rolePermissions?.lastFetchedAt));
  const role = useCurrentRole();

  const permissions = useMemo(() => {
    if (!ready) return null;
    if (!role.name && role.id == null) return null;

    const p = lc(pageName);
    const m = lc(moduleName);
    const granted = new Set();

    for (const row of rows) {
      // Match by role_name if we have it, else by role_id
      if (role.name) {
        if (lc(row.role_name) !== role.name) continue;
      } else if (role.id != null) {
        if (Number(row.role_id) !== Number(role.id)) continue;
      } else {
        continue;
      }

      if (!isActive(row.module_status)) continue;
      if (!isActive(row.page_status)) continue;
      if (lc(row.page_name) !== p) continue;
      if (lc(row.module_name) !== m) continue;
      if (row.permission_name) granted.add(lc(row.permission_name));
    }
    return granted;
  }, [rows, ready, role.name, role.id, pageName, moduleName]);

  const can = useMemo(
    () => (permissions == null ? () => false : (n) => permissions.has(lc(n))),
    [permissions],
  );

  return { permissions, ready, can };
};

/* --------------------------- Whole-role hook ----------------------------- */

export const useRolePermissions = () => {
  const rows = useSelector((s) => s.rolePermissions?.rolePermissions || []);
  const ready = useSelector((s) => Boolean(s.rolePermissions?.lastFetchedAt));
  const role = useCurrentRole();

  const granted = useMemo(() => {
    if (!ready) return null;
    if (!role.name && role.id == null) return null;

    // Map<"moduleLower::pageLower", Set<permLower>>
    const map = new Map();
    for (const row of rows) {
      if (role.name) {
        if (lc(row.role_name) !== role.name) continue;
      } else if (role.id != null) {
        if (Number(row.role_id) !== Number(role.id)) continue;
      } else {
        continue;
      }

      if (!isActive(row.module_status)) continue;
      if (!isActive(row.page_status)) continue;

      const key = `${lc(row.module_name)}::${lc(row.page_name)}`;
      let set = map.get(key);
      if (!set) {
        set = new Set();
        map.set(key, set);
      }
      if (row.permission_name) set.add(lc(row.permission_name));
    }
    return map;
  }, [rows, ready, role.name, role.id]);

  return { granted, ready, role };
};
