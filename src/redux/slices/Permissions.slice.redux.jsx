/**
 * @file Permissions.slice.js
 * @module Redux/Slices/Permissions
 * @description Permissions slice.
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../config/Api.redux";

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

const asList = (payload) => {
  const data = payload?.data ?? payload;
  return Array.isArray(data) ? data : [];
};

export const fetchPermissions = makeThunk(
  "permissions/fetchPermissions",
  async () => (await api.get("/permission/details")).data,
  "Failed to fetch permissions",
);

const initialState = {
  permissions: [],
  loading: false,
  success: false,
  error: null,
  errors: null,
  lastUpdated: null,
};

const permissionsSlice = createSlice({
  name: "permissions",
  initialState,
  reducers: {
    resetPermissionState: (state) => {
      Object.assign(state, {
        loading: false,
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
      .addCase(fetchPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions = asList(action.payload);
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      });
  },
});

export const { resetPermissionState, clearError, clearSuccess } =
  permissionsSlice.actions;
export default permissionsSlice.reducer;
