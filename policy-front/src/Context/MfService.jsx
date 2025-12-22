// services/MfService.js
import axiosInstance from "../services/api";

const MfService = {
  // MF Entry operations
  createMf: (data) => axiosInstance.post("/createMf", data),

  getMfById: (id) => axiosInstance.get(`/mfEntries/${id}`),

  updateMf: (id, data) => axiosInstance.put(`/updateMf/${id}`, data),

  deleteMf: (id) => axiosInstance.delete(`/deleteMf/${id}`),

  getAllMfEntries: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return axiosInstance.get(
      `/MfEntries${queryParams ? `?${queryParams}` : ""}`
    );
  },

  getNextRegNum: () => axiosInstance.get("/mf-entries/next-reg-num"),

  // Dropdown options (if needed)
  getDropdownOptions: (category = "") => {
    if (category) {
      return axiosInstance.get(`/DropdownEntries?category=${category}`);
    }
    return axiosInstance.get("/DropdownEntries");
  },

  // Get clients
  getAllClients: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return axiosInstance.get(`/clients${queryParams ? `?${queryParams}` : ""}`);
  },

  // Get statistics
  getStatistics: () => axiosInstance.get("/mf-entries/stats"),
};

export default MfService;
