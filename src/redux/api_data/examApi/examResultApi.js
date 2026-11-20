
import Api from "../../config/Api.redux";

export const getExamResults = (params = {}) => {
  return Api.get("/exam-results/details", { params });
};

export const getExamResultById = (id) => {
  return Api.get("/exam-results/details", {
    params: { id },
  });
};

export const createExamResult = (data) => {
  return Api.post("/exam-results/create", data);
};

export const updateExamResult = (id, data) => {
  return Api.put(`/exam-results/update/${id}`, data);
};

export const deleteExamResult = (id) => {
  return Api.delete(`/exam-results/delete/${id}`);
};
