import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function pdfCurrency(amount, currency = "INR") {
  const code = (currency || "INR").toUpperCase();
  let prefix = `${code} `;
  if (code === "USD") prefix = "$";
  else if (code === "EUR") prefix = "€";
  else if (code === "GBP") prefix = "£";
  else if (code === "INR") prefix = "Rs. ";
  
  return `${prefix}${Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getImageFormatFromDataUrl(dataUrl) {
  const match = dataUrl.match(/^data:image\/(png|jpeg|jpg|gif);base64,/i);
  return match ? match[1].toUpperCase().replace("JPG", "JPEG") : "PNG";
}

async function fetchImageDataUrl(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load image ${url}`);
  }
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

export default async function exportInvoicePdf(invoice, items, profile = {}, payments = []) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const cur = invoice.currency || "INR";
  let y = 14;

  const {
    company_name = "",
    logo_url = "",
    address = "",
    country = "",
    contact = "",
    email = "",
    website = "",
    tax_id = "",
    extra_info = "",
  } = profile;

  // 1. Draw Subtle Top Border Line (Professional Accent)
  doc.setDrawColor(30, 41, 59); // Slate-800
  doc.setLineWidth(2.5);
  doc.line(14, y, pageWidth - 14, y);
  y += 10;

  // 2. Draw Company Logo (if available)
  let logoHeightProgress = 0;
  if (logo_url) {
    try {
      const imageDataUrl = await fetchImageDataUrl(logo_url);
      const imageFormat = getImageFormatFromDataUrl(imageDataUrl);

      // Load image in memory to extract proportions
      const img = new Image();
      img.src = imageDataUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const maxW = 45;
      const maxH = 20;
      let w = maxW;
      let h = (img.height / img.width) * maxW;
      if (h > maxH) {
        h = maxH;
        w = (img.width / img.height) * maxH;
      }
      doc.addImage(imageDataUrl, imageFormat, 14, y, w, h);
      logoHeightProgress = h + 6;
    } catch (err) {
      console.error("Failed to render logo on PDF:", err);
    }
  }

  // 3. Header Grid Layout (Company details on the left, Invoice Metadata on the right)
  let leftY = y + logoHeightProgress;
  let rightY = y;

  // Left Column - Company Information
  doc.setTextColor(15, 23, 42); // Slate-900
  if (company_name) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(company_name, 14, leftY);
    leftY += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105); // Slate-600

    const profileLines = [
      address,
      country,
      contact ? `Contact: ${contact}` : "",
      email ? `Email: ${email}` : "",
      website ? `Website: ${website}` : "",
      tax_id ? `Tax ID / GSTIN: ${tax_id}` : "",
    ].filter(Boolean);

    profileLines.forEach((line) => {
      // Split line if it runs too wide
      const lines = doc.splitTextToSize(line, pageWidth / 2 - 20);
      lines.forEach((l) => {
        doc.text(l, 14, leftY);
        leftY += 5;
      });
    });
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(invoice.issuer_name || "Issuer Details", 14, leftY);
    leftY += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(invoice.issuer_email || "", 14, leftY);
    leftY += 5;
  }

  // Right Column - Invoice Title & Metadata
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("INVOICE", pageWidth - 14, rightY + 6, { align: "right" });
  rightY += 14;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // Slate-600

  const metaItems = [
    { key: "Invoice No:", val: invoice.invoice_number },
    { key: "Issue Date:", val: formatDate(invoice.invoice_date || invoice.created_at) },
    { key: "Due Date:", val: formatDate(invoice.due_date) },
    { key: "Status:", val: invoice.status }
  ];

  metaItems.forEach((item) => {
    // Label right-aligned to a center-right alignment point
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139); // Slate-400
    doc.text(item.key, pageWidth - 60, rightY, { align: "right" });

    // Value left-aligned with small padding to avoid overlapping
    if (item.key === "Status:") {
      doc.setFont("helvetica", "bold");
      if (item.val === "Paid") doc.setTextColor(16, 185, 129); // Emerald-500
      else if (item.val === "Overdue") doc.setTextColor(239, 68, 68); // Red-500
      else doc.setTextColor(245, 158, 11); // Amber-500
    } else {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42); // Slate-900
    }
    doc.text(item.val, pageWidth - 56, rightY, { align: "left" });
    rightY += 5.5;
  });

  // Align vertical progress after header
  y = Math.max(leftY, rightY) + 8;

  // 4. Billing Block (Bill To)
  doc.setDrawColor(241, 245, 249); // Slate-100
  doc.setLineWidth(0.5);
  doc.line(14, y, pageWidth - 14, y);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text("BILL TO", 14, y);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text(invoice.client_name, 14, y);
  y += 5.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // Slate-600

  if (invoice.client_email) {
    doc.text(invoice.client_email, 14, y);
    y += 5;
  }
  if (invoice.client_phone) {
    doc.text(invoice.client_phone, 14, y);
    y += 5;
  }
  if (invoice.client_address) {
    const addrLines = doc.splitTextToSize(invoice.client_address, 100);
    addrLines.forEach((line) => {
      doc.text(line, 14, y);
      y += 5;
    });
  }
  y += 6;

  // 5. Line Items Table (Header has Amount instead of Total)
  autoTable(doc, {
    startY: y,
    head: [["Item Description", "Qty", "Unit Price", "Amount"]],
    body: items.map((item) => [
      item.item_name,
      item.quantity,
      pdfCurrency(item.price, cur),
      pdfCurrency(item.total, cur),
    ]),
    headStyles: {
      fillColor: [30, 41, 59], // Slate-800
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9.5,
      cellPadding: 4,
    },
    columnStyles: {
      0: { halign: "left" },
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right" },
    },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      textColor: [51, 65, 85],
      lineColor: [241, 245, 249],
      lineWidth: 0.5,
    },
    margin: { left: 14, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 8;

  // Prevent bottom spillover
  if (y + 55 > pageHeight) {
    doc.addPage();
    y = 20;
  }

  const startSummaryY = y;
  let summaryLeftY = startSummaryY;
  let summaryRightY = startSummaryY;

  // 6. Left side of Summary: Payment details & Notes
  const leftWidth = pageWidth / 2 - 18;
  if (extra_info) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text("PAYMENT INSTRUCTIONS & TERMS", 14, summaryLeftY);
    summaryLeftY += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139); // Slate-500

    const notesLines = doc.splitTextToSize(extra_info, leftWidth);
    notesLines.forEach((line) => {
      doc.text(line, 14, summaryLeftY);
      summaryLeftY += 4.5;
    });
  }

  // 7. Right side of Summary: Subtotal, Taxes, Discount, Grand Total
  const rightColX = pageWidth - 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // Slate-600

  // Subtotal (No colon)
  doc.text("Subtotal", pageWidth - 70, summaryRightY);
  doc.text(pdfCurrency(invoice.subtotal, cur), rightColX, summaryRightY, { align: "right" });
  summaryRightY += 5.5;

  // Discount (if any)
  const discountVal = Number(invoice.discount) || 0;
  if (discountVal > 0) {
    let discountText = "";
    let discountAmt = 0;
    if (invoice.discount_type === "percentage") {
      discountText = `Discount (${invoice.discount}%)`;
      discountAmt = (Number(invoice.subtotal) * discountVal) / 100;
    } else {
      discountText = `Discount (Flat)`;
      discountAmt = discountVal;
    }
    doc.text(discountText, pageWidth - 70, summaryRightY);
    doc.setTextColor(225, 29, 72); // Rose-600
    doc.text(`-${pdfCurrency(discountAmt, cur)}`, rightColX, summaryRightY, { align: "right" });
    doc.setTextColor(71, 85, 105);
    summaryRightY += 5.5;
  }

  // Tax (No colon)
  const taxRate = Number(invoice.tax_rate) || 0;
  doc.text(`Tax (${taxRate}%)`, pageWidth - 70, summaryRightY);
  doc.text(pdfCurrency(invoice.tax, cur), rightColX, summaryRightY, { align: "right" });
  summaryRightY += 6.5;

  // Divider line before Grand Total
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setLineWidth(0.5);
  doc.line(pageWidth - 70, summaryRightY - 2, rightColX, summaryRightY - 2);

  // Grand Total (No colon)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text("Total", pageWidth - 70, summaryRightY);
  doc.text(pdfCurrency(invoice.total, cur), rightColX, summaryRightY, { align: "right" });
  summaryRightY += 6.5;

  // Payments & Balance Due (if payment recorded, No colons)
  if (Number(invoice.total_paid) > 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text("Total Paid", pageWidth - 70, summaryRightY);
    doc.setTextColor(16, 185, 129); // Emerald-500
    doc.text(pdfCurrency(invoice.total_paid, cur), rightColX, summaryRightY, { align: "right" });
    summaryRightY += 5.5;

    doc.setDrawColor(241, 245, 249);
    doc.line(pageWidth - 70, summaryRightY - 2, rightColX, summaryRightY - 2);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Balance Due", pageWidth - 70, summaryRightY);

    const bal = Number(invoice.balance_due);
    if (bal > 0) {
      doc.setTextColor(245, 158, 11); // Amber-500
    } else {
      doc.setTextColor(15, 23, 42);
    }
    doc.text(pdfCurrency(invoice.balance_due, cur), rightColX, summaryRightY, { align: "right" });
    summaryRightY += 5.5;
  }

  y = Math.max(summaryLeftY, summaryRightY) + 8;

  // 8. Transactions Log / Payment History (if payments exist)
  if (payments && payments.length > 0) {
    if (y + 40 > pageHeight) {
      doc.addPage();
      y = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text("TRANSACTION HISTORY", 14, y);
    y += 5;

    autoTable(doc, {
      startY: y,
      head: [["Date", "Payment Method", "Amount Paid"]],
      body: payments.map((p) => [
        formatDate(p.payment_date),
        p.payment_method,
        pdfCurrency(p.amount_paid, cur),
      ]),
      headStyles: {
        fillColor: [248, 250, 252], // Slate-50
        textColor: [71, 85, 105], // Slate-600
        fontStyle: "bold",
        fontSize: 8.5,
        cellPadding: 3,
      },
      columnStyles: {
        0: { halign: "left" },
        1: { halign: "left" },
        2: { halign: "right" },
      },
      styles: {
        fontSize: 8.5,
        cellPadding: 3,
        textColor: [100, 116, 139],
        lineColor: [241, 245, 249],
        lineWidth: 0.5,
      },
      margin: { left: 14, right: 14 },
    });
    
    y = doc.lastAutoTable.finalY + 8;
  }

  // 9. Bottom Footer Page note
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text("Thank you for your business!", pageWidth / 2, pageHeight - 12, { align: "center" });

  doc.save(`${invoice.invoice_number}.pdf`);
}
