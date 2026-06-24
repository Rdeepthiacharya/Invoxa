import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost/main-project/Invoxa/backend/api/",
  withCredentials: true
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("user");

      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default API;
