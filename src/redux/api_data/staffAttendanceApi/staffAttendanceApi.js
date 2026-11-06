
import api from "../../config/Api.redux";

const staffAttendanceApi = {
  getStaffAttendance: (params = {}) =>
    api.get("/staff-attendance/details", { params }),

  createStaffAttendance: (data) =>
    api.post("/staff-attendance/create", data),

  updateStaffAttendance: (id, data) =>
    api.put(`/staff-attendance/update/${id}`, data),

  deleteStaffAttendance: (id) =>
    api.delete(`/staff-attendance/delete/${id}`),
};

export default staffAttendanceApi;
