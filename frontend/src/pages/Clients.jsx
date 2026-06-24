import { useEffect, useState } from "react";
import { FaUsers, FaTrash, FaEdit } from "react-icons/fa";
import toast from "react-hot-toast";

import API from "../services/api";
import Layout from "../components/Layout";
import PageCard from "../components/PageCard";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";

export default function Clients() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isReadOnly = user && ["Finance", "Accountant"].includes(user.role);

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    client_name: "",
    email: "",
    phone: "",
    address: ""
  });

  const [editClient, setEditClient] = useState(null);

  const fetchClients = async () => {
    try {
      const res = await API.get("get-clients.php");
      setClients(res.data);
    } catch (err) {
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleEditChange = (e) => {
    setEditClient({
      ...editClient,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("add-client.php", form);
      toast.success("Client added successfully");
      setForm({ client_name: "", email: "", phone: "", address: "" });
      fetchClients();
    } catch (err) {
      toast.error("Failed to add client");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await API.post("update-client.php", editClient);
      toast.success("Client updated successfully");
      setEditClient(null);
      fetchClients();
    } catch (err) {
      toast.error("Failed to update client");
    } finally {
      setSaving(false);
    }
  };

  const deleteClient = async (id, name) => {
    if (!window.confirm(`Delete client "${name}"?`)) return;

    try {
      await API.post("delete-client.php", { id });
      toast.success("Client deleted");
      fetchClients();
    } catch (err) {
      toast.error("Failed to delete client");
    }
  };

  const openEdit = (client) => {
    setEditClient({ ...client });
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

  return (
    <Layout title="Clients" subtitle="Manage your client directory">
      <div className="grid gap-6 lg:grid-cols-3">
        {!isReadOnly && (
          <PageCard title="Add New Client" className="lg:col-span-1">
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                name="client_name"
                placeholder="Client name *"
                value={form.client_name}
                onChange={handleChange}
                required
                className={inputClass}
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className={inputClass}
              />
              <input
                name="phone"
                placeholder="Phone"
                value={form.phone}
                onChange={handleChange}
                className={inputClass}
              />
              <input
                name="address"
                placeholder="Address"
                value={form.address}
                onChange={handleChange}
                className={inputClass}
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Add Client
              </button>
            </form>
          </PageCard>
        )}

        <PageCard
          title={`All Clients (${clients.length})`}
          className={isReadOnly ? "lg:col-span-3" : "lg:col-span-2"}
        >
          {loading ? (
            <p className="py-8 text-center text-slate-400">Loading...</p>
          ) : clients.length === 0 ? (
            <EmptyState
              icon={FaUsers}
              title="No clients yet"
              description="Add your first client using the form on the left."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Phone</th>
                    {!isReadOnly && <th className="pb-3">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {clients.map((client) => (
                    <tr
                      key={client.id}
                      className="transition hover:bg-slate-50/80"
                    >
                      <td className="py-3.5 pr-4 font-medium text-slate-800">
                        {client.client_name}
                      </td>
                      <td className="py-3.5 pr-4 text-slate-600">
                        {client.email || "—"}
                      </td>
                      <td className="py-3.5 pr-4 text-slate-600">
                        {client.phone || "—"}
                      </td>
                      {!isReadOnly && (
                        <td className="py-3.5">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEdit(client)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100"
                            >
                              <FaEdit className="text-xs" />
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                deleteClient(client.id, client.client_name)
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                            >
                              <FaTrash className="text-xs" />
                              Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </PageCard>
      </div>

      <Modal
        open={!!editClient}
        title="Edit Client"
        onClose={() => setEditClient(null)}
      >
        {editClient && (
          <form onSubmit={handleUpdate} className="space-y-3">
            <input
              name="client_name"
              placeholder="Client name *"
              value={editClient.client_name}
              onChange={handleEditChange}
              required
              className={inputClass}
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={editClient.email || ""}
              onChange={handleEditChange}
              className={inputClass}
            />
            <input
              name="phone"
              placeholder="Phone"
              value={editClient.phone || ""}
              onChange={handleEditChange}
              className={inputClass}
            />
            <input
              name="address"
              placeholder="Address"
              value={editClient.address || ""}
              onChange={handleEditChange}
              className={inputClass}
            />
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        )}
      </Modal>
    </Layout>
  );
}
