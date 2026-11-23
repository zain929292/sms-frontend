import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  memo,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import premiumToast from "../../utils/toast/Toast.util";
import { fetchRoles } from "../../redux/slices/Roles.slice.redux";
import {
  fetchModules,
  fetchPages,
} from "../../redux/slices/Modules_Pages.slice.redux";
import { fetchPermissions } from "../../redux/slices/Permissions.slice.redux";
import {
  createRolePermission,
  updateRolePermission,
  fetchRolePermissions,
} from "../../redux/slices/Role_Has_Permissions.slice.redux";
import StatCard from "../../utils/cards/Stat.card.util";
import {
  Boxes,
  ChevronDown,
  X,
  CheckCircle2,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ShieldCheck,
  MinusCircle,
  CheckSquare,
  Loader2,
  Layers,
  ListChecks,
} from "lucide-react";

/* ------------------------------- Constants ------------------------------- */

const EMPTY = [];
const EMPTY_OBJ = Object.freeze({});
const PERM_ICONS = { create: Plus, view: Eye, update: Pencil, delete: Trash2 };
const SAVE_CONCURRENCY = 6;
const BASE_TTL = 5 * 60 * 1000;
let lastBaseLoadAt = Date.now();

const stop = (e) => e.stopPropagation();

/* ------------------------------- Selectors ------------------------------- */

const selectRoles = (s) => {
  const r = s.roles;
  return Array.isArray(r) ? r : r?.roles || r?.data || EMPTY;
};
const selectModules = (s) => s.modules?.modules || EMPTY;
const selectPages = (s) => s.modules?.pages || EMPTY;
const selectModulesLoading = (s) => s.modules?.loading ?? false;
const selectGlobalPerms = (s) => s.permissions?.permissions || EMPTY;
const selectRolePerms = (s) => s.rolePermissions?.rolePermissions || EMPTY;
const selectRolePermsReady = (s) => Boolean(s.rolePermissions?.lastFetchedAt);
const selectRolePermsError = (s) => s.rolePermissions?.error ?? null;

/* -------------------------- State-builder helpers ------------------------ */

const buildEmptyState = (modules, pagesByModule, permIds) => {
  const out = {};
  for (const mod of modules) {
    const pages = {};
    for (const page of pagesByModule.get(Number(mod.id)) || EMPTY) {
      const perms = {};
      for (const pid of permIds) perms[pid] = false;
      pages[page.id] = { enabled: false, permissions: perms };
    }
    out[mod.id] = { enabled: false, pages };
  }
  return out;
};

const buildRoleState = (
  modules,
  pagesByModule,
  permIds,
  assigned,
  pageToModule,
) => {
  const state = buildEmptyState(modules, pagesByModule, permIds);
  const snapshot = {};

  for (const item of assigned) {
    const pId = Number(item.page_id);
    const permId = item.permission_id != null ? Number(item.permission_id) : null;
    const mId = pageToModule.get(pId);
    const pageActive = (item.page_status || "").toLowerCase() === "active";
    const modActive = (item.module_status || "").toLowerCase() === "active";

    if (!snapshot[pId]) snapshot[pId] = { enabled: pageActive, permIds: new Set() };
    else if (pageActive) snapshot[pId].enabled = true;
    if (permId != null) snapshot[pId].permIds.add(permId);

    if (mId == null || !state[mId]) continue;
    const pg = state[mId].pages[pId];
    if (!pg) continue;
    pg.enabled = pageActive;
    if (permId != null) pg.permissions[permId] = pageActive;
    if (modActive) state[mId].enabled = true;
  }
  return { state, snapshot };
};

const sameSet = (ids, set) => {
  if (ids.length !== set.size) return false;
  for (const id of ids) if (!set.has(id)) return false;
  return true;
};

