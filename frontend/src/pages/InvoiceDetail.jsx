import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaDownload,
  FaPrint,
  FaShareAlt,
  FaCreditCard
} from "react-icons/fa";
import toast from "react-hot-toast";

import API from "../services/api";
import Layout from "../components/Layout";
import PageCard from "../components/PageCard";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import formatCurrency, {
  formatCurrencyExact
} from "../utils/formatCurrency";
import exportInvoicePdf from "../utils/exportInvoicePdf";

export default function InvoiceDetail() {
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isSales = user?.role === "Sales";

  const [invoice, setInvoice] = useState(null);
  const [items, setItems] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Record Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentDate, setPaymentDate] = useState("");
  const [recording, setRecording] = useState(false);

  const [companyProfile, setCompanyProfile] = useState(null);

  const fetchInvoice = async () => {
    try {
      const res = await API.get(`get-invoice-detail.php?id=${id}`);

      if (res.data.success) {
        setInvoice(res.data.invoice);
        setItems(res.data.items);
        setPayments(res.data.payments || []);
        setCompanyProfile(
          res.data.company_profile && typeof res.data.company_profile === "object" && !Array.isArray(res.data.company_profile)
            ? res.data.company_profile
            : null
        );
        setPaymentAmount(res.data.invoice.balance_due);
        setPaymentDate(new Date().toISOString().split("T")[0]);
      } else {
        toast.error(res.data.message || "Invoice not found");
      }
    } catch (err) {
      toast.error("Failed to load invoice");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const handleDownloadPdf = async () => {
    if (!invoice) {
      toast.error("No invoice selected for PDF export.");
      return;
    }

    try {
      await exportInvoicePdf(invoice, items, companyProfile, payments);
      toast.success("PDF downloaded");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareLink = () => {
    if (!invoice?.public_token) {
      toast.error("Unable to generate share link.");
      return;
    }

    const publicUrl = new URL(`/public/invoice/${invoice.public_token}`, window.location.origin).toString();
    navigator.clipboard.writeText(publicUrl);
    toast.success("Shareable client portal link copied!");
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();

    const amt = Number(paymentAmount);
    if (!amt || amt <= 0) {
      toast.error("Please enter a positive amount");
      return;
    }

    if (amt > Number(invoice.balance_due)) {
      toast.error(`Amount exceeds remaining balance of ${formatCurrencyExact(invoice.balance_due, invoice.currency)}`);
      return;
    }

    setRecording(true);

    try {
      const res = await API.post("add-payment.php", {
        invoice_id: Number(id),
        amount: amt,
        payment_method: paymentMethod,
        payment_date: paymentDate
      });

      if (res.data.success) {
        toast.success(`Recorded payment of ${formatCurrencyExact(amt, invoice.currency)}`);
        setIsPaymentModalOpen(false);
        fetchInvoice();
      }
    } catch (err) {
      toast.error("Failed to record payment");
    } finally {
      setRecording(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Invoice" subtitle="Loading invoice details...">
        <p className="py-12 text-center text-slate-400">Loading...</p>
      </Layout>
    );
  }

  if (!invoice) {
    return (
      <Layout title="Invoice Not Found" subtitle="">
        <PageCard>
          <p className="py-8 text-center text-slate-500">
            This invoice doesn't exist or you don't have access.
          </p>
          <Link
            to="/invoices"
            className="mx-auto block w-fit text-sm font-semibold text-indigo-600"
          >
            ← Back to invoices
          </Link>
        </PageCard>
      </Layout>
    );
  }

  const cur = invoice.currency || "INR";
  const taxRate = Number(invoice.tax_rate) || 0;
  const discountVal = Number(invoice.discount) || 0;
  const discountAmt =
    invoice.discount_type === "percentage"
      ? (Number(invoice.subtotal) * discountVal) / 100
      : discountVal;

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <Layout
      title={invoice.invoice_number}
      subtitle={`Invoice for ${invoice.client_name}`}
    >
      {/* Inject custom print styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          /* Hide app sidebar, header, navigation, and buttons */
          .print\\:hidden, 
          header, 
          nav, 
          aside,
          button,
          a {
            display: none !important;
          }
          
          /* Full page layout for print */
          body {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          
          main {
            padding: 0 !important;
            margin: 0 !important;
          }

          .print\\:no-shadow {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
          }
          
          #invoice-print {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          
          /* High contrast colors for print */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-scheme: light !important;
          }
        }
      `}} />

      <div className="mb-6 flex flex-wrap items-center gap-3 print:hidden">
        <Link
          to="/invoices"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <FaArrowLeft className="text-xs" />
          Back
        </Link>

        <button
          onClick={handleDownloadPdf}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-900"
        >
          <FaDownload className="text-xs" />
          Download PDF
        </button>

        <button
          onClick={handleShareLink}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <FaShareAlt className="text-xs" />
          Share Link
        </button>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <FaPrint className="text-xs" />
          Print
        </button>

        {!isSales && invoice.status !== "Paid" && (
          <button
            onClick={() => {
              setPaymentAmount(invoice.balance_due);
              setIsPaymentModalOpen(true);
            }}
            className="ml-auto inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <FaCreditCard className="text-xs" />
            Record Payment
          </button>
        )}
      </div>

      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-sm print:no-shadow">
        {/* Top Accent Strip */}
        <div className="h-2 w-full rounded-t-2xl bg-slate-800 print:hidden" />

        <div id="invoice-print" className="p-8 sm:p-12 print:p-0 space-y-10">
          
          {/* Header Block: Logo & Company details + Invoice Metadata */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between border-b border-slate-100 pb-8">
            <div className="space-y-4">
              {companyProfile?.logo_url ? (
                <img
                  src={companyProfile.logo_url}
                  alt="Company Logo"
                  className="h-14 w-auto max-w-[200px] object-contain print:h-12"
                />
              ) : companyProfile?.company_name ? (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-bold text-lg print:border print:border-slate-300">
                  {companyProfile.company_name.substring(0, 2).toUpperCase()}
                </div>
              ) : null}

              <div className="space-y-1 text-sm text-slate-600">
                {companyProfile?.company_name ? (
                  <>
                    <h2 className="text-lg font-bold text-slate-900">{companyProfile.company_name}</h2>
                    {companyProfile.address && <p className="whitespace-pre-line leading-relaxed">{companyProfile.address}</p>}
                    {companyProfile.country && <p>{companyProfile.country}</p>}
                    {companyProfile.contact && <p className="text-xs text-slate-500">Contact: {companyProfile.contact}</p>}
                    {companyProfile.email && <p>Email: {companyProfile.email}</p>}
                    {companyProfile.website && <p>Web: {companyProfile.website}</p>}
                    {companyProfile.tax_id && (
                      <p className="mt-2 text-xs font-semibold text-slate-700 uppercase">
                        Tax ID / GSTIN: {companyProfile.tax_id}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <h2 className="text-lg font-bold text-slate-900">{invoice.issuer_name}</h2>
                    <p>Email: {invoice.issuer_email}</p>
                  </>
                )}
              </div>
            </div>

            <div className="text-left sm:text-right space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Document
                </span>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 mt-0.5">
                  INVOICE
                </h1>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:flex sm:flex-col sm:items-end">
                <div className="sm:text-right">
                  <span className="text-xs font-semibold text-slate-400 block sm:inline">Invoice No:</span>
                  <span className="font-bold text-slate-800 ml-1">{invoice.invoice_number}</span>
                </div>
                <div className="sm:text-right">
                  <span className="text-xs font-semibold text-slate-400 block sm:inline">Issue Date:</span>
                  <span className="text-slate-700 ml-1">{formatDate(invoice.invoice_date || invoice.created_at)}</span>
                </div>
                <div className="sm:text-right">
                  <span className="text-xs font-semibold text-slate-400 block sm:inline">Due Date:</span>
                  <span className="text-slate-700 ml-1">{formatDate(invoice.due_date)}</span>
                </div>
                <div className="sm:text-right">
                  <span className="text-xs font-semibold text-slate-400 block sm:inline mr-1">Status:</span>
                  <StatusBadge status={invoice.status} />
                </div>
              </div>
            </div>
          </div>

          {/* Client Details Section (BILL TO) */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              BILL TO
            </h3>
            <div className="text-sm text-slate-600 space-y-1">
              <p className="font-bold text-slate-900 text-base">{invoice.client_name}</p>
              {invoice.client_email && <p>Email: {invoice.client_email}</p>}
              {invoice.client_phone && <p>Phone: {invoice.client_phone}</p>}
              {invoice.client_address && (
                <p className="whitespace-pre-line leading-relaxed mt-1">{invoice.client_address}</p>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-slate-200 print:border-slate-300">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-100 print:bg-slate-100 print:text-slate-800 border-b border-slate-200">
                    <th className="py-3 px-4">Item Description</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Unit Price</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 print:divide-slate-200">
                  {items.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-4 font-semibold text-slate-800 leading-normal">
                        {item.item_name}
                      </td>
                      <td className="py-4 px-4 text-center text-slate-600 font-medium">
                        {item.quantity}
                      </td>
                      <td className="py-4 px-4 text-right text-slate-600">
                        {formatCurrencyExact(item.price, cur)}
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-slate-800">
                        {formatCurrencyExact(item.total, cur)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals & Notes Section */}
          <div className="grid gap-8 sm:grid-cols-2 pt-4">
            
            {/* Left side: Notes & Terms */}
            <div className="space-y-4">
              {companyProfile?.extra_info && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs text-slate-500 space-y-1.5 print:border-slate-300 print:bg-transparent">
                  <p className="font-bold text-slate-700 uppercase tracking-widest text-[9px]">
                    Payment Instructions & Terms
                  </p>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {companyProfile.extra_info}
                  </p>
                </div>
              )}
            </div>

            {/* Right side: Summary Calculations */}
            <div className="space-y-3">
              <dl className="space-y-2.5 text-sm text-slate-600">
                <div className="flex justify-between items-center">
                  <dt className="text-slate-500">Subtotal</dt>
                  <dd className="font-semibold text-slate-800">
                    {formatCurrencyExact(invoice.subtotal, cur)}
                  </dd>
                </div>
                
                {discountVal > 0 && (
                  <div className="flex justify-between items-center text-rose-600">
                    <dt>
                      Discount ({invoice.discount_type === "percentage" ? `${invoice.discount}%` : "Flat"})
                    </dt>
                    <dd className="font-bold">
                      -{formatCurrencyExact(discountAmt, cur)}
                    </dd>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <dt className="text-slate-500">Tax ({taxRate}%)</dt>
                  <dd className="font-semibold text-slate-800">
                    {formatCurrencyExact(invoice.tax, cur)}
                  </dd>
                </div>
                
                <div className="flex justify-between items-center border-t border-slate-200 pt-3 text-base">
                  <dt className="font-bold text-slate-900">Total</dt>
                  <dd className="font-black text-slate-900 text-lg">
                    {formatCurrency(invoice.total, cur)}
                  </dd>
                </div>

                {Number(invoice.total_paid) > 0 && (
                  <>
                    <div className="flex justify-between items-center text-emerald-600 pt-1">
                      <dt className="text-xs font-semibold">Total Paid</dt>
                      <dd className="font-bold text-sm">
                        {formatCurrencyExact(invoice.total_paid, cur)}
                      </dd>
                    </div>
                    <div className="flex justify-between items-center border-t border-dashed border-slate-200 pt-2 text-base">
                      <dt className="font-bold text-slate-900">Balance Due</dt>
                      <dd className="font-black text-slate-900 text-lg">
                        {formatCurrency(invoice.balance_due, cur)}
                      </dd>
                    </div>
                  </>
                )}
              </dl>
            </div>
          </div>

          {/* Transactions Log (only if payments exist) */}
          {payments.length > 0 && (
            <div className="border-t border-slate-100 pt-8 print:hidden">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                TRANSACTION HISTORY
              </h3>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Payment Method</th>
                      <th className="py-2.5 px-4 text-right">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/30">
                        <td className="py-3 px-4 text-slate-600">
                          {formatDate(p.payment_date)}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">
                          {p.payment_method}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-600">
                          {formatCurrencyExact(p.amount_paid, cur)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Simple document thank you footer */}
          <div className="text-center pt-8 border-t border-slate-100">
            <p className="text-xs text-slate-400 italic">Thank you for your business!</p>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal
        open={isPaymentModalOpen}
        title="Record Payment"
        onClose={() => setIsPaymentModalOpen(false)}
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              Amount Paid ({cur})
            </label>
            <input
              type="number"
              min="0.01"
              max={invoice.balance_due}
              step="0.01"
              required
              className={inputClass}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Maximum outstanding: {formatCurrencyExact(invoice.balance_due, cur)}
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
    </Layout>
  );
}
