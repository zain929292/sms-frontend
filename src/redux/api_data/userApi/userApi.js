
import api from "../../config/Api.redux";

export const getUsers = (params) => {
  return api.get("/user/details", { params });
};

export const createUser = (data) => {
  return api.post("/user/register", data);
};

export const updateUser = (id, data) => {
  return api.put(`/user/update/${id}`, data);
};

export const deleteUser = (id) => {
  return api.delete(`/user/delete/${id}`);
};
