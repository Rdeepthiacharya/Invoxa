import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaFileInvoice, FaEye } from "react-icons/fa";
import toast from "react-hot-toast";

import API from "../services/api";
import Layout from "../components/Layout";
import PageCard from "../components/PageCard";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import formatCurrency from "../utils/formatCurrency";

export default function Invoices() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isReadOnly = user && ["Finance", "Accountant"].includes(user.role);

  const [search, setSearch] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    try {
      const res = await API.get("get-invoices.php");
      setInvoices(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const filtered = invoices.filter(
    (invoice) =>
      invoice.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      invoice.client_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout
      title="Invoices"
      subtitle="View and track all your invoices"
    >
      <PageCard
        title={`All Invoices (${filtered.length})`}
        action={
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search by invoice or client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl border border-slate-200 py-2 pl-9 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        }
      >
        {loading ? (
          <p className="py-8 text-center text-slate-400">Loading...</p>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FaFileInvoice}
            title={search ? "No matching invoices" : "No invoices yet"}
            description={
              search
                ? "Try a different search term."
                : isReadOnly
                ? "No invoices have been created yet."
                : "Create your first invoice to get started."
            }
          />

        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="pb-3 pr-4">Invoice No</th>
                  <th className="pb-3 pr-4">Client</th>
                  <th className="pb-3 pr-4">Due Date</th>
                  <th className="pb-3 pr-4">Total</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="transition hover:bg-slate-50/80"
                  >
                    <td className="py-3.5 pr-4 font-medium text-indigo-600">
                      {invoice.invoice_number}
                    </td>
                    <td className="py-3.5 pr-4 text-slate-700">
                      {invoice.client_name}
                    </td>
                    <td className="py-3.5 pr-4 text-slate-600">
                      {invoice.due_date
                        ? new Date(invoice.due_date).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                    <td className="py-3.5 pr-4 font-semibold text-slate-800">
                      {formatCurrency(invoice.total)}
                    </td>
                    <td className="py-3.5 pr-4">
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td className="py-3.5">
                      <Link
                        to={`/invoices/${invoice.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100"
                      >
                        <FaEye className="text-xs" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PageCard>
    </Layout>
  );
}
