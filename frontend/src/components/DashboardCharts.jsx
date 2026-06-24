import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  Line,
  Legend
} from "recharts";
import formatCurrency from "../utils/formatCurrency";

const COLORS = [
  "#14b8a6", "#8b5cf6", "#f43f5e",];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-sm font-semibold text-slate-800">
        {payload[0].name}
      </p>
      <p className="text-sm text-slate-600">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
};

const formatMonthLabel = (monthKey) => {
  const [year, month] = monthKey.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleString("default", { month: "short", year: "numeric" });
};

const buildTrendData = (revenueTrends, expenseTrends) => {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  });

  return months.map((monthKey) => {
    const revenueMatch = revenueTrends?.find((item) => item.month === monthKey);
    const expenseMatch = expenseTrends?.find((item) => item.month === monthKey);
    const revenueValue = Number(revenueMatch?.revenue ?? 0);
    const expenseValue = Number(expenseMatch?.expenses ?? 0);

    return {
      month: formatMonthLabel(monthKey),
      revenue: revenueValue,
      expenses: expenseValue,
      profit: revenueValue - expenseValue
    };
  });
};

export default function DashboardCharts({
  revenue,
  pending,
  overdueAmount = 0,
  totalExpenses = 0,
  netProfit = 0,
  profitMargin = 0,
  revenueTrends = [],
  expenseTrends = [],
  topClients = [],
  avgPaymentDays = 0
}) {
  const pendingAmount = Math.max(pending - overdueAmount, 0);

  const statusData = [
    { name: "Revenue", value: revenue },
    { name: "Pending", value: pendingAmount },
    { name: "Overdue", value: overdueAmount }
  ];

  const barData = [
    { name: "Revenue", amount: revenue },
    { name: "Pending", amount: pendingAmount },
    { name: "Overdue", amount: overdueAmount }
  ];

  const trendData = buildTrendData(revenueTrends, expenseTrends);
  const clientData = topClients.map((client) => ({
    name: client.name,
    value: Number(client.revenue)
  }));
  const avgDays = Math.round(Number(avgPaymentDays) || 0);
  const safeNetProfit = Number(netProfit) || 0;
  const safeProfitMargin = Number.isFinite(Number(profitMargin)) ? Number(profitMargin) : 0;
  const filteredStatusData = statusData.filter(
    item => Number(item.value) > 0
  );
  return (
    <div className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h4 className="mb-4 text-sm font-semibold text-slate-700">
            Financial Overview
          </h4>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} barSize={48}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#64748b", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                {barData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold text-slate-700">
            Invoice Status Split
          </h4>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={filteredStatusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {filteredStatusData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h4 className="mb-4 text-sm font-semibold text-slate-700">
            Revenue vs Expenses
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData} margin={{ top: 10, right: 6, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#64748b", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={24} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#14b8a6"
                strokeWidth={3}
                fill="url(#revenueGradient)"
                activeDot={{ r: 6 }}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#f43f5e"
                strokeWidth={3}
                fill="url(#expenseGradient)"
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold text-slate-700">
            Top Clients Breakdown
          </h4>
          <div className="rounded-3xl border border-slate-200 bg-white p-4">
            {clientData.length === 0 ? (
              <div className="flex h-[280px] items-center justify-center text-sm text-slate-500">
                No payments recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={clientData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={92}
                    paddingAngle={4}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {clientData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex items-center justify-between gap-6">
            <div>
              <h4 className="text-sm font-semibold text-slate-700">
                Net Profit &amp; Margin
              </h4>
              <p className="mt-2 text-sm text-slate-500">
                Revenue minus recorded expenses.
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-semibold text-slate-900">
                {formatCurrency(safeNetProfit)}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {safeProfitMargin}% margin
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-700">
                Avg. Payment Cycle Time
              </h4>
              <p className="mt-2 text-sm text-slate-500">
                Days from invoice due date to final payment.
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-semibold text-slate-900">{avgDays}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500">
                Average days
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
