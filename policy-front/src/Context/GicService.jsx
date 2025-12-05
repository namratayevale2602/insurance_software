import axiosInstance from "../services/api";

const ClientService = {
  createGic: (data) => axiosInstance.post("/creategic", data),

  updateClient: (id, clientData) =>
    axiosInstance.put(`/updateclient/${id}`, clientData),

  deleteClient: (id) => axiosInstance.delete(`/deleteclient/${id}`),
};
export default ClientService;
