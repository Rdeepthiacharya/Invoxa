const getLocale = (currency) => {
  switch (currency?.toUpperCase()) {
    case "USD": return "en-US";
    case "EUR": return "en-IE"; // English layout with Euro symbol
    case "GBP": return "en-GB";
    case "INR":
    default:
      return "en-IN";
  }
};

export default function formatCurrency(amount, currency = "INR") {
  const code = currency || "INR";
  return new Intl.NumberFormat(getLocale(code), {
    style: "currency",
    currency: code,
    maximumFractionDigits: 0
  }).format(Number(amount) || 0);
}

export function formatCurrencyExact(amount, currency = "INR") {
  const code = currency || "INR";
  return new Intl.NumberFormat(getLocale(code), {
    style: "currency",
    currency: code,
    minimumFractionDigits: 2
  }).format(Number(amount) || 0);
}
