import axios from "axios";

export const API_BASE_URL = "http://localhost:8000/api";
export const IMAGE_PATH = "http://localhost:8000/uploads";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
