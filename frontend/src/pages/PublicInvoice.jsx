import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaDownload, FaPrint, FaFileInvoice } from "react-icons/fa";
import toast from "react-hot-toast";

import API from "../services/api";
import PageCard from "../components/PageCard";
import StatusBadge from "../components/StatusBadge";
import formatCurrency, {
  formatCurrencyExact
} from "../utils/formatCurrency";
import exportInvoicePdf from "../utils/exportInvoicePdf";

export default function PublicInvoice() {
  const { token } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [items, setItems] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [companyProfile, setCompanyProfile] = useState(null);

  const fetchInvoice = async () => {
    try {
      const res = await API.get(`get-public-invoice.php?token=${token}`);
      if (res.data.success) {
        setInvoice(res.data.invoice);
        setItems(res.data.items);
        setPayments(res.data.payments || []);
        setCompanyProfile(
          res.data.company_profile && typeof res.data.company_profile === "object" && !Array.isArray(res.data.company_profile)
            ? res.data.company_profile
            : null
        );
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
  }, [token]);

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 font-sans">
        <p className="text-slate-500">Loading invoice details...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 font-sans">
        <div className="w-full max-w-md text-center">
          <FaFileInvoice className="mx-auto mb-4 text-4xl text-slate-300" />
          <h2 className="text-xl font-bold text-slate-800">Invoice Not Found</h2>
          <p className="mt-2 text-sm text-slate-500">
            This invoice link is invalid or the invoice has been deleted.
          </p>
        </div>
      </div>
    );
  }

  const cur = invoice.currency || "INR";
  const taxRate = Number(invoice.tax_rate) || 0;
  const discountVal = Number(invoice.discount) || 0;
  const discountAmt =
    invoice.discount_type === "percentage"
      ? (Number(invoice.subtotal) * discountVal) / 100
      : discountVal;

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans text-slate-800 antialiased sm:px-6 lg:px-8 print:bg-white print:py-0 print:px-0">
      {/* Inject custom print styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          /* Hide action bar and layout decorations for print */
          .print\\:hidden, 
          header, 
          nav, 
          button {
            display: none !important;
          }
          
          body {
            background: white !important;
            color: black !important;
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
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-scheme: light !important;
          }
        }
      `}} />

      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm border border-slate-100 print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-white">
              <FaFileInvoice className="text-lg" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">{invoice.invoice_number}</h2>
              <p className="text-xs text-slate-500">Client Portal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-900"
            >
              <FaDownload className="text-xs" />
              Download PDF
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <FaPrint className="text-xs" />
              Print
            </button>
          </div>
        </div>

        {/* Invoice Card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm print:no-shadow">
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
                  <div className="rounded-xl border border-slate-250 bg-slate-50/50 p-4 text-xs text-slate-500 space-y-1.5 print:border-slate-300 print:bg-transparent">
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
      </div>
    </div>
  );
}
