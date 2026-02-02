import axios from "axios";

const getApiUrl = () => {
  // In production, always use Railway backend
  if (typeof window !== "undefined" && !process.env.NEXT_PUBLIC_API_URL) {
    return "https://fastapiback-production.up.railway.app";
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
};

const api = axios.create({
  baseURL: getApiUrl(),
});

// Add request interceptor to include JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
