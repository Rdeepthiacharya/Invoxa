import { useEffect, useState } from "react";
import { FaUsersCog, FaPlus, FaTrash, FaUserShield, FaExclamationTriangle, FaEdit, FaCheckCircle, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";

import API from "../services/api";
import Layout from "../components/Layout";
import PageCard from "../components/PageCard";

const inputClass =
  "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

export default function TeamManagement() {
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const isAuthorized = currentUser && ["Owner", "HR", "HR Manager", "Manager"].includes(currentUser.role);
  const isOwner = currentUser?.role === "Owner";
  const isReadOnly = currentUser?.role === "Manager";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingUser, setAddingUser] = useState(false);

  // New User Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Operations");

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editingSaving, setEditingSaving] = useState(false);

  // Change Role Modal State
  const [roleChangeUser, setRoleChangeUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [roleChanging, setRoleChanging] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get("get-users.php");
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      toast.error("Failed to fetch team list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchUsers();
    }
  }, [isAuthorized]);

  const handleAddUser = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("A valid email is required");
      return;
    }

    if (!password || password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setAddingUser(true);
    try {
      const res = await API.post("add-user.php", {
        name,
        email,
        password,
        role
      });

      if (res.data.success) {
        toast.success("Team member added successfully");
        setName("");
        setEmail("");
        setPassword("");
        setRole("Operations");
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add team member");
    } finally {
      setAddingUser(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!editEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail)) {
      toast.error("A valid email is required");
      return;
    }

    setEditingSaving(true);
    try {
      const res = await API.post("update-user.php", {
        id: editingUser.id,
        name: editName,
        email: editEmail
      });

      if (res.data.success) {
        toast.success("User information updated successfully");
        setEditingUser(null);
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update user");
    } finally {
      setEditingSaving(false);
    }
  };

  const handleChangeRole = (user) => {
    setRoleChangeUser(user);
    setNewRole(user.role);
  };

  const handleSaveRoleChange = async () => {
    if (newRole === roleChangeUser.role) {
      toast.info("No role change needed");
      setRoleChangeUser(null);
      return;
    }

    setRoleChanging(true);
    try {
      const res = await API.post("update-user-role.php", {
        id: roleChangeUser.id,
        role: newRole
      });

      if (res.data.success) {
        toast.success("User role updated successfully");
        setRoleChangeUser(null);
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update role");
    } finally {
      setRoleChanging(false);
    }
  };

  const handleDeleteUser = async (userId, userName, userRole) => {
    if (userId === currentUser.id) {
      toast.error("You cannot delete your own account");
      return;
    }

    if (currentUser.role === "HR" && userRole === "Owner") {
      toast.error("HR managers cannot delete Owner accounts");
      return;
    }

    if (!window.confirm(`Are you sure you want to remove ${userName} from the team?`)) {
      return;
    }

    try {
      const res = await API.post("delete-user.php", { id: userId });
      if (res.data.success) {
        toast.success("Team member removed");
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete team member");
    }
  };

  if (!isAuthorized) {
    return (
      <Layout title="Access Denied" subtitle="Insufficient Permissions">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-16 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 mb-4">
            <FaExclamationTriangle className="text-3xl" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
          <p className="mt-2 text-sm text-slate-500 max-w-md">
            Only organization **Owners**, **HR Managers**, or **Managers** can view team members. 
            If you believe this is in error, contact your business administrator.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Team Management" subtitle="Manage members of your organization and their access roles">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Team & Permissions</h3>
          <p className="mt-1 text-sm text-slate-500">
            Invite colleagues and set roles: Owner (admin), HR Manager (staff), Manager (invoices), Sales, Finance, Operations, Support, or Accountant (billing).
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className={isReadOnly ? "lg:col-span-3" : "lg:col-span-2"}>
          <PageCard title="Active Team Members">
            {loading ? (
              <p className="py-8 text-center text-slate-400">Loading team members...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <th className="pb-3 pr-4">Name</th>
                      <th className="pb-3 pr-4">Email</th>
                      <th className="pb-3 pr-4">Role</th>
                      {!isReadOnly && <th className="pb-3 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => {
                      const isSelf = u.id === currentUser.id;
                      const isOwner = u.role === "Owner";
                      const hrCantDeleteOwner = currentUser.role === "HR" && isOwner;

                      return (
                        <tr key={u.id} className="group hover:bg-slate-50/50">
                          <td className="py-4 pr-4 font-semibold text-slate-900 flex items-center gap-2">
                            {u.name} {isSelf && <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-normal">You</span>}
                          </td>
                          <td className="py-4 pr-4 text-slate-500">{u.email}</td>
                          <td className="py-4 pr-4">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${
                                u.role === "Owner"
                                  ? "bg-purple-50 text-purple-700"
                                  : u.role === "HR"
                                  ? "bg-indigo-50 text-indigo-700"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              <FaUserShield className="text-[10px]" />
                              {u.role}
                            </span>
                          </td>
                          {!isReadOnly && (
                            <td className="py-4 text-right flex items-center justify-end gap-2">
                              {!isSelf && (
                                <>
                                  <button
                                    onClick={() => handleEditUser(u)}
                                    className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition"
                                    title="Edit user information"
                                  >
                                    <FaEdit />
                                  </button>
                                  {isOwner && !isSelf && (
                                    <button
                                      onClick={() => handleChangeRole(u)}
                                      className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition"
                                      title="Change user role"
                                    >
                                      <FaUserShield />
                                    </button>
                                  )}
                                </>
                              )}
                              {!isSelf && !hrCantDeleteOwner && (
                                <button
                                  onClick={() => handleDeleteUser(u.id, u.name, u.role)}
                                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                                  title="Remove user"
                                >
                                  <FaTrash />
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </PageCard>
        </div>

        {!isReadOnly && (
          <div>
            <PageCard title="Add Team Member">
              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Jane Doe"
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
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Initial Password</label>
                  <input
                    type="password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Access Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className={inputClass}
                  >
                    <option value="Owner">Owner (Full admin privileges)</option>
                    <option value="HR Manager">HR Manager (Manage team & staff)</option>
                    <option value="Manager">Manager (Invoices & clients)</option>
                    <option value="Sales">Sales (Manage clients & invoices)</option>
                    <option value="Finance">Finance (Payments & expenses)</option>
                    <option value="Accountant">Accountant (Billing only)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={addingUser}
                  className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60 shadow-md"
                >
                  <FaPlus />
                  {addingUser ? "Adding Member..." : "Add to Team"}
                </button>
              </form>
            </PageCard>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Edit User Information</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSaveEdit}
                  disabled={editingSaving}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                >
                  <FaCheckCircle />
                  {editingSaving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
                >
                  <FaTimes />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {roleChangeUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Change User Role</h2>
            <p className="text-sm text-slate-600 mb-4">Updating role for <strong>{roleChangeUser.name}</strong></p>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">New Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className={inputClass}
                >
                  <option value="Owner">Owner (Full admin privileges)</option>
                  <option value="HR Manager">HR Manager (Manage team & staff)</option>
                  <option value="Manager">Manager (Invoices & clients)</option>
                  <option value="Sales">Sales (Manage clients & invoices)</option>
                  <option value="Finance">Finance (Payments & expenses)</option>
                  <option value="Accountant">Accountant (Billing only)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSaveRoleChange}
                  disabled={roleChanging}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                >
                  <FaCheckCircle />
                  {roleChanging ? "Updating..." : "Update Role"}
                </button>
                <button
                  onClick={() => setRoleChangeUser(null)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
                >
                  <FaTimes />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
