import Api from "../../config/Api.redux";

export const getExamSubjectResults = (params) =>
  Api.get("/exam-subjects-result/details", { params });

export const createExamSubjectResults = (data) =>
  Api.post("/exam-subjects-result/create", data);

export const deleteExamSubjectResult = (id) =>
  Api.delete(`/exam-subjects-result/delete/${id}`);