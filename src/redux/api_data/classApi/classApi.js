import api from "../../config/Api.redux";

const API_URL = "/class";

export const getClasses = (page, limit) =>
  api.get(`${API_URL}/details`, {
    params: { page, limit },
  });

export const createClass = (payload) =>
  api.post(`${API_URL}/create`, payload);

export const updateClass = (id, payload) =>
  api.put(`${API_URL}/update/${id}`, payload);

export const deleteClass = (id) =>
  api.delete(`${API_URL}/delete/${id}`);
