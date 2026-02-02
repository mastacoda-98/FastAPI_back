import axios from "axios";

const getApiUrl = () => {
  // In production, always use Railway backend
  if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_API_URL) {
    return "https://fastapiback-production.up.railway.app";
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
};

const api = axios.create({
  baseURL: getApiUrl(),
});

export default api;
