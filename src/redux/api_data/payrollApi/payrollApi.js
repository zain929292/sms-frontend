
import api from "../../config/Api.redux";

const API_URL = "/payroll";

// GET: Fetch payroll records
export const getPayrolls = (params = {}) =>
  api.get(`${API_URL}/details`, { params });

// POST: Create payroll
export const createPayroll = (payload) =>
  api.post(`${API_URL}/create`, payload);

// PUT: Update payroll
export const updatePayroll = (id, payload) =>
  api.put(`${API_URL}/update/${id}`, payload);

// DELETE: Delete payroll
export const deletePayroll = (id) =>
  api.delete(`${API_URL}/delete/${id}`);
