import Api from "../../config/Api.redux";

export const getSubjects = (params = {}) =>
  Api.get("/subject/details", { params });

export const createSubject = (payload) =>
  Api.post("/subject/create", payload);

export const updateSubject = (id, payload) =>
  Api.put(`/subject/update/${id}`, payload);

export const deleteSubject = (id) =>
  Api.delete(`/subject/delete/${id}`);