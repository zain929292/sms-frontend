
import api from "../../config/Api.redux";

const BASE_URL = "/student-enrollment";

export const getStudentEnrollments = (params = {}) =>
  api.get(`${BASE_URL}/details`, { params });

export const getClasses = () =>
  api.get("/class/details");

export const createStudentEnrollment = (data) =>
  api.post(`${BASE_URL}/create`, data);

export const updateStudentEnrollment = (id, data) =>
  api.put(`${BASE_URL}/update/${id}`, data);

export const deleteStudentEnrollment = (id) =>
  api.delete(`${BASE_URL}/delete/${id}`);

export const promoteStudentEnrollment = (data) =>
  api.post(`${BASE_URL}/promote`, data);
