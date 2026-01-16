// services/RtoService.js
import axiosInstance from "../services/api";

const RtoService = {
  // RTO Entry operations
  createRto: (data) => axiosInstance.post("/createRto", data),

  getRtoById: (id) => axiosInstance.get(`/rtoEntries/${id}`),

  updateRto: (id, data) => axiosInstance.put(`/updateRto/${id}`, data),

  deleteRto: (id) => axiosInstance.delete(`/deleteRto/${id}`),

  getAllRtoEntries: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return axiosInstance.get(
      `/RtoEntries${queryParams ? `?${queryParams}` : ""}`
    );
  },

  getFilterOptions: () => axiosInstance.get("/rto-entries/filter-options"),
  getNextRegNum: () => axiosInstance.get("/rto-entries/next-reg-num"),

  // Dropdown options
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
  getStatistics: () => axiosInstance.get("/rto-entries/stats"),
};

export default RtoService;
