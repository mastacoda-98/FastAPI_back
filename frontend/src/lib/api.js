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

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(
          "Token attached to request:",
          token.substring(0, 20) + "...",
        );
      } else {
        console.log("No token found in localStorage");
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("401 Unauthorized:", error.response.data);s
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("login_time");
      }
    }
    return Promise.reject(error);
  },
);

export default api;