const buildSavePlan = (modules, pagesByModule, states, snapshot) => {
  const jobs = [];
  for (const mod of modules) {
    const modState = states[mod.id];
    const modEnabled = !!modState?.enabled;
    const moduleStatus = modEnabled ? "active" : "inactive";

    for (const page of pagesByModule.get(Number(mod.id)) || EMPTY) {
      const ps = modState?.pages?.[page.id];
      const pageEnabled = modEnabled && !!ps?.enabled;
      const pageStatus = pageEnabled ? "active" : "inactive";
      const permissionIds = [];
      if (pageEnabled && ps.permissions) {
        for (const k in ps.permissions) if (ps.permissions[k]) permissionIds.push(Number(k));
      }

      const base = {
        modId: mod.id,
        pageId: page.id,
        moduleStatus,
        pageStatus,
        pageEnabled,
        permissionIds,
      };
      const existing = snapshot[page.id];

      if (!existing) {
        if (permissionIds.length > 0) jobs.push({ ...base, kind: "create", alsoUpdateStatus: false });
        continue;
      }
      const statusChanged = pageEnabled !== existing.enabled;
      const samePerms = sameSet(permissionIds, existing.permIds);
      if (samePerms && !statusChanged) continue;

      if (!samePerms && permissionIds.length > 0) {
        jobs.push({ ...base, kind: "create", alsoUpdateStatus: statusChanged });
      } else if (statusChanged || existing.enabled) {
        jobs.push({ ...base, kind: "update", alsoUpdateStatus: false });
      }
    }
  }
  return jobs;
};

const runSaveJob = async (dispatch, roleId, job) => {
  const data = {
    module_id: job.modId,
    page_id: job.pageId,
    module_status: job.moduleStatus,
    page_status: job.pageStatus,
    permission_ids: job.permissionIds,
  };
  try {
    if (job.kind === "create") {
      await dispatch(
        createRolePermission({
          role_id: roleId,
          module_id: job.modId,
          page_id: job.pageId,
          permission_ids: job.permissionIds,
        }),
      ).unwrap();
      if (job.alsoUpdateStatus)
        await dispatch(updateRolePermission({ roleId, data })).unwrap();
    } else {
      await dispatch(updateRolePermission({ roleId, data })).unwrap();
    }
    return true;
  } catch {
    return false;
  }
};

const runPool = async (items, limit, worker) => {
  const results = new Array(items.length);
  let next = 0;
  const runner = async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, runner));
  return results;
};

/* ----------------------------- Sub-components ---------------------------- */

