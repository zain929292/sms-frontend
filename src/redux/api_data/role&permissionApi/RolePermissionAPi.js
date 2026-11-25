import api from "../../config/Api.redux";

export const getRolePermission = (params = {}) => {
  return api.get("/role-permission/details", { params });
};