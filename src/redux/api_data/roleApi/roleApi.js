import api from "../../config/Api.redux";

export const getRoles = (params) => {
  return api.get("/role/details", { params });
};