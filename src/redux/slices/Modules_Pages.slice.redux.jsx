/**
 * @file Modules.slice.js
 * @module Redux/Slices/Modules
 * @description Redux Toolkit slice managing Modules and Pages hierarchy for HMS.
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../config/Api.redux";

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

const toRejection = (error, fallback) => ({
  message: error.response?.data?.message || error.message || fallback,
  errors: error.response?.data?.errors ?? null,
});

/** Builds an async thunk with shared try/catch + error mapping. */
const makeThunk = (type, request, fallbackMessage) =>
  createAsyncThunk(type, async (arg, { rejectWithValue }) => {
    try {
      return await request(arg);
    } catch (error) {
      return rejectWithValue(toRejection(error, fallbackMessage));
    }
  });

const sameId = (a, b) => String(a) === String(b);
const bodyOf = (action) => action.payload?.data || action.payload;
const asList = (payload) => {
  const data = payload?.data || payload;
  return Array.isArray(data) ? data : [];
};

/* -------------------------------------------------------------------------- */
/*                                   Thunks                                   */
/* -------------------------------------------------------------------------- */

// ---------- Modules ----------
export const fetchModules = makeThunk(
  "modules/fetchModules",
  async () => (await api.get("/module/details")).data,
  "Failed to fetch modules",
);

export const updateModule = makeThunk(
  "modules/updateModule",
  async ({ id, moduleData }) =>
    (await api.put(`/module/update/${id}`, moduleData)).data,
  "Failed to update module",
);

export const deleteModule = makeThunk(
  "modules/deleteModule",
  async (id) => ({ id, ...(await api.delete(`/module/delete/${id}`)).data }),
  "Failed to delete module",
);

// ---------- Pages ----------
export const fetchPages = makeThunk(
  "modules/fetchPages",
  async () => (await api.get("/page/details")).data,
  "Failed to fetch pages",
);

export const createPage = makeThunk(
  "modules/createPage",
  async (pageData) => (await api.post("/page/create", pageData)).data,
  "Failed to create page",
);

export const updatePage = makeThunk(
  "modules/updatePage",
  async ({ id, pageData }) =>
    (await api.put(`/page/update/${id}`, pageData)).data,
  "Failed to update page",
);

export const deletePage = makeThunk(
  "modules/deletePage",
  async (id) => ({ id, ...(await api.delete(`/page/delete/${id}`)).data }),
  "Failed to delete page",
);

/* -------------------------------------------------------------------------- */
/*                                    Slice                                   */
/* -------------------------------------------------------------------------- */

const now = () => new Date().toISOString();

// Shared state transitions
const startMutation = (state, flag) => {
  state[flag] = true;
  state.error = null;
  state.errors = null;
  state.success = false;
};

const fail = (state, flag, action) => {
  state[flag] = false;
  state.error = action.payload?.message;
  state.errors = action.payload?.errors ?? null;
};

const succeed = (state, flag) => {
  state[flag] = false;
  state.success = true;
  state.lastUpdated = now();
};

const modulesSlice = createSlice({
  name: "modules",
  initialState: {
    modules: [],
    pages: [],
    // `loading` kept for backward compatibility (true while modules OR pages load)
    loading: false,
    modulesLoading: false,
    pagesLoading: false,
    creating: false,
    updating: false,
    deleting: false,
    success: false,
    error: null,
    errors: null,
    lastUpdated: null,
  },
  reducers: {
    resetModuleState: (state) => {
      state.loading = false;
      state.modulesLoading = false;
      state.pagesLoading = false;
      state.creating = false;
      state.updating = false;
      state.deleting = false;
      state.success = false;
      state.error = null;
      state.errors = null;
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
      // ---------- FETCH MODULES ----------
      .addCase(fetchModules.pending, (state) => {
        state.modulesLoading = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModules.fulfilled, (state, action) => {
        state.modulesLoading = false;
        state.loading = state.pagesLoading;
        state.modules = asList(action.payload);
        state.lastUpdated = now();
      })
      .addCase(fetchModules.rejected, (state, action) => {
        state.modulesLoading = false;
        state.loading = state.pagesLoading;
        state.error = action.payload?.message;
      })

      // ---------- UPDATE MODULE ----------
      .addCase(updateModule.pending, (state) =>
        startMutation(state, "updating"),
      )
      .addCase(updateModule.fulfilled, (state, action) => {
        succeed(state, "updating");
        const updated = bodyOf(action);
        const index = state.modules.findIndex((m) => sameId(m.id, updated?.id));
        if (index !== -1) state.modules[index] = updated;
      })
      .addCase(updateModule.rejected, (state, action) =>
        fail(state, "updating", action),
      )

      // ---------- DELETE MODULE ----------
      .addCase(deleteModule.pending, (state) =>
        startMutation(state, "deleting"),
      )
      .addCase(deleteModule.fulfilled, (state, action) => {
        succeed(state, "deleting");
        const { id } = action.payload;
        state.modules = state.modules.filter((m) => !sameId(m.id, id));
        state.pages = state.pages.filter((p) => !sameId(p.module_id, id));
      })
      .addCase(deleteModule.rejected, (state, action) =>
        fail(state, "deleting", action),
      )

      // ---------- FETCH PAGES ----------
      .addCase(fetchPages.pending, (state) => {
        state.pagesLoading = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPages.fulfilled, (state, action) => {
        state.pagesLoading = false;
        state.loading = state.modulesLoading;
        state.pages = asList(action.payload);
        state.lastUpdated = now();
      })
      .addCase(fetchPages.rejected, (state, action) => {
        state.pagesLoading = false;
        state.loading = state.modulesLoading;
        state.error = action.payload?.message;
      })

      // ---------- CREATE PAGE ----------
      .addCase(createPage.pending, (state) => startMutation(state, "creating"))
      .addCase(createPage.fulfilled, (state, action) => {
        succeed(state, "creating");
        state.pages.unshift(bodyOf(action));
      })
      .addCase(createPage.rejected, (state, action) =>
        fail(state, "creating", action),
      )

      // ---------- UPDATE PAGE ----------
      .addCase(updatePage.pending, (state) => startMutation(state, "updating"))
      .addCase(updatePage.fulfilled, (state, action) => {
        succeed(state, "updating");
        const updated = bodyOf(action);
        const index = state.pages.findIndex((p) => sameId(p.id, updated?.id));
        if (index !== -1) state.pages[index] = updated;
      })
      .addCase(updatePage.rejected, (state, action) =>
        fail(state, "updating", action),
      )

      // ---------- DELETE PAGE ----------
      .addCase(deletePage.pending, (state) => startMutation(state, "deleting"))
      .addCase(deletePage.fulfilled, (state, action) => {
        succeed(state, "deleting");
        state.pages = state.pages.filter(
          (p) => !sameId(p.id, action.payload.id),
        );
      })
      .addCase(deletePage.rejected, (state, action) =>
        fail(state, "deleting", action),
      );
  },
});

export const { resetModuleState, clearError, clearSuccess } =
  modulesSlice.actions;

export default modulesSlice.reducer;
