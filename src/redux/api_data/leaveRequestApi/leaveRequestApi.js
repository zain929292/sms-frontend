
import Api from "../../config/Api.redux";

const leaveRequestApi = {
  getLeaveRequests(params = {}) {
    return Api.get("/leave-request/details", { params });
  },

  createLeaveRequest(data) {
    return Api.post("/leave-request/create", data);
  },

  updateLeaveRequest(id, data) {
    return Api.put(`/leave-request/update/${id}`, data);
  },

  deleteLeaveRequest(id) {
    return Api.delete(`/leave-request/delete/${id}`);
  },

  approveLeaveRequest(id, data) {
    return Api.put(`/leave-request/approval/${id}`, data);
  },
};

export default leaveRequestApi;
