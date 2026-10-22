
import axios from "axios";
import CONFIG from "./Config.redux";

export const api = axios.create({
  baseURL: CONFIG.LOCAL_API_URL,
  timeout: 15000, // fail fast instead of hanging forever on a slow network
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  // Pass `{ skipAuth: true }` (e.g. login) to avoid sending a stale token.
  if (config.skipAuth) return config;

  const token = localStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
