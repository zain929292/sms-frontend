
import api from "../../config/Api.redux";

const API_URL = "/fee-structure";

export const getFeeStructures = (page, limit, filters = {}) =>
  api.get(`${API_URL}/details`, {
    params: {
      page,
      limit,
      ...filters,
    },
  });

export const createFeeStructure = (payload) =>
  api.post(`${API_URL}/create`, payload);

export const updateFeeStructure = (id, payload) =>
  api.put(`${API_URL}/update/${id}`, payload);

export const deleteFeeStructure = (id) =>
  api.delete(`${API_URL}/delete/${id}`);
