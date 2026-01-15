import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/auth",
  headers: {
    "Content-Type": "application/json"
  },
});

// Attach token from localStorage on each request (keeps code simple for dev)
api.interceptors.request.use((config) => {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handler: on 401/403 remove token and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    if (status === 401 || status === 403) {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
      }
      // force reload to reset app state and send user to login
      try {
        if (typeof window !== "undefined") window.location.href = "/login";
      } catch (e) {
        console.warn("Redirect to /login failed", e);
      }
    }
    return Promise.reject(err);
  }
);

export default api;











