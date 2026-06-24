export default function PageCard({ title, action, children, className = "" }) {
  return (
    <div
      className={`rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          {title && (
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          )}
          {action}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
