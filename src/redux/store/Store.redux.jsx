
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

/** Persist only the session fields of the auth slice. */
const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["user", "token"],
};

/* ------------------------------ Root reducer ----------------------------- */

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
});

/* -------------------------------- Store ---------------------------------- */

const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

/* ------------------------------- Persistor ------------------------------- */

const persistor = persistStore(store);

/* --------------------------- Global debug hook --------------------------- */

if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  window.store = store;
}

export { store, persistor };
