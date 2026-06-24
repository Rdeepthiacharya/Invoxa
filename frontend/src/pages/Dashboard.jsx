import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaMoneyBillWave,
  FaUsers,
  FaExclamationTriangle,
  FaClock,
  FaFileInvoice,
  FaPlusCircle,
  FaCreditCard,
  FaArrowRight,
  FaWallet
} from "react-icons/fa";

import API from "../services/api";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import PageCard from "../components/PageCard";
import StatusBadge from "../components/StatusBadge";
import DashboardCharts from "../components/DashboardCharts";
import formatCurrency from "../utils/formatCurrency";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const isHR = user?.role === "HR" || user?.role === "HR Manager";
  const isSales = user?.role === "Sales";

  const [stats, setStats] = useState({
    revenue: 0,
    pending: 0,
    clients: 0,
    overdue: 0,
    overdue_amount: 0,
    total_expenses: 0,
    net_profit: 0,
    profit_margin: 0,
    revenue_trends: [],
    expense_trends: [],
    top_clients: [],
    avg_payment_days: 0,
  team_count: 0
  });

  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, recentRes] = await Promise.all([
        API.get("dashboard-stats.php"),
        isHR ? Promise.resolve({ data: [] }) : API.get("recent-invoices.php")
      ]);
  
      setStats(statsRes.data);
      setRecentInvoices(recentRes.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  return (
    <Layout
      title={`Welcome back, ${user?.name?.split(" ")[0] || "there"}`}
      subtitle={isHR ? "Here's what's happening with your staff today." : "Here's what's happening with your business today."}
    >
      {!isHR && stats.overdue > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-800">
          <FaExclamationTriangle className="shrink-0 text-red-500" />
          <div>
            <p className="font-semibold">
              {stats.overdue} overdue invoice{stats.overdue > 1 ? "s" : ""}
            </p>
            <p className="text-sm text-red-600">
              Follow up with clients or record payments to keep cash flow healthy.
            </p>
          </div>
          <Link
            to="/invoices"
            className="ml-auto shrink-0 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            View all
          </Link>
        </div>
      )}

      <div className={`grid gap-5 sm:grid-cols-2 ${isHR ? "xl:grid-cols-1" : isSales ? "xl:grid-cols-2" : "xl:grid-cols-5"}`}>
        {!isHR && !isSales && (
          <StatCard
            icon={FaMoneyBillWave}
            label="Total Revenue"
            value={loading ? "..." : formatCurrency(stats.revenue)}
            accent="green"
          />
        )}
        {!isHR && !isSales && (
          <StatCard
            icon={FaClock}
            label="Pending Amount"
            value={loading ? "..." : formatCurrency(stats.pending)}
            accent="yellow"
          />
        )}
        {!isHR && !isSales && (
          <StatCard
            icon={FaWallet}
            label="Total Expenses"
            value={loading ? "..." : formatCurrency(stats.total_expenses)}
            accent="red"
          />
        )}
        {!isHR && (
          <StatCard
            icon={FaUsers}
            label="Total Clients"
            value={loading ? "..." : stats.clients}
            accent="blue"
          />
        )}
        {isHR && (
          <StatCard
            icon={FaUsers}
            label="Total Team Members"
            value={loading ? "..." : stats.team_count || 0}
            accent="indigo"
          />
        )}
        {!isHR && (
          <StatCard
            icon={FaExclamationTriangle}
            label="Overdue Invoices"
            value={loading ? "..." : stats.overdue}
            accent="rose"
          />
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {!isHR && (
          <PageCard title="Recent Invoices" className="lg:col-span-4">
            {loading ? (
              <p className="py-8 text-center text-slate-400">Loading...</p>
            ) : recentInvoices.length === 0 ? (
              <div className="py-8 text-center">
                <FaFileInvoice className="mx-auto mb-3 text-3xl text-slate-300" />
                <p className="text-slate-500">No invoices yet</p>
                {!isHR && !isSales && (
                  <Link
                    to="/create-invoice"
                    className="mt-3 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    Create your first invoice →
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <th className="pb-3 pr-4">Invoice</th>
                      <th className="pb-3 pr-4">Amount</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recentInvoices.map((inv) => (
                      <tr key={inv.id} className="group">
                        <td className="py-3 pr-4">
                          <Link
                            to={`/invoices/${inv.id}`}
                            className="font-medium text-indigo-600 hover:text-indigo-700"
                          >
                            {inv.invoice_number}
                          </Link>
                        </td>
                        <td className="py-3 pr-4 text-slate-600">
                          {formatCurrency(inv.total)}
                        </td>
                        <td className="py-3">
                          <StatusBadge status={inv.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </PageCard>
        )}
      </div>

      {!isHR && !isSales && (
        <PageCard title="Business Overview" className="mt-8">
          <DashboardCharts
            revenue={Number(stats.revenue)}
            pending={Number(stats.pending)}
            overdueAmount={Number(stats.overdue_amount)}
            totalExpenses={Number(stats.total_expenses)}
            netProfit={Number(stats.net_profit)}
            profitMargin={Number(stats.profit_margin)}
            revenueTrends={stats.revenue_trends}
            expenseTrends={stats.expense_trends}
            topClients={stats.top_clients}
            avgPaymentDays={Number(stats.avg_payment_days)}
          />
        </PageCard>
      )}
    </Layout>
  );
}
