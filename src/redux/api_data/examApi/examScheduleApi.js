
import Api from "../../config/Api.redux";

export const getExamSchedules = (params = {}) => {
  return Api.get("/exam-schedules/details", { params });
};

export const getExamScheduleById = (id) => {
  return Api.get(`/exam-schedules/details/${id}`);
};

export const createExamSchedule = (data) => {
  return Api.post("/exam-schedules/create", data);
};

export const updateExamSchedule = (id, data) => {
  return Api.put(`/exam-schedules/update/${id}`, data);
};

export const deleteExamSchedule = (id) => {
  return Api.delete(`/exam-schedules/delete/${id}`);
};
