// services/BmdsService.js
import axiosInstance from "../services/api";

const BmdsService = {
  // BMDS Entry operations
  createBmds: (data) => axiosInstance.post("/createBmds", data),

  getBmdsById: (id) => axiosInstance.get(`/bmdsEntries/${id}`),

  updateBmds: (id, data) => axiosInstance.put(`/updateBmds/${id}`, data),

  deleteBmds: (id) => axiosInstance.delete(`/deleteBmds/${id}`),

  getAllBmdsEntries: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return axiosInstance.get(
      `/BmdsEntries${queryParams ? `?${queryParams}` : ""}`
    );
  },

  getNextRegNum: () => axiosInstance.get("/bmds-entries/next-reg-num"),

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
  getStatistics: () => axiosInstance.get("/bmds-entries/stats"),
};

export default BmdsService;
