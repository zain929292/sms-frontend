
import Api from "../../config/Api.redux";

export const getExams = (params = {}) => {
  return Api.get("/exams/details", { params });
};

export const getExamById = (id) => {
  return Api.get(`/exams/details/${id}`);
};

export const createExam = (data) => {
  return Api.post("/exams/create", data);
};

export const updateExam = (id, data) => {
  return Api.put(`/exams/update/${id}`, data);
};

export const deleteExam = (id) => {
  return Api.delete(`/exams/delete/${id}`);
};
