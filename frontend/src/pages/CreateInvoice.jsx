import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";

import API from "../services/api";
import Layout from "../components/Layout";
import PageCard from "../components/PageCard";
import formatCurrency, { formatCurrencyExact } from "../utils/formatCurrency";

export default function CreateInvoice() {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);

  const [invoiceData, setInvoiceData] = useState({
    client_id: "",
    due_date: "",
    currency: "INR",
    tax_rate: 18,
    discount: 0,
    discount_type: "percentage"
  });

  const [items, setItems] = useState([
    { item_name: "", quantity: 1, price: 0 }
  ]);

  const [saving, setSaving] = useState(false);

  const fetchClients = async () => {
    const res = await API.get("get-clients.php");
    setClients(res.data);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const addItem = () => {
    setItems([...items, { item_name: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce(
      (sum, item) =>
        sum + Number(item.quantity) * Number(item.price),
      0
    );
    const discVal = Number(invoiceData.discount) || 0;
    const discountAmt = invoiceData.discount_type === "percentage"
      ? (subtotal * discVal) / 100
      : discVal;
    
    const taxableAmount = Math.max(0, subtotal - discountAmt);
    const taxRate = Number(invoiceData.tax_rate) || 0;
    const tax = taxableAmount * (taxRate / 100);
    const total = taxableAmount + tax;
    
    return { subtotal, tax, total, discountAmt };
  };

  const { subtotal, tax, total, discountAmt } = calculateTotals();

  const saveInvoice = async () => {
    if (!invoiceData.client_id) {
      toast.error("Please select a client");
      return;
    }

    if (!invoiceData.due_date) {
      toast.error("Please set a due date");
      return;
    }

    if (items.some((i) => !i.item_name.trim())) {
      toast.error("All line items need a name");
      return;
    }

    if (saving) return;
    setSaving(true);

    try {
      await API.post("create-invoice.php", {
        client_id: invoiceData.client_id,
        due_date: invoiceData.due_date,
        subtotal,
        tax,
        total,
        tax_rate: invoiceData.tax_rate,
        discount: invoiceData.discount,
        discount_type: invoiceData.discount_type,
        currency: invoiceData.currency,
        items
      });

      toast.success("Invoice created successfully!");
      navigate("/invoices");
    } catch (err) {
      console.log(err);
      toast.error("Failed to create invoice");
    } finally {
      setSaving(false);
    }
  };

  const selectedClient = clients.find(
    (c) => String(c.id) === String(invoiceData.client_id)
  );

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

  return (
    <Layout
      title="Create Invoice"
      subtitle="Build and send a new invoice to your client"
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <PageCard title="Invoice Details">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Client *
                </label>
                <select
                  className={inputClass}
                  value={invoiceData.client_id}
                  onChange={(e) =>
                    setInvoiceData({
                      ...invoiceData,
                      client_id: e.target.value
                    })
                  }
                >
                  <option value="">Select client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.client_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Due Date *
                </label>
                <input
                  type="date"
                  className={inputClass}
                  value={invoiceData.due_date}
                  onChange={(e) =>
                    setInvoiceData({
                      ...invoiceData,
                      due_date: e.target.value
                    })
                  }
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Currency
                </label>
                <select
                  className={inputClass}
                  value={invoiceData.currency}
                  onChange={(e) =>
                    setInvoiceData({
                      ...invoiceData,
                      currency: e.target.value
                    })
                  }
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  className={inputClass}
                  value={invoiceData.tax_rate}
                  onChange={(e) =>
                    setInvoiceData({
                      ...invoiceData,
                      tax_rate: Number(e.target.value)
                    })
                  }
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Discount Type
                </label>
                <select
                  className={inputClass}
                  value={invoiceData.discount_type}
                  onChange={(e) =>
                    setInvoiceData({
                      ...invoiceData,
                      discount_type: e.target.value
                    })
                  }
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Amount</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Discount Value
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputClass}
                  value={invoiceData.discount}
                  onChange={(e) =>
                    setInvoiceData({
                      ...invoiceData,
                      discount: Number(e.target.value)
                    })
                  }
                />
              </div>
            </div>
          </PageCard>

          <PageCard
            title="Line Items"
            action={
              <button
                onClick={addItem}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100"
              >
                <FaPlus className="text-xs" />
                Add Item
              </button>
            }
          >
            <div className="space-y-3">
              <div className="hidden grid-cols-12 gap-3 text-xs font-semibold uppercase tracking-wide text-slate-400 sm:grid">
                <div className="col-span-5">Item</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-3">Price</div>
                <div className="col-span-2"></div>
              </div>

              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 sm:grid-cols-12 sm:items-center sm:border-0 sm:bg-transparent sm:p-0"
                >
                  <input
                    placeholder="Item name"
                    className={`${inputClass} sm:col-span-5`}
                    value={item.item_name}
                    onChange={(e) =>
                      handleItemChange(index, "item_name", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    className={`${inputClass} sm:col-span-2`}
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Price"
                    className={`${inputClass} sm:col-span-3`}
                    value={item.price}
                    onChange={(e) =>
                      handleItemChange(index, "price", e.target.value)
                    }
                  />
                  <div className="sm:col-span-2">
                    {items.length > 1 && (
                      <button
                        onClick={() => removeItem(index)}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-xs text-red-500 transition hover:bg-red-50"
                      >
                        <FaTrash />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </PageCard>
        </div>

        <div className="lg:col-span-2">
          <PageCard title="Invoice Preview" className="sticky top-24">
            <div className="rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-5">
              <div className="mb-4 border-b border-slate-100 pb-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                  Bill To
                </p>
                <p className="mt-1 font-semibold text-slate-800">
                  {selectedClient?.client_name || "Select a client"}
                </p>
                {selectedClient?.email && (
                  <p className="text-sm text-slate-500">
                    {selectedClient.email}
                  </p>
                )}
              </div>

              <div className="space-y-2 text-sm">
                {items.map((item, i) => (
                  <div key={i} className="flex justify-between text-slate-600">
                    <span>
                      {item.item_name || "Item"} × {item.quantity}
                    </span>
                    <span>
                      {formatCurrencyExact(
                        Number(item.quantity) * Number(item.price),
                        invoiceData.currency
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatCurrencyExact(subtotal, invoiceData.currency)}</span>
                </div>
                {Number(invoiceData.discount) > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>
                      Discount ({invoiceData.discount_type === "percentage" ? `${invoiceData.discount}%` : "Flat"})
                    </span>
                    <span>
                      -{formatCurrencyExact(discountAmt, invoiceData.currency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Tax ({invoiceData.tax_rate}%)</span>
                  <span>{formatCurrencyExact(tax, invoiceData.currency)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-slate-900 border-t border-dashed border-slate-200 pt-1.5">
                  <span>Total</span>
                  <span>{formatCurrencyExact(total, invoiceData.currency)}</span>
                </div>
              </div>

              {invoiceData.due_date && (
                <p className="mt-4 text-xs text-slate-400">
                  Due by{" "}
                  {new Date(invoiceData.due_date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </p>
              )}
            </div>

            <button
              onClick={saveInvoice}
              disabled={saving}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:opacity-60"
            >
              {saving ? "Creating..." : "Save Invoice"}
            </button>
          </PageCard>
        </div>
      </div>
    </Layout>
  );
}
