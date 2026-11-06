import api from "../../config/Api.redux";

const studentAttendanceApi = {
  getStudentAttendance: (params = {}) =>
    api.get("/student-attendance/details", { params }),

  createStudentAttendance: (data) =>
    api.post("/student-attendance/create", data),

  updateStudentAttendance: (id, data) =>
    api.put(`/student-attendance/update/${id}`, data),

  deleteStudentAttendance: (id) =>
    api.delete(`/student-attendance/delete/${id}`),
};

export default studentAttendanceApi;