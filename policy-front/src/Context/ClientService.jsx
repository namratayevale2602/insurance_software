// services/ClientService.js
import axiosInstance from "../services/api";

const ClientService = {
  // Existing endpoints
  getAllClients: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return axiosInstance.get(`/clients${queryParams ? `?${queryParams}` : ""}`);
  },

  getClientById: (id) => axiosInstance.get(`/clients/${id}`),

  getBySrNo: (srNo) => axiosInstance.get(`/clients/sr-no/${srNo}`),

  getByType: (type) => axiosInstance.get(`/clients/type/${type}`),

  getByTag: (tag) => axiosInstance.get(`/clients/tag/${tag}`),

  getStats: () => axiosInstance.get("/clients/stats/statistics"),

  createClient: (clientData) => axiosInstance.post("/createclient", clientData),

  updateClient: (id, clientData) =>
    axiosInstance.put(`/updateclient/${id}`, clientData),

  deleteClient: (id) => axiosInstance.delete(`/deleteclient/${id}`),

  getAllCities: () => axiosInstance.get("/cities"),

  // Remove duplicate getTodaySpecial from here

  getDropdownOptions: (category = "") => {
    if (category) {
      return axiosInstance.get(`/DropdownEntries?category=${category}`);
    }
    return axiosInstance.get("/DropdownEntries");
  },

  // New endpoints for client entries
  getAllClientData: (clientId) => axiosInstance.get(`/getalldata/${clientId}`),

  getClientGicEntries: (clientId) =>
    axiosInstance.get(`/gic-entries/${clientId}`),

  getClientLicEntries: (clientId) =>
    axiosInstance.get(`/lic-entries/${clientId}`),

  getClientRtoEntries: (clientId) =>
    axiosInstance.get(`/rto-entries/${clientId}`),

  getClientBmdsEntries: (clientId) =>
    axiosInstance.get(`/bmds-entries/${clientId}`),

  getClientMfEntries: (clientId) =>
    axiosInstance.get(`/mf-entries/${clientId}`),

  // REMINDER ENDPOINTS - Add these at the end
  getTodaySpecial: () => axiosInstance.get("/clients/todayspecial"),

  getUpcomingReminders: (daysAhead = 30) =>
    axiosInstance.get(`/clients/upcoming-reminders?days_ahead=${daysAhead}`),

  getRemindersByDateRange: (params) =>
    axiosInstance.get("/clients/reminders-by-date", { params }),

  getClientsForMessaging: (params) =>
    axiosInstance.get("/clients/for-messaging", { params }),
};

export default ClientService;