const PermissionChip = memo(({ perm, active, disabled, onToggle }) => {
  const Icon = PERM_ICONS[perm.name?.toLowerCase()] || Plus;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onToggle(perm)}
      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${active
        ? "bg-gradient-to-r from-[#0b1329] to-[#152243] text-white shadow-[0_3px_10px_rgba(11,19,41,0.3)]"
        : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"
        }`}
    >
      <Icon size={13} />
      {perm.name}
    </button>
  );
});
PermissionChip.displayName = "PermissionChip";

const PageRow = memo(
  ({ modId, page, pageState, globalPermissions, moduleEnabled, onTogglePerm, onToggleAll, onTogglePage }) => {
    const pageEnabled = !!pageState?.enabled;
    const permissions = pageState?.permissions || EMPTY_OBJ;

    const activeCount = useMemo(() => {
      let n = 0;
      for (const k in permissions) if (permissions[k]) n++;
      return n;
    }, [permissions]);

    const allSelected =
      globalPermissions.length > 0 && globalPermissions.every((p) => permissions[p.id]);
    const chipsDisabled = !moduleEnabled || !pageEnabled;

    const handleChip = useCallback((perm) => onTogglePerm(modId, page, perm), [onTogglePerm, modId, page]);
    const handleAll = useCallback(() => onToggleAll(modId, page), [onToggleAll, modId, page]);
    const handlePage = useCallback(() => onTogglePage(modId, page), [onTogglePage, modId, page]);

    return (
      <div
        className={`border rounded-xl p-4 transition-shadow space-y-3 ${pageEnabled
          ? "bg-white border-[#eef2f2] shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(15,118,110,0.08)]"
          : "bg-slate-50 border-[#e5e9ec] opacity-75"
          }`}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h4 className="font-semibold text-sm text-[#0b1329] truncate">{page.name}</h4>
            <p className="text-xs text-[#94a3b8]">
              {pageEnabled
                ? `${activeCount}/${globalPermissions.length || 4} permissions selected`
                : "Page disabled for this role"}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleAll}
              disabled={chipsDisabled}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#dde0e5] text-[#334155] bg-white hover:bg-[#f1f5f9] hover:border-[#14b8a6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {allSelected ? <MinusCircle size={13} /> : <CheckSquare size={13} />}
              All
            </button>

            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold ${pageEnabled ? "text-[#0f766e]" : "text-[#94a3b8]"}`}>
                {pageEnabled ? "On" : "Off"}
              </span>
              <button
                type="button"
                disabled={!moduleEnabled}
                onClick={handlePage}
                title={moduleEnabled ? `Turn page ${pageEnabled ? "off" : "on"} for this role` : "Enable the module first"}
                className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${pageEnabled ? "bg-[#0f766e]" : "bg-[#dde0e5]"
                  }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${pageEnabled ? "translate-x-4" : "translate-x-0"
                    }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {globalPermissions.length > 0 ? (
            globalPermissions.map((perm) => (
              <PermissionChip
                key={perm.id}
                perm={perm}
                active={!!permissions[perm.id]}
                disabled={chipsDisabled}
                onToggle={handleChip}
              />
            ))
          ) : (
            <span className="text-xs text-[#94a3b8]">No permissions configured.</span>
          )}
        </div>
      </div>
    );
  },
);
PageRow.displayName = "PageRow";

