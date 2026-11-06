
import Api from "../../config/Api.redux";

const staffApi = {
  getStaff(params = {}) {
    return Api.get("/user/details", { params });
  },

  createStaff(data) {
    return Api.post("/staff/create", data);
  },

  updateStaff(id, data) {
    data.append("_method", "PUT");

    return Api.post(`/staff/update/${id}`, data);
  },

  deleteStaff(id) {
    return Api.delete(`/staff/delete/${id}`);
  },
};

export default staffApi;
