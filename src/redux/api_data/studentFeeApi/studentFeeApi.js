
import api from "../../config/Api.redux";

const API_URL = "/student-fee";

export const getStudentFees = (params = {}) =>
  api.get(`${API_URL}/details`, { params });

export const getStudentFeeById = (id) =>
  api.get(`${API_URL}/details`, {
    params: { id },
  });

export const createStudentFee = (payload) =>
  api.post(`${API_URL}/create`, payload);

export const updateStudentFee = (id, payload) =>
  api.put(`${API_URL}/update/${id}`, payload);

export const deleteStudentFee = (id) =>
  api.delete(`${API_URL}/delete/${id}`);
