// import axios from "axios";
// import CONFIG from "./Config.redux";

// export const api = axios.create({
//   baseURL: CONFIG.LOCAL_API_URL,
//   timeout: 15000,
// });

// api.interceptors.request.use((config) => {
//   // Skip authentication when requested
//   if (config.skipAuth) return config;

//   const token = localStorage.getItem("authToken");

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   // FormData: let the browser set multipart Content-Type and boundary
//   if (config.data instanceof FormData) {
//     delete config.headers["Content-Type"];
//     delete config.headers["content-type"];
//   } else {
//     config.headers["Content-Type"] = "application/json";
//   }

//   return config;
// });

// export default api;


import axios from "axios";
import CONFIG from "./Config.redux";

const isDesktop = window.acadexDesktop?.isDesktop === true;

const API_URL = isDesktop
  ? CONFIG.LOCAL_API_URL
  : CONFIG.LOCAL_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  if (config.skipAuth) return config;

  const token = localStorage.getItem("authToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
    delete config.headers["content-type"];
  } else {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

export default api;
