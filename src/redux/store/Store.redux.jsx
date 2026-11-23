
import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import { combineReducers } from "redux";

import authReducer from "../slices/Auth.slice.redux";
import rolesReducer from "../slices/Roles.slice.redux";
import modulesPagesReducer from "../slices/Modules_Pages.slice.redux";
import permissionsReducer from "../slices/Permissions.slice.redux";
import rolePermissionsReducer from "../slices/Role_Has_Permissions.slice.redux";

const storage = {
  getItem: (key) => Promise.resolve(localStorage.getItem(key)),

  setItem: (key, value) => {
    localStorage.setItem(key, value);
    return Promise.resolve();
  },

  removeItem: (key) => {
    localStorage.removeItem(key);
    return Promise.resolve();
  },
};

const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["user", "token"],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),

  // Roles
  roles: rolesReducer,

  // Modules and Pages
  modules: modulesPagesReducer,

  // Permissions
  permissions: permissionsReducer,

  // Role Permissions
  rolePermissions: rolePermissionsReducer,
});

const store = configureStore({
  reducer: rootReducer,

  devTools: process.env.NODE_ENV !== "production",

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
        ],
      },
    }),
});

const persistor = persistStore(store);

if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  window.store = store;
}

export { store, persistor };
