import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import CreateInvoice from "./pages/CreateInvoice";
import Invoices from "./pages/Invoices";
import InvoiceDetail from "./pages/InvoiceDetail";
import Payments from "./pages/Payments";
import Expenses from "./pages/Expenses";
import CompanyProfile from "./pages/CompanyProfile";
import PublicInvoice from "./pages/PublicInvoice";
import UserProfile from "./pages/UserProfile";
import TeamManagement from "./pages/TeamManagement";

import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "12px",
            fontFamily: "Plus Jakarta Sans, sans-serif"
          }
        }}
      />

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/public/invoice/:token" element={<PublicInvoice />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/clients"
          element={
            <ProtectedRoute allowedRoles={["Owner", "Manager", "Sales", "Finance", "Accountant"]}>
              <Clients />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-invoice"
          element={
            <ProtectedRoute allowedRoles={["Owner", "Manager", "Sales"]}>
              <CreateInvoice />
            </ProtectedRoute>
          }
        />

        <Route
          path="/invoices"
          element={
            <ProtectedRoute allowedRoles={["Owner", "Manager", "Sales", "Finance", "Accountant"]}>
              <Invoices />
            </ProtectedRoute>
          }
        />

        <Route
          path="/invoices/:id"
          element={
            <ProtectedRoute allowedRoles={["Owner", "Manager", "Sales", "Finance", "Accountant"]}>
              <InvoiceDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payments"
          element={
            <ProtectedRoute allowedRoles={["Owner", "Manager", "Finance", "Accountant"]}>
              <Payments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/expenses"
          element={
            <ProtectedRoute allowedRoles={["Owner", "Manager", "Finance", "Accountant"]}>
              <Expenses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/company-profile"
          element={
            <ProtectedRoute allowedRoles={["Owner", "Manager", "Sales", "Finance", "Accountant"]}>
              <CompanyProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user-profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/team-management"
          element={
            <ProtectedRoute allowedRoles={["Owner", "HR", "HR Manager", "Manager"]}>
              <TeamManagement />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
