import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaChartLine,
  FaUsers,
  FaFileInvoice,
  FaPlusCircle,
  FaCreditCard,
  FaWallet,
  FaBuilding,
  FaSignOutAlt,
  FaUser,
  FaUsersCog
} from "react-icons/fa";

import API from "../services/api";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: FaChartLine },
  { to: "/clients", label: "Clients", icon: FaUsers, roles: ["Owner", "Manager", "Sales", "Finance", "Accountant"] },
  { to: "/create-invoice", label: "Create Invoice", icon: FaPlusCircle, roles: ["Owner", "Manager", "Sales"] },
  { to: "/invoices", label: "Invoices", icon: FaFileInvoice, roles: ["Owner", "Manager", "Sales", "Finance", "Accountant"] },
  { to: "/payments", label: "Payments", icon: FaCreditCard, roles: ["Owner", "Manager", "Finance", "Accountant"] },
  { to: "/expenses", label: "Expenses", icon: FaWallet, roles: ["Owner", "Manager", "Finance", "Accountant"] },
  { to: "/company-profile", label: "Company Profile", icon: FaBuilding, roles: ["Owner", "Manager", "Sales", "Finance", "Accountant"] },
  { to: "/user-profile", label: "User Profile", icon: FaUser },
  { to: "/team-management", label: "Team Management", icon: FaUsersCog, roles: ["Owner", "HR", "HR Manager", "Manager"] }
];

export default function Layout({ title, subtitle, children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = async () => {
    try {
      await API.post("logout.php");
    } catch (err) {
      // Session may already be cleared
    }

    localStorage.removeItem("user");
    navigate("/");
  };

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role)
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-gradient-to-b from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-xl lg:flex">
          <div className="border-b border-white/10 px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                <FaFileInvoice className="text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Invoxa</h1>
                <p className="text-xs text-indigo-200">Business Management Platform</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-6">
            {filteredNavItems.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;

              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-white text-indigo-900 shadow-md"
                      : "text-indigo-100 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className={active ? "text-indigo-600" : ""} />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-4">
            <div className="mb-3 rounded-xl bg-white/10 px-4 py-3">
              <div className="flex items-center justify-between gap-1 mb-1">
                <p className="truncate text-sm font-semibold">{user?.name}</p>
                <span className="shrink-0 rounded-md bg-white/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                  {user?.role || "Owner"}
                </span>
              </div>
              <p className="truncate text-xs text-indigo-200">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium transition hover:bg-white/20"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </aside>

        <div className="flex flex-1 flex-col lg:pl-64">
          <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
            <div className="flex items-center justify-between px-6 py-4 lg:px-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                {subtitle && (
                  <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
                )}
              </div>

              <div className="flex items-center gap-2 lg:hidden">
                <select
                  value={location.pathname}
                  onChange={(e) => navigate(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  {filteredNavItems.map(({ to, label }) => (
                    <option key={to} value={to}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </header>

          <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
