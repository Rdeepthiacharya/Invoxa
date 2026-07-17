import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost/main-project/Invoxa/backend/api/",
  withCredentials: true
});

const endpointMap = {
  "login.php": "auth.php?action=login",
  "register.php": "auth.php?action=register",
  "logout.php": "auth.php?action=logout",
  "dashboard-stats.php": "dashboard.php?action=stats",
  "recent-invoices.php": "dashboard.php?action=recent",
  "get-users.php": "users.php?action=get",
  "add-user.php": "users.php?action=add",
  "update-user.php": "users.php?action=update",
  "update-user-role.php": "users.php?action=update-role",
  "delete-user.php": "users.php?action=delete",
  "get-user-profile.php": "users.php?action=get-profile",
  "save-user-profile.php": "users.php?action=save-profile",
  "get-company-profile.php": "users.php?action=get-company-profile",
  "save-company-profile.php": "users.php?action=save-company-profile",
  "get-company-info.php": "users.php?action=get-company-info",
  "get-clients.php": "clients.php?action=get",
  "add-client.php": "clients.php?action=add",
  "update-client.php": "clients.php?action=update",
  "delete-client.php": "clients.php?action=delete",
  "get-invoices.php": "invoices.php?action=get",
  "get-invoice-detail.php": "invoices.php?action=detail",
  "get-pending-invoices.php": "invoices.php?action=pending",
  "get-public-invoice.php": "invoices.php?action=public",
  "create-invoice.php": "invoices.php?action=create",
  "get-expenses.php": "expenses.php?action=get",
  "add-expense.php": "expenses.php?action=add",
  "get-payments.php": "payments.php?action=get",
  "add-payment.php": "payments.php?action=add",
};

API.interceptors.request.use((config) => {
  if (config.url) {
    const [filename, query] = config.url.split("?");
    if (endpointMap[filename]) {
      config.url = endpointMap[filename] + (query ? `&${query}` : "");
    }
  }
  return config;
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
