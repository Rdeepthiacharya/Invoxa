import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaFileInvoice, FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import toast from "react-hot-toast";

import API from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    company_name: ""
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
    
    // Validate all fields
    if (!form.name.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!form.company_name.trim()) {
      toast.error("Company name is required");
      return;
    }
    if (!form.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!form.password) {
      toast.error("Password is required");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    setLoading(true);

    try {
      const res = await API.post("register.php", form);

      if (res.data.success) {
        toast.success("Account created! Please sign in.");
        navigate("/");
      } else {
        toast.error(res.data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong. Please try again.");
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
          Start managing your business in minutes
          </h1>
          <p className="mt-4 max-w-md text-lg text-indigo-200">
          Join Invoxa and streamline invoices, clients, payments, expenses, and team operations from one powerful platform.
          </p>
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
          <h2 className="text-2xl font-bold text-slate-900">Create account</h2>
          <p className="mt-1 text-sm text-slate-500">
            Set up your free Invoxa account
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Company Name
              </label>
              <div className="relative">
                <FaFileInvoice className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="company_name"
                  required
                  placeholder="Your Company Inc."
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  onChange={handleChange}
                />
              </div>
            </div>

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
                  minLength={8}
                  placeholder="Min. 8 characters"
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
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/"
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
