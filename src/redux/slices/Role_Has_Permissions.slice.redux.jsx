/**
 * @file Role_Has_Permissions.slice.redux.js
 * Role-Permissions slice: 60s cache, shared in-flight, worker-pool pagination,
 * silent background refresh.
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../config/Api.redux";

/* ------------------------------- Helpers -------------------------------- */

const toRejection = (error, fallback) => ({
  message: error.response?.data?.message || error.message || fallback,
  errors: error.response?.data?.errors ?? null,
});

const makeThunk = (type, request, fallbackMessage) =>
  createAsyncThunk(type, async (arg, { rejectWithValue }) => {
    try {
      return await request(arg);
    } catch (error) {
      return rejectWithValue(toRejection(error, fallbackMessage));
    }
  });

/* --------------------------- Fetch constants ---------------------------- */

const ENDPOINT = "/role-permission/details";
const PAGE_SIZE = 500;
const MAX_PAGES = 50;
const CONCURRENCY = 6;
const TIMEOUT = 15000;
const CACHE_TTL = 60 * 1000;

const requestPage = async (params) => {
  const config = { params, timeout: TIMEOUT };
  try {
    return (await api.get(ENDPOINT, config)).data;
  } catch (error) {
    const retryable = !error.response || error.response.status >= 500;
    if (!retryable) throw error;
    return (await api.get(ENDPOINT, config)).data;
  }
};

const lastPageOf = (p) =>
  p?.last_page ||
  p?.lastPage ||
  (p?.total && p?.per_page ? Math.ceil(p.total / p.per_page) : 1);

const runPool = async (items, limit, worker) => {
  const results = new Array(items.length);
  let next = 0;
  const runner = async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i]);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, runner),
  );
  return results;
};

const fetchAllRows = async () => {
  // 1. Request the first page
  const first = await requestPage({ per_page: PAGE_SIZE });
  const pagination = first?.pagination || null;
  const current = pagination?.current_page || 1;
  const last = Math.min(lastPageOf(pagination), MAX_PAGES);

  const rows = first?.data ? [...first.data] : [];

  // 2. If there are multiple pages (e.g., backend forces smaller per_page chunks), fetch all remaining pages concurrently using the pool
  if (last > current) {
    const pages = [];
    for (let p = current + 1; p <= last; p++) pages.push(p);

    const chunks = await runPool(
      pages,
      CONCURRENCY,
      async (page) => {
        const res = await requestPage({ page, per_page: pagination?.per_page || PAGE_SIZE });
        return res?.data || [];
      },
    );

    for (const chunk of chunks) {
      for (const row of chunk) {
        rows.push(row);
      }
    }
  }

  return { data: rows, pagination };
};

/* --------------------------- Shared in-flight ---------------------------- */

let inflight = null;

const loadShared = async (force) => {
  if (inflight && force) {
    try {
      await inflight;
    } catch { }
  }
  if (!inflight) {
    inflight = fetchAllRows();
    inflight.catch(() => { }).finally(() => (inflight = null));
  }
  return inflight;
};

export const fetchRolePermissions = createAsyncThunk(
  "rolePermissions/fetchRolePermissions",
  async (arg, { rejectWithValue }) => {
    try {
      return await loadShared(Boolean(arg?.force));
    } catch (error) {
      return rejectWithValue(
        toRejection(error, "Failed to fetch role and permissions"),
      );
    }
  },
  {
    condition: (arg, { getState }) => {
      if (arg?.force) return true;
      const { lastFetchedAt } = getState().rolePermissions;
      return !lastFetchedAt || Date.now() - lastFetchedAt > CACHE_TTL;
    },
  },
);

/* ------------------------ Create / Update / Delete ----------------------- */

export const createRolePermission = makeThunk(
  "rolePermissions/createRolePermission",
  async (d) => (await api.post("/role-permission/create", d)).data,
  "Failed to create role permission",
);

