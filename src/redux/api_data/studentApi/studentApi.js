
import Api from "../../config/Api.redux";

const studentApi = {
  getStudents(params = {}) {
    return Api.get("/student/details", { params });
  },

  createStudent(data) {
    return Api.post("/student/create", data);
  },

  updateStudent(id, data) {

    return Api.post(`/student/update/${id}`, data);
  },

  deleteStudent(id) {
    return Api.delete(`/student/delete/${id}`);
  },
};

export default studentApi;
