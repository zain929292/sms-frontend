
import api from "../../config/Api.redux";

const API_URL = "/salary-structure";

export const getSalaryStructures = (params = {}) =>
  api.get(`${API_URL}/details`, { params });

export const createSalaryStructure = (payload) =>
  api.post(`${API_URL}/create`, payload);

export const updateSalaryStructure = (id, payload) =>
  api.put(`${API_URL}/update/${id}`, payload);

export const deleteSalaryStructure = (id) =>
  api.delete(`${API_URL}/delete/${id}`);
