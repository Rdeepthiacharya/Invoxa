import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaFileInvoice, FaEnvelope, FaLock } from "react-icons/fa";
import toast from "react-hot-toast";

import API from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post("login.php", form);

      if (res.data.success) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        toast.success(`Welcome back, ${res.data.user.name}!`);
        navigate("/dashboard");
      } else {
        toast.error(res.data.message || "Invalid credentials");
      }
    } catch (err) {
      console.log(err);
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 p-12 text-white lg:flex">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <FaFileInvoice className="text-2xl" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Invoxa</span>
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-bold leading-tight">
          Complete Business Operations Platform
          </h1>
          <p className="mt-4 max-w-md text-lg text-indigo-200">
          Streamline invoicing, client management, expense tracking, payments, and team collaboration in one dashboard.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { label: "Invoices", value: "Unlimited" },
              { label: "GST Ready", value: "18% Tax" },
              { label: "Clients", value: "Manage all" }
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur"
              >
                <p className="text-xs text-indigo-300">{label}</p>
                <p className="font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-indigo-300">
          © {new Date().getFullYear()} Invoxa. All rights reserved.
        </p>
      </div>

      <div className="flex w-full flex-col items-center justify-center bg-slate-50 px-6 py-12 lg:w-1/2">
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <FaFileInvoice className="text-2xl text-indigo-600" />
          <span className="text-xl font-bold text-slate-900">Invoxa</span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200/60"
        >
          <h2 className="text-2xl font-bold text-slate-900">Sign in</h2>
          <p className="mt-1 text-sm text-slate-500">
            Enter your credentials to access your dashboard
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="you@company.com"
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
