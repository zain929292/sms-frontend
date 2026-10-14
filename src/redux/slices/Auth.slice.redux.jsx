/**
 * @file Auth.slice.js
 * @module Redux/Slices/Auth
 * @description
 * Redux Toolkit slice managing the Authentication lifecycle for HMS Users.
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../config/Api.redux";

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

/** Save session in one place (keeps every key other files may read). */
const saveSession = (user, token) => {
  try {
    if (token) localStorage.setItem("authToken", token);
    if (user) {
      const serialized = JSON.stringify(user);
      localStorage.setItem("user", serialized);
      localStorage.setItem("authUser", serialized); // used by Sidebar
    }
  } catch (e) {
    /* storage full / blocked - state in Redux still works */
  }
};

const clearSession = () => {
  try {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("authUser");
  } catch (e) {
    /* ignore */
  }
};

/** Convert any axios error into a serializable rejection payload. */
const toRejection = (error, fallbackMessage) => {
  const data = error.response?.data;
  return {
    message: data?.message || error.message || fallbackMessage,
    errors: data?.errors ?? null,
    attempts: data?.attempts, // needed by the Signin screen
    status: error.response?.status ?? 0, // needed for 423 (locked) handling
    success: false,
  };
};

/** Flatten a user + user_details record for the UI. */
const mapUser = (user) => {
  const d = user.user_details ?? null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
    staff: d,
    staff_id: d?.id ?? null,
    cnic: d?.cnic ?? null,
    phone: d?.phone ?? null,
    specialization: d?.specialization ?? null,
    consultation_fee: d?.consultation_fee ?? null,
    basic_salary: d?.basic_salary ?? null,
    commission: d?.commission ?? null,
    start_time: d?.start_time ?? null,
    end_time: d?.end_time ?? null,
    shift: d?.shift ?? null,
    status: d?.status || "Inactive",
    isStaff: !!d,
  };
};

/* -------------------------------------------------------------------------- */
/*                                   Thunks                                   */
/* -------------------------------------------------------------------------- */

/** Login an existing user. */
export const login = createAsyncThunk(
  "auth/login",
  async (loginData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/login", loginData, {
        skipAuth: true,
      });
      const { token, user, message } = data;

      if (!user || !token) {
        throw new Error("Invalid response structure from server");
      }

      saveSession(user, token);
      return { user, token, message };
    } catch (error) {
      return rejectWithValue(toRejection(error, "Login failed"));
    }
  },
);

/** Register a new user. */
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/user/register", userData);
      const { user, token, message } = data;

      // NOTE: if backend returns a token, the session is replaced (as before).
      if (token) saveSession(user, token);

      return { user, token, message };
    } catch (error) {
      return rejectWithValue(toRejection(error, "Registration failed"));
    }
  },
);

/** Fetch all users with staff details (paginated). */
export const getAllUsers = createAsyncThunk(
  "auth/getAllUsers",
  async (page = 1, { rejectWithValue }) => {
    if (!localStorage.getItem("authToken")) {
      return rejectWithValue({
        message: "No authentication token found",
        success: false,
      });
    }

    try {
      const { data: res } = await api.get("/user/details", {
        params: { page },
      });

      return {
        message: res.message,
        data: (res.data || []).map(mapUser),
        pagination: res.pagination,
        success: true,
      };
    } catch (error) {
      return rejectWithValue(toRejection(error, "Failed to fetch users"));
    }
  },
);

/* -------------------------------------------------------------------------- */
/*                                    Slice                                   */
/* -------------------------------------------------------------------------- */

const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  users: [],
  usersLoading: false,
  usersError: null,
  pagination: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: () => {
      clearSession();
      return initialState;
    },
    clearUsers: (state) => {
      state.users = [];
      state.pagination = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload.user;
        state.token = payload.token;
      })
      .addCase(login.rejected, (state, { payload, error }) => {
        state.loading = false;
        state.error = payload || { message: error?.message };
      })

      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload.user;
        if (payload.token) state.token = payload.token;
      })
      .addCase(registerUser.rejected, (state, { payload, error }) => {
        state.loading = false;
        state.error = payload || { message: error?.message };
      })

      // Get all users
      .addCase(getAllUsers.pending, (state) => {
        state.usersLoading = true;
        state.usersError = null;
      })
      .addCase(getAllUsers.fulfilled, (state, { payload }) => {
        state.usersLoading = false;
        state.users = payload.data;
        state.pagination = payload.pagination || null;
      })
      .addCase(getAllUsers.rejected, (state, { payload }) => {
        state.usersLoading = false;
        state.usersError = payload?.message || "Failed to fetch users";
        state.users = [];
      });
  },
});

export const { logout, clearUsers, clearError } = authSlice.actions;
export default authSlice.reducer;
