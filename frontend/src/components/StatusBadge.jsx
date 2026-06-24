const styles = {
  Paid: "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
  Pending: "bg-amber-100 text-amber-700 ring-amber-600/20",
  Overdue: "bg-red-100 text-red-700 ring-red-600/20",
  Draft: "bg-slate-100 text-slate-600 ring-slate-500/20"
};

export default function StatusBadge({ status }) {
  const label = status || "Pending";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
        styles[label] || styles.Pending
      }`}
    >
      {label}
    </span>
  );
}
