import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    console.log("Request Config:", config);
    console.log("Token:", token);
    if (token && !config.url.includes("/auth")) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(

  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error.response ? error.response.data : error.message);
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

export default api;
