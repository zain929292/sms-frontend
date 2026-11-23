import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../config/Api.redux";

const toRejection = (error, fallback) => ({
  message: error.response?.data?.message || error.message || fallback,
});

const makeThunk = (type, request, fallbackMessage) =>
  createAsyncThunk(type, async (arg, { rejectWithValue }) => {
    try {
      return await request(arg);
    } catch (error) {
      return rejectWithValue(toRejection(error, fallbackMessage));
    }
  });

// ✅ Fixed: Properly unpack the nested data array from backend response
const asList = (payload) => {
  const data = payload?.data ?? payload;
  return Array.isArray(data) ? data : [];
};

const bodyOf = (action) =>
  action.payload.role || action.payload.data || action.payload;
const sameId = (a, b) => String(a) === String(b);

export const createRole = makeThunk(
  "role/createRole",
  async (roleData) =>
    (
      await api.post("/role/create", {
        name: roleData.name,
        description: roleData.description,
      })
    ).data,
  "Failed to create role record.",
);

export const fetchRoles = makeThunk(
  "role/fetchRoles",
  async () => (await api.get("/role/details")).data,
  "Failed to fetch roles list.",
);

export const updateRole = makeThunk(
  "role/updateRole",
  async ({ id, data }) =>
    (
      await api.put(`/role/update/${id}`, {
        name: data.name,
        description: data.description,
      })
    ).data,
  "Failed to update role.",
);

export const deleteRole = createAsyncThunk(
  "role/deleteRole",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/role/delete/${id}`);
      await dispatch(fetchRoles());
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        "Failed to delete role. Please try again.",
      );
    }
  },
);

const initialState = {
  roles: [],
  selectedRole: null,
  loading: false,
  creating: false,
  updating: false,
  error: null,
  successMessage: null,
};

const roleSlice = createSlice({
  name: "role",
  initialState,
  reducers: {
    clearRoleState: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    clearSelectedRole: (state) => {
      state.selectedRole = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* -------- CREATE -------- */
      .addCase(createRole.pending, (state) => {
        state.creating = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.creating = false;
        const newRole = bodyOf(action);
        if (newRole && (newRole.id || newRole._id)) {
          state.roles.unshift(newRole);
        }
        state.successMessage =
          action.payload.message || "Role created successfully!";
      })
      .addCase(createRole.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })

      /* -------- FETCH -------- */
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = asList(action.payload);
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* -------- UPDATE -------- */
      .addCase(updateRole.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.updating = false;
        const updated = bodyOf(action);
        if (updated) {
          state.roles = state.roles.map((r) =>
            sameId(r.id || r._id, updated.id || updated._id) ? updated : r,
          );
          state.selectedRole = updated;
        }
        state.successMessage =
          action.payload.message || "Role updated successfully!";
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })

      /* -------- DELETE -------- */
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.roles = state.roles.filter(
          (r) => !sameId(r.id || r._id, action.payload),
        );
      });
  },
});

export const { clearRoleState, clearSelectedRole } = roleSlice.actions;
export default roleSlice.reducer;