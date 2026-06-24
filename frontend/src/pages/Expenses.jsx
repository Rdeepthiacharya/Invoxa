import { useEffect, useState } from "react";
import { FaPlusCircle, FaReceipt } from "react-icons/fa";
import toast from "react-hot-toast";

import API from "../services/api";
import Layout from "../components/Layout";
import PageCard from "../components/PageCard";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import formatCurrency from "../utils/formatCurrency";

export default function Expenses() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isReadOnly = user && user.role === "Manager";

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await API.get("get-expenses.php");
      if (Array.isArray(res.data)) {
        setExpenses(res.data);
      } else if (res.data && res.data.success === false) {
        toast.error(res.data.message || "Failed to load expenses");
        setExpenses([]);
      } else {
        // unexpected shape - coerce to empty array to avoid crash
        setExpenses([]);
      }
    } catch (err) {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const openModal = () => {
    setExpenseDate(new Date().toISOString().split("T")[0]);
    setCategory("");
    setDescription("");
    setAmount("");
    setModalOpen(true);
  };

  const saveExpense = async (e) => {
    e.preventDefault();

    const amt = Number(amount);
    if (!expenseDate || !category || amt <= 0) {
      toast.error("Enter a valid date, category and amount");
      return;
    }

    setSaving(true);

    try {
      await API.post("add-expense.php", {
        expense_date: expenseDate,
        category,
        description,
        amount: amt
      });

      toast.success("Expense recorded");
      setModalOpen(false);
      fetchExpenses();
    } catch (err) {
      toast.error("Failed to save expense");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title="Expenses" subtitle="Track business expenses and view profit margin">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Expenses</h3>
          <p className="mt-1 text-sm text-slate-500">
            Add business costs and keep profit insights accurate.
          </p>
        </div>
        {!isReadOnly && (
          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <FaPlusCircle />
            Add Expense
          </button>
        )}
      </div>

      <PageCard title={`All Expenses (${expenses.length})`} action={null}>
        {loading ? (
          <p className="py-8 text-center text-slate-400">Loading...</p>
        ) : expenses.length === 0 ? (
          <EmptyState
            icon={FaReceipt}
            title="No expenses yet"
            description="Record your first expense to see profit calculations."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Category</th>
                  <th className="pb-3 pr-4">Description</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="group hover:bg-slate-50/80">
                    <td className="py-3 pr-4 text-slate-700">
                      {new Date(expense.expense_date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>
                    <td className="py-3 pr-4 font-semibold text-slate-800">
                      {expense.category}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {expense.description || "—"}
                    </td>
                    <td className="py-3 text-right font-semibold text-rose-600">
                      {formatCurrency(expense.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PageCard>

      {modalOpen && (
        <Modal open={modalOpen} title="Add Expense" onClose={() => setModalOpen(false)}>
          <form onSubmit={saveExpense} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">Date</label>
              <input
                type="date"
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">Category</label>
              <input
                type="text"
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Office, Marketing, Travel..."
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">Description</label>
              <textarea
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional note about the expense"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">Amount</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Expense"}
            </button>
          </form>
        </Modal>
      )}
    </Layout>
  );
}
