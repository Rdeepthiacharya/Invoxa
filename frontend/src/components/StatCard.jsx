export default function StatCard({ icon: Icon, label, value, accent }) {
  const accents = {
    green: "from-emerald-500 to-teal-600",      // Revenue
    yellow: "from-amber-400 to-orange-500",     // Pending
    red: "from-red-500 to-rose-600",            // Expenses
    blue: "from-blue-500 to-indigo-600",        // Clients
    rose: "from-fuchsia-500 to-pink-600",       // Overdue
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60 transition hover:shadow-md">
      <div
        className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${
          accents[accent] || accents.blue
        } p-3 text-white shadow-lg`}
      >
        <Icon className="text-xl" />
      </div>

      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  );
}