const ModuleCard = memo(
  ({
    mod,
    modPages,
    moduleState,
    expanded,
    globalPermissions,
    totalSelectedPerms,
    allModuleSelected,
    onToggleExpand,
    onToggleModule,
    onToggleAllModule,
    onToggleAllPage,
    onTogglePerm,
    onTogglePageStatus,
  }) => {
    const isEnabled = !!moduleState?.enabled;
    const hasOpened = useRef(expanded);
    if (expanded) hasOpened.current = true;

    const handleExpand = useCallback(() => onToggleExpand(mod.id), [onToggleExpand, mod.id]);

    return (
      <div
        className={`relative z-0 bg-white rounded-2xl border transition-colors duration-300 overflow-hidden ${isEnabled
          ? "border-[#0f766e]/15 shadow-[0_10px_35px_rgba(15,118,110,0.14)]"
          : "border-[#e5e9ec] shadow-[0_4px_14px_rgba(0,0,0,0.04)] opacity-[0.85]"
          }`}
      >
        <div
          onClick={handleExpand}
          className="flex items-center justify-between flex-wrap gap-4 p-5 cursor-pointer select-none"
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl transition-colors ${isEnabled
                ? "bg-gradient-to-br from-[#0f766e] to-[#14b8a6] text-white shadow-[0_6px_16px_rgba(15,118,110,0.35)]"
                : "bg-[#f1f5f9] text-[#94a3b8]"
                }`}
            >
              <Boxes size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-[#0b1329] text-base">{mod.name}</h3>
                {isEnabled ? (
                  <span className="inline-flex items-center gap-1 bg-[#0f766e]/10 text-[#0f766e] text-xs font-semibold px-2.5 py-0.5 rounded-full border border-[#0f766e]/20">
                    <CheckCircle2 size={12} /> Enabled
                  </span>
                ) : (
                  <span className="inline-flex items-center bg-[#f1f5f9] text-[#64748b] text-xs font-semibold px-2.5 py-0.5 rounded-full border border-[#dde0e5]">
                    Disabled
                  </span>
                )}
                {isEnabled && modPages.length > 0 && (
                  <span className="bg-[#14b8a6]/10 text-[#0d9488] text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {totalSelectedPerms} selected
                  </span>
                )}
              </div>
              <p className="text-xs text-[#94a3b8] mt-0.5">
                {modPages.length} page{modPages.length !== 1 ? "s" : ""} · click to {expanded ? "collapse" : "expand"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3" onClick={stop}>
            <button
              type="button"
              onClick={() => onToggleAllModule(mod)}
              disabled={!isEnabled || modPages.length === 0}
              className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border border-[#dde0e5] text-[#334155] bg-white hover:bg-[#f8fafa] hover:border-[#14b8a6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {allModuleSelected ? <MinusCircle size={14} /> : <CheckSquare size={14} />}
              Select All
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#64748b]">{isEnabled ? "On" : "Off"}</span>
              <button
                type="button"
                onClick={() => onToggleModule(mod)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${isEnabled ? "bg-[#0b1329]" : "bg-[#dde0e5]"
                  }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${isEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                />
              </button>
            </div>

            <button
              type="button"
              onClick={handleExpand}
              className="p-1.5 rounded-lg hover:bg-[#f1f5f9] transition-colors cursor-pointer"
              aria-label={expanded ? "Collapse" : "Expand"}
            >
              <ChevronDown
                size={20}
                className={`text-[#94a3b8] transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        </div>

        <div
          className={`grid transition-all duration-300 ease-in-out ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
        >
          <div className="overflow-hidden">
            {hasOpened.current &&
              (modPages.length > 0 ? (
                <div className="mx-5 mb-5 bg-[#f8fafa] border border-[#eef2f2] rounded-2xl p-4 space-y-3">
                  {modPages.map((page) => (
                    <PageRow
                      key={page.id}
                      modId={mod.id}
                      page={page}
                      pageState={moduleState?.pages?.[page.id]}
                      globalPermissions={globalPermissions}
                      moduleEnabled={isEnabled}
                      onTogglePerm={onTogglePerm}
                      onToggleAll={onToggleAllPage}
                      onTogglePage={onTogglePageStatus}
                    />
                  ))}
                </div>
              ) : (
                <div className="mx-5 mb-5 bg-[#f8fafa] border border-[#eef2f2] rounded-2xl px-5 py-4 text-center text-xs text-[#94a3b8]">
                  No pages configured under this module.
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  },
);
ModuleCard.displayName = "ModuleCard";

const ModuleSkeleton = () => (
  <div className="h-[88px] rounded-2xl bg-white border border-[#e5e9ec] animate-pulse" />
);

const RoleSelector = memo(({ roles, selectedRole, onSelect, onClear }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const toggleOpen = useCallback(() => setOpen((v) => !v), []);
  const handleClear = useCallback(
    (e) => {
      e.stopPropagation();
      onClear();
    },
    [onClear],
  );

  return (
    <div className="space-y-2 w-full md:max-w-md">
      <label className="block text-xs font-bold uppercase tracking-wider text-[#0f766e]">
        Select Role
      </label>
      <div className="relative" ref={ref}>
        <div
          onClick={toggleOpen}
          className="flex items-center justify-between w-full border border-[#dde0e5] rounded-xl px-4 py-2.5 bg-white text-[#0b1329] cursor-pointer shadow-sm hover:border-[#14b8a6] hover:shadow-[0_0_0_3px_rgba(20,184,166,0.1)] transition-colors"
        >
          <span className="font-medium">{selectedRole ? selectedRole.name : "Select a Role..."}</span>
          <div className="flex items-center gap-2 text-[#94a3b8]">
            {selectedRole && (
              <X size={16} className="hover:text-[#f00221] cursor-pointer transition-colors" onClick={handleClear} />
            )}
            <span className="text-[#dde0e5]">|</span>
            <ChevronDown size={18} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </div>
        </div>

        {open && (
          <div className="absolute z-50 w-full mt-1.5 bg-white border border-[#dde0e5] rounded-xl shadow-[0_15px_40px_rgba(15,118,110,0.2)] max-h-60 overflow-y-auto">
            {roles.length > 0 ? (
              roles.map((r) => (
                <div
                  key={r.id || r._id}
                  onClick={() => {
                    onSelect(r);
                    setOpen(false);
                  }}
                  className="px-4 py-2.5 text-sm hover:bg-[#0f766e]/5 cursor-pointer text-[#334155] font-medium transition-colors"
                >
                  {r.name}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-[#94a3b8] text-center">No roles found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
RoleSelector.displayName = "RoleSelector";

const PageHeader = memo(() => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div className="flex items-center gap-3">
      <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#0f766e] to-[#14b8a6] text-white shadow-[0_8px_20px_rgba(15,118,110,0.35)]">
        <ShieldCheck size={22} />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-[#0b1329] tracking-tight">Assign Permissions</h1>
        <p className="text-sm text-[#64748b]">Manage role access by selecting modules, pages, and permissions.</p>
      </div>
    </div>
  </div>
));
PageHeader.displayName = "PageHeader";

/* ----------------------------- Main component ---------------------------- */

const Permissions = () => {
  const dispatch = useDispatch();
  const roles = useSelector(selectRoles);
  const modules = useSelector(selectModules);
  const pages = useSelector(selectPages);
  const modulesLoading = useSelector(selectModulesLoading);
  const globalPermissions = useSelector(selectGlobalPerms);
  const rolePermissions = useSelector(selectRolePerms);
  const rolePermsReady = useSelector(selectRolePermsReady);
  const rolePermsError = useSelector(selectRolePermsError);

  const [selectedRole, setSelectedRole] = useState(null);
  const [moduleStates, setModuleStates] = useState(EMPTY_OBJ);
  const [expandedModules, setExpandedModules] = useState(EMPTY_OBJ);
  const [snapshot, setSnapshot] = useState(EMPTY_OBJ);
  const [saving, setSaving] = useState(false);

  const statesRef = useRef(moduleStates);
  statesRef.current = moduleStates;
  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;
  const dirtyRef = useRef(false);
  const lastRoleIdRef = useRef(null);

  const selectedRoleId = selectedRole ? Number(selectedRole.id) : null;

  /* ------------------------- Indexed lookups -------------------------- */

  const pagesByModule = useMemo(() => {
    const map = new Map();
    for (const p of pages) {
      const k = Number(p.module_id);
      const arr = map.get(k);
      if (arr) arr.push(p);
      else map.set(k, [p]);
    }
    return map;
  }, [pages]);

  const pageToModule = useMemo(() => {
    const map = new Map();
    for (const p of pages) map.set(Number(p.id), Number(p.module_id));
    return map;
  }, [pages]);

  const permissionIds = useMemo(() => globalPermissions.map((p) => p.id), [globalPermissions]);

  /* ------------------------------ Effects ----------------------------- */

  useEffect(() => {
    const stale = Date.now() - lastBaseLoadAt > BASE_TTL;
    if (stale) lastBaseLoadAt = Date.now();
    if (stale || roles.length === 0) dispatch(fetchRoles());
    if (stale || modules.length === 0) dispatch(fetchModules());
    if (stale || pages.length === 0) dispatch(fetchPages());
    if (stale || globalPermissions.length === 0) dispatch(fetchPermissions());
    dispatch(fetchRolePermissions());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    if (selectedRole || modules.length === 0) return;
    setModuleStates(buildEmptyState(modules, pagesByModule, permissionIds));
    setSnapshot(EMPTY_OBJ);
    dirtyRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modules, pagesByModule, permissionIds, selectedRole]);

  const assignedForRole = useMemo(() => {
    if (selectedRoleId == null) return EMPTY;
    return rolePermissions.filter((i) => Number(i.role_id) === selectedRoleId);
  }, [rolePermissions, selectedRoleId]);

  useEffect(() => {
    if (!selectedRole || !rolePermsReady || modules.length === 0 || pages.length === 0) return;
    const roleChanged = lastRoleIdRef.current !== selectedRole.id;
    if (!roleChanged && dirtyRef.current) return;

    const { state, snapshot: snap } = buildRoleState(
      modules,
      pagesByModule,
      permissionIds,
      assignedForRole,
      pageToModule,
    );
    setModuleStates(state);
    setSnapshot(snap);
    dirtyRef.current = false;

    if (roleChanged) {
      lastRoleIdRef.current = selectedRole.id;
      const autoExpand = {};
      for (const mod of modules) autoExpand[mod.id] = !!state[mod.id]?.enabled;
      setExpandedModules(autoExpand);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRole, rolePermsReady, assignedForRole, modules, pages]);

  /* --------------------------- Derived stats -------------------------- */

  const { moduleStats, overallStats } = useMemo(() => {
    const stats = {};
    let enabledModules = 0;
    let selectedPermissions = 0;
    let totalPossible = 0;

    for (const mod of modules) {
      const modPages = pagesByModule.get(Number(mod.id)) || EMPTY;
      const modState = moduleStates[mod.id];
      if (modState?.enabled) enabledModules++;

      let total = 0;
      let allSelected = modPages.length > 0;

      for (const page of modPages) {
        totalPossible += permissionIds.length;
        const ps = modState?.pages?.[page.id];
        if (!ps?.enabled) {
          allSelected = false;
          continue;
        }
        const perms = ps.permissions || EMPTY_OBJ;
        let pageSelected = 0;
        for (const pid of permissionIds) if (perms[pid]) pageSelected++;
        total += pageSelected;
        if (pageSelected !== permissionIds.length) allSelected = false;
      }
      selectedPermissions += total;
      stats[mod.id] = { total, allSelected };
    }

    const totalModules = modules.length;
    return {
      moduleStats: stats,
      overallStats: {
        totalModules,
        enabledModules,
        totalPages: pages.length,
        selectedPermissions,
        totalPossiblePermissions: totalPossible,
        enabledRate: totalModules ? Math.round((enabledModules / totalModules) * 100) : 0,
        assignmentRate: totalPossible ? Math.round((selectedPermissions / totalPossible) * 100) : 0,
      },
    };
  }, [modules, pages, pagesByModule, moduleStates, permissionIds]);

  /* ----------------------------- Handlers ----------------------------- */

  const handleSelectRole = useCallback((role) => setSelectedRole(role), []);
  const handleClearRole = useCallback(() => {
    lastRoleIdRef.current = null;
    setSelectedRole(null);
  }, []);

  const toggleExpand = useCallback(
    (id) => setExpandedModules((p) => ({ ...p, [id]: !p[id] })),
    [],
  );

  // Update one page's state immutably
  const updatePage = useCallback((modId, pageId, updater) => {
    setModuleStates((prev) => {
      const mod = prev[modId];
      const page = mod?.pages?.[pageId];
      if (!mod || !page) return prev;
      const next = updater(page);
      if (next === page) return prev;
      return {
        ...prev,
        [modId]: { ...mod, pages: { ...mod.pages, [pageId]: next } },
      };
    });
  }, []);

  const toggleModuleStatus = useCallback((mod) => {
    const nextStatus = !statesRef.current[mod.id]?.enabled;
    dirtyRef.current = true;
    setModuleStates((prev) => {
      const modState = prev[mod.id];
      const pagesState = modState?.pages || EMPTY_OBJ;
      const nextPages = {};
      for (const pid in pagesState) {
        const ps = pagesState[pid];
        nextPages[pid] = nextStatus || !ps.enabled ? ps : { ...ps, enabled: false };
      }
      return { ...prev, [mod.id]: { ...modState, enabled: nextStatus, pages: nextPages } };
    });
    if (nextStatus) setExpandedModules((p) => ({ ...p, [mod.id]: true }));
  }, []);

  const togglePageStatus = useCallback(
    (modId, page) => {
      const modState = statesRef.current[modId];
      const pageState = modState?.pages?.[page.id];
      if (!modState || !pageState) return;
      if (!modState.enabled && !pageState.enabled) return;
      dirtyRef.current = true;
      updatePage(modId, page.id, (p) => {
        const next = !p.enabled;
        return { ...p, enabled: next, permissions: next ? p.permissions : EMPTY_OBJ };
      });
    },
    [updatePage],
  );

  const togglePermission = useCallback(
    (modId, page, perm) => {
      dirtyRef.current = true;
      updatePage(modId, page.id, (p) => {
        if (!p.enabled) return p;
        const perms = p.permissions || EMPTY_OBJ;
        return { ...p, permissions: { ...perms, [perm.id]: !perms[perm.id] } };
      });
    },
    [updatePage],
  );

  const toggleAllPagePermissions = useCallback(
    (modId, page) => {
      const perms = statesRef.current[modId]?.pages?.[page.id]?.permissions || EMPTY_OBJ;
      let allOn = true;
      for (const pid of permissionIds) if (!perms[pid]) { allOn = false; break; }
      const next = !allOn;
      dirtyRef.current = true;
      updatePage(modId, page.id, (p) => {
        if (!p.enabled) return p;
        const nextPerms = {};
        for (const pid of permissionIds) nextPerms[pid] = next;
        return { ...p, permissions: nextPerms };
      });
    },
    [permissionIds, updatePage],
  );

  const toggleAllModulePermissions = useCallback(
    (mod) => {
      const modPages = pagesByModule.get(Number(mod.id)) || EMPTY;
      const modState = statesRef.current[mod.id];
      let allSelected = modPages.length > 0;
      for (const page of modPages) {
        const ps = modState?.pages?.[page.id];
        if (!ps?.enabled) { allSelected = false; break; }
        const perms = ps.permissions || EMPTY_OBJ;
        for (const pid of permissionIds) if (!perms[pid]) { allSelected = false; break; }
        if (!allSelected) break;
      }
      const next = !allSelected;
      dirtyRef.current = true;
      setModuleStates((prev) => {
        const base = prev[mod.id];
        const nextPages = { ...base.pages };
        for (const page of modPages) {
          const nextPerms = {};
          for (const pid of permissionIds) nextPerms[pid] = next;
          nextPages[page.id] = { enabled: next, permissions: nextPerms };
        }
        return { ...prev, [mod.id]: { ...base, pages: nextPages } };
      });
    },
    [pagesByModule, permissionIds],
  );

  const retryRolePermissions = useCallback(
    () => dispatch(fetchRolePermissions({ force: true })),
    [dispatch],
  );

  /* ---------------------------- Save flow ----------------------------- */

  const handleSavePermissions = useCallback(async () => {
    if (!selectedRole) {
      premiumToast.error("Select a role first", "Choose who you're assigning access to.");
      return;
    }
    const jobs = buildSavePlan(modules, pagesByModule, statesRef.current, snapshotRef.current);
    if (jobs.length === 0) {
      premiumToast.info("Nothing to save", "No changes were made.");
      return;
    }

    const roleId = Number(selectedRole.id);
    setSaving(true);

    try {
      const results = await runPool(jobs, SAVE_CONCURRENCY, (job) =>
        runSaveJob(dispatch, roleId, job),
      );

      let created = 0, updated = 0, failed = 0;
      const nextSnapshot = { ...snapshotRef.current };
      jobs.forEach((job, i) => {
        if (!results[i]) { failed++; return; }
        if (job.kind === "create" && !job.alsoUpdateStatus) created++;
        else updated++;
        nextSnapshot[job.pageId] = {
          enabled: job.pageEnabled,
          permIds: new Set(job.permissionIds),
        };
      });

      setSnapshot(nextSnapshot);
      if (failed === 0) dirtyRef.current = false;

      if (failed > 0) {
        premiumToast.error(
          "Some permissions failed",
          `${failed} of ${created + updated + failed} page(s) could not be saved.`,
        );
      } else {
        premiumToast.success(
          "Permissions saved!",
          `${created} created, ${updated} updated for "${selectedRole.name}"`,
        );
      }
      dispatch(fetchRolePermissions({ force: true, silent: true }));
    } catch {
      premiumToast.error("Save failed", "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  }, [selectedRole, modules, pagesByModule, dispatch]);

  /* ----------------------------- Stat cards ---------------------------- */

  const statCards = useMemo(
    () => [
      { key: "modules", title: "Total Modules", value: overallStats.totalModules, icon: Boxes, color: "teal", subtitle: `${overallStats.enabledModules} enabled` },
      { key: "enabled", title: "Enabled Modules", value: overallStats.enabledModules, icon: ShieldCheck, color: "emerald", subtitle: `${overallStats.enabledRate}% of total`, progressPct: overallStats.enabledRate, progressColor: "bg-emerald-500" },
      { key: "pages", title: "Total Pages", value: overallStats.totalPages, icon: Layers, color: "violet", subtitle: "Across all modules" },
      { key: "selected", title: "Selected Permissions", value: overallStats.selectedPermissions, icon: ListChecks, color: "blue", subtitle: `${overallStats.assignmentRate}% of ${overallStats.totalPossiblePermissions} possible`, progressPct: overallStats.assignmentRate, progressColor: "bg-blue-500" },
    ],
    [overallStats],
  );

  /* ------------------------------- Render ------------------------------ */

  const locked = Boolean(selectedRole) && !rolePermsReady;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f4f7f7] to-[#eef2f2]">
      <div className="max-w-8xl mx-auto space-y-5">
        <PageHeader />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ key, ...card }) => (
            <StatCard key={key} {...card} />
          ))}
        </div>

        <div className="relative z-10 bg-white/90 border border-white shadow-[0_10px_40px_rgba(15,118,110,0.1)] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <RoleSelector roles={roles} selectedRole={selectedRole} onSelect={handleSelectRole} onClear={handleClearRole} />
          <button
            onClick={handleSavePermissions}
            disabled={saving || locked}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#0b1329] to-[#152243] hover:shadow-[0_8px_24px_rgba(11,19,41,0.4)] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition-shadow shadow-[0_4px_14px_rgba(11,19,41,0.25)] cursor-pointer whitespace-nowrap"
          >
            {saving ? "Saving..." : "Save Permissions"}
          </button>
        </div>

        {locked &&
          (rolePermsError ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <span>Couldn't load role permissions. {rolePermsError}</span>
              <button type="button" onClick={retryRolePermissions} className="font-semibold underline cursor-pointer">
                Retry
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm font-medium text-[#64748b]">
              <Loader2 size={18} className="text-[#0f766e] animate-spin" />
              Loading role permissions...
            </div>
          ))}

        <div className={`space-y-4 transition-opacity ${locked ? "opacity-50 pointer-events-none" : ""}`}>
          {modules.length === 0 ? (
            modulesLoading ? (
              [0, 1, 2].map((i) => <ModuleSkeleton key={i} />)
            ) : (
              <div className="text-center text-sm text-[#94a3b8] py-10">No modules found.</div>
            )
          ) : (
            modules.map((mod) => {
              const stats = moduleStats[mod.id] || EMPTY_OBJ;
              return (
                <ModuleCard
                  key={mod.id}
                  mod={mod}
                  modPages={pagesByModule.get(Number(mod.id)) || EMPTY}
                  moduleState={moduleStates[mod.id]}
                  expanded={!!expandedModules[mod.id]}
                  globalPermissions={globalPermissions}
                  totalSelectedPerms={stats.total || 0}
                  allModuleSelected={!!stats.allSelected}
                  onToggleExpand={toggleExpand}
                  onToggleModule={toggleModuleStatus}
                  onToggleAllModule={toggleAllModulePermissions}
                  onToggleAllPage={toggleAllPagePermissions}
                  onTogglePerm={togglePermission}
                  onTogglePageStatus={togglePageStatus}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Permissions;