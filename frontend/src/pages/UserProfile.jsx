import { useEffect, useState } from "react";
import { FaUser, FaSave, FaLock } from "react-icons/fa";
import toast from "react-hot-toast";

import API from "../services/api";
import Layout from "../components/Layout";
import PageCard from "../components/PageCard";

const inputClass =
  "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

export default function UserProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await API.get("get-user-profile.php");
      if (res.data.success) {
        setName(res.data.profile.name || "");
        setEmail(res.data.profile.email || "");
        setRole(res.data.profile.role || "");
      }
    } catch (err) {
      toast.error("Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("A valid email is required");
      return;
    }

    if (password) {
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        name,
        email
      };
      if (password) {
        payload.password = password;
      }

      const res = await API.post("save-user-profile.php", payload);

      if (res.data.success) {
        toast.success("Profile updated successfully");
        // Update local storage so Layout updates header/sidebar dynamically
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setPassword("");
        setConfirmPassword("");
      } else {
        toast.error(res.data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to update user profile"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title="User Profile" subtitle="Manage your personal credentials and profile options">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">My Profile Settings</h3>
          <p className="mt-1 text-sm text-slate-500">
            Keep your credentials secure and configure your notification email.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <PageCard title="Personal Details">
            {loading ? (
              <p className="py-8 text-center text-slate-400">Loading profile...</p>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Account Role</label>
                  <input
                    type="text"
                    value={role}
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500 outline-none cursor-not-allowed uppercase font-bold"
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    Roles are assigned by the organization Owner/HR. Contact them to request permissions change.
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <h4 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <FaLock className="text-slate-400" /> Change Password (Optional)
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">New Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                  >
                    <FaSave />
                    {saving ? "Saving Changes..." : "Save Settings"}
                  </button>
                </div>
              </form>
            )}
          </PageCard>
        </div>

        <div>
          <PageCard title="Profile Summary">
            <div className="flex flex-col items-center justify-center text-center py-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-md mb-4">
                <FaUser className="text-3xl" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{name || "User Name"}</h3>
              <span className="mt-1 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700">
                {role || "Role"}
              </span>
              <p className="mt-2 text-sm text-slate-500 truncate max-w-full px-4">{email}</p>

              <div className="mt-6 w-full border-t border-slate-100 pt-4 text-left space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Permissions Level:</span>
                  <span className="font-semibold text-slate-700">
                    {role === "Owner" ? "Full Control" : role === "HR" ? "HR Management" : "Billing View/Edit"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Team Status:</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Active
                  </span>
                </div>
              </div>
            </div>
          </PageCard>
        </div>
      </div>
    </Layout>
  );
}
