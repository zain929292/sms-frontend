import api from "../../config/Api.redux";

export const getModules = (params = {}) =>
  api.get("/module/details", { params });