export const updateRolePermission = makeThunk(
  "rolePermissions/updateRolePermission",
  async ({ roleId, data }) => {
    const payload = {
      module_id: Number(data.module_id),
      page_id: Number(data.page_id),
      module_status: data.module_status ?? "inactive",
      page_status: data.page_status ?? "inactive",
      permission_ids: Array.isArray(data.permission_ids)
        ? data.permission_ids.map(Number)
        : [],
    };
    return (await api.put(`/role-permission/update/${Number(roleId)}`, payload))
      .data;
  },
  "Failed to update role permission",
);

export const updatePermission = makeThunk(
  "rolePermissions/updatePermission",
  async ({ id, permissionData }) =>
    (await api.put(`/permission/update/${id}`, permissionData)).data,
  "Failed to update permission",
);

export const deletePermission = makeThunk(
  "rolePermissions/deletePermission",
  async (id) => ({ id, ...(await api.delete(`/permission/delete/${id}`)).data }),
  "Failed to delete permission",
);

/* --------------------------------- Slice --------------------------------- */

const initialState = {
  rolePermissions: [],
  pagination: null,
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  success: false,
  error: null,
  errors: null,
  lastUpdated: null,
  lastFetchedAt: null,
};

const start = (state, flag) => {
  state[flag] = true;
  state.error = null;
  state.errors = null;
  state.success = false;
};
const fail = (state, flag, action) => {
  state[flag] = false;
  state.error = action.payload?.message;
  state.errors = action.payload?.errors;
};
const done = (state, flag) => {
  state[flag] = false;
  state.success = true;
  state.lastUpdated = new Date().toISOString();
};

const rolePermissionsSlice = createSlice({
  name: "rolePermissions",
  initialState,
  reducers: {
    resetRolePermissionState: (state) => {
      Object.assign(state, {
        loading: false,
        creating: false,
        updating: false,
        deleting: false,
        success: false,
        error: null,
        errors: null,
      });
    },
    clearError: (state) => {
      state.error = null;
      state.errors = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRolePermissions.pending, (state, action) => {
        if (!action.meta.arg?.silent) state.loading = true;
        state.error = null;
      })
      .addCase(fetchRolePermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.rolePermissions = action.payload?.data || [];
        state.pagination = action.payload?.pagination || null;
        state.lastFetchedAt = Date.now();
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchRolePermissions.rejected, (state, action) => {
        state.loading = false;
        if (!action.meta.arg?.silent)
          state.error = action.payload?.message ?? action.error?.message;
      })
      .addCase(createRolePermission.pending, (s) => start(s, "creating"))
      .addCase(createRolePermission.fulfilled, (s) => done(s, "creating"))
      .addCase(createRolePermission.rejected, (s, a) => fail(s, "creating", a))
      .addCase(updateRolePermission.pending, (s) => start(s, "updating"))
      .addCase(updateRolePermission.fulfilled, (s) => done(s, "updating"))
      .addCase(updateRolePermission.rejected, (s, a) => fail(s, "updating", a))
      .addCase(updatePermission.pending, (s) => start(s, "updating"))
      .addCase(updatePermission.fulfilled, (state, action) => {
        done(state, "updating");
        const item = action.payload?.data || action.payload;
        const i = state.rolePermissions.findIndex(
          (r) => r.permission_id === item.permission_id,
        );
        if (i !== -1) Object.assign(state.rolePermissions[i], item);
      })
      .addCase(updatePermission.rejected, (s, a) => fail(s, "updating", a))
      .addCase(deletePermission.pending, (state) => {
        state.deleting = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deletePermission.fulfilled, (state, action) => {
        done(state, "deleting");
        const remaining = state.rolePermissions.filter(
          (r) => r.permission_id !== action.payload.id,
        );
        if (remaining.length !== state.rolePermissions.length) {
          state.rolePermissions = remaining;
        }
      })
      .addCase(deletePermission.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload?.message;
      });
  },
});

export const { resetRolePermissionState, clearError, clearSuccess } =
  rolePermissionsSlice.actions;
export default rolePermissionsSlice.reducer;