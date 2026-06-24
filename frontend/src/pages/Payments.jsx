import { useEffect, useState } from "react";
import { FaCreditCard, FaHistory } from "react-icons/fa";
import toast from "react-hot-toast";

import API from "../services/api";
import Layout from "../components/Layout";
import PageCard from "../components/PageCard";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import formatCurrency, {
  formatCurrencyExact
} from "../utils/formatCurrency";

export default function Payments() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isReadOnly = user && user.role === "Manager";

  const [activeTab, setActiveTab] = useState("outstanding"); // "outstanding" or "history"
  const [invoices, setInvoices] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Record Payment Modal State
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentDate, setPaymentDate] = useState("");
  const [recording, setRecording] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      if (activeTab === "outstanding") {
        const res = await API.get("get-pending-invoices.php");
        setInvoices(res.data);
      } else {
        const res = await API.get("get-payments.php");
        setPaymentHistory(res.data);
      }
    } catch (err) {
      toast.error("Failed to load details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [activeTab]);

  const openPaymentModal = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentAmount(invoice.balance_due);
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setPaymentMethod("Cash");
  };

  const recordPayment = async (e) => {
    e.preventDefault();

    const amt = Number(paymentAmount);
    if (!amt || amt <= 0) {
      toast.error("Please enter a positive amount");
      return;
    }

    if (amt > Number(selectedInvoice.balance_due)) {
      toast.error(`Amount exceeds remaining balance of ${formatCurrencyExact(selectedInvoice.balance_due, selectedInvoice.currency)}`);
      return;
    }

    setRecording(true);

    try {
      await API.post("add-payment.php", {
        invoice_id: selectedInvoice.id,
        amount: amt,
        payment_method: paymentMethod,
        payment_date: paymentDate
      });

      toast.success(`Payment recorded for ${selectedInvoice.invoice_number}`);
      setSelectedInvoice(null);
      fetchInvoices();
    } catch (err) {
      toast.error("Failed to record payment");
    } finally {
      setRecording(false);
    }
  };

  const pendingCount = invoices.length;

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

  return (
    <Layout
      title="Payments"
      subtitle="Record and track invoice payments"
    >
      {/* Tab Navigation */}
      <div className="mb-6 flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("outstanding")}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition ${
            activeTab === "outstanding"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <FaCreditCard className="text-xs" />
          Outstanding Invoices
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition ${
            activeTab === "history"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <FaHistory className="text-xs" />
          Payment History log
        </button>
      </div>

      {activeTab === "outstanding" ? (
        <PageCard title={`Outstanding Invoices (${pendingCount})`}>
          {loading ? (
            <p className="py-8 text-center text-slate-400">Loading...</p>
          ) : invoices.length === 0 ? (
            <EmptyState
              icon={FaCreditCard}
              title="All caught up!"
              description="No pending invoices — all payments are recorded."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <th className="pb-3 pr-4">Invoice</th>
                    <th className="pb-3 pr-4">Client</th>
                    <th className="pb-3 pr-4">Amount</th>
                    <th className="pb-3 pr-4">Balance Due</th>
                    <th className="pb-3 pr-4">Status</th>
                    {!isReadOnly && <th className="pb-3">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {invoices.map((invoice) => (
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
                      <td className="py-3.5 pr-4 font-semibold text-slate-800">
                        {formatCurrency(invoice.total, invoice.currency)}
                      </td>
                      <td className="py-3.5 pr-4 font-semibold text-amber-600">
                        {formatCurrencyExact(invoice.balance_due, invoice.currency)}
                      </td>
                      <td className="py-3.5 pr-4">
                        <StatusBadge status={invoice.status} />
                      </td>
                      {!isReadOnly && (
                        <td className="py-3.5">
                          <button
                            onClick={() => openPaymentModal(invoice)}
                            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                          >
                            Record Payment
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </PageCard>
      ) : (
        <PageCard title="Payment History log">
          {loading ? (
            <p className="py-8 text-center text-slate-400">Loading...</p>
          ) : paymentHistory.length === 0 ? (
            <EmptyState
              icon={FaHistory}
              title="No transactions yet"
              description="Record payments on outstanding invoices to see transaction details here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 pr-4">Invoice</th>
                    <th className="pb-3 pr-4">Client</th>
                    <th className="pb-3 pr-4">Method</th>
                    <th className="pb-3 text-right">Amount Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paymentHistory.map((history) => (
                    <tr
                      key={history.id}
                      className="transition hover:bg-slate-50/80"
                    >
                      <td className="py-3.5 pr-4 text-slate-600">
                        {new Date(history.payment_date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>
                      <td className="py-3.5 pr-4 font-medium text-indigo-600">
                        {history.invoice_number}
                      </td>
                      <td className="py-3.5 pr-4 text-slate-700">
                        {history.client_name}
                      </td>
                      <td className="py-3.5 pr-4 text-slate-600">
                        {history.payment_method}
                      </td>
                      <td className="py-3.5 text-right font-semibold text-emerald-600">
                        {formatCurrencyExact(history.amount_paid, history.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </PageCard>
      )}

      {/* Record Payment Modal */}
      {selectedInvoice && (
        <Modal
          open={!!selectedInvoice}
          title={`Record Payment - ${selectedInvoice.invoice_number}`}
          onClose={() => setSelectedInvoice(null)}
        >
          <form onSubmit={recordPayment} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Amount Paid ({selectedInvoice.currency || "INR"})
              </label>
              <input
                type="number"
                min="0.01"
                max={selectedInvoice.balance_due}
                step="0.01"
                required
                className={inputClass}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Maximum outstanding: {formatCurrencyExact(selectedInvoice.balance_due, selectedInvoice.currency)}
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Payment Method
              </label>
              <select
                className={inputClass}
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="UPI">UPI</option>
                <option value="Credit Card">Credit Card</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Payment Date
              </label>
              <input
                type="date"
                required
                className={inputClass}
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={recording}
              className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {recording ? "Recording..." : "Submit Payment"}
            </button>
          </form>
        </Modal>
      )}
    </Layout>
  );
}
