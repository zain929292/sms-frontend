import api from "../../config/Api.redux";

export const getDashboardDetails = async () => {
  const response = await api.get("/dashboard/details");
  return response.data.data;
};