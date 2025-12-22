// services/LicService.js
import axiosInstance from "../services/api";

const LicService = {
  // LIC Entry operations
  createLic: (data) => axiosInstance.post("/createlic", data),

  getLicById: (id) => axiosInstance.get(`/licEntries/${id}`),

  updateLic: (id, data) => axiosInstance.put(`/updatelic/${id}`, data),

  deleteLic: (id) => axiosInstance.delete(`/deletelic/${id}`),

  getAllLicEntries: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return axiosInstance.get(
      `/licEntries${queryParams ? `?${queryParams}` : ""}`
    );
  },

  getNextRegNum: () => axiosInstance.get("/lic-entries/next-reg-num"),

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
  getStatistics: () => axiosInstance.get("/lic-entries/stats"),

  // Export to Excel
  exportToExcel: (params) =>
    axiosInstance.get("/lic/export", {
      params,
      responseType: "blob",
    }),
};

export default LicService;
