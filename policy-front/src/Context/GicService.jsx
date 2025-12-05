// services/GicService.js
import axiosInstance from "../services/api";

const GicService = {
  // GIC Entry operations
  createGic: (data) => axiosInstance.post("/creategic", data),

  getGicById: (id) => axiosInstance.get(`/gic-entries/${id}`),

  updateGic: (id, data) => axiosInstance.put(`/updategic/${id}`, data),

  deleteGic: (id) => axiosInstance.delete(`/deletegic/${id}`),

  getAllGicEntries: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return axiosInstance.get(`/gic${queryParams ? `?${queryParams}` : ""}`);
  },

  getNextRegNum: () => axiosInstance.get("/gic-entries/next-reg-num"),

  // Dropdown options
  getDropdownOptions: (category = "") => {
    if (category) {
      return axiosInstance.get(`/DropdownEntries?category=${category}`);
    }
    return axiosInstance.get("/DropdownEntries");
  },

  // Get clients for dropdown
  getClients: () => axiosInstance.get("/clients/dropdown"),

  // If /clients/dropdown doesn't exist, use getAllClients with limited results
  getAllClients: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return axiosInstance.get(`/clients${queryParams ? `?${queryParams}` : ""}`);
  },

  // Search GIC entries
  searchGicEntries: (searchParams) =>
    axiosInstance.get("/gic/search", { params: searchParams }),

  // Get statistics
  getStatistics: () => axiosInstance.get("/gic/statistics"),

  // Export to Excel
  exportToExcel: (params) =>
    axiosInstance.get("/gic/export", {
      params,
      responseType: "blob",
    }),
};

export default GicService;
