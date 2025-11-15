import React, { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import {
  ResponsiveContainer,
  BarChart,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Line,
} from "recharts";

const API_URL = "http://localhost:3000/reports";

export default function ReportsPage() {
  const [issuesTrend, setIssuesTrend] = useState([]);
  const [customerStats, setCustomerStats] = useState({
    active: 0,
    inactive: 0,
  });
  const [revenue, setRevenue] = useState({
    data: [],
    total: 0,
    range: "month",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReportsData();
  }, []);

  async function fetchReportsData() {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const json = await res.json();

      // ✅ Properly unwrap nested structure
      const data = json?.data?.data || {};

      const revenueMonth = data.revenueMonth || {};

      setCustomerStats(data.customerStats || { active: 0, inactive: 0 });
      setIssuesTrend(Array.isArray(data.issuesTrend) ? data.issuesTrend : []);
      setRevenue({
        data: Array.isArray(revenueMonth.data) ? revenueMonth.data : [],
        total: revenueMonth.total || 0,
        range: revenueMonth.range || "month",
      });
    } catch (err) {
      console.error("Failed to load reports data:", err);
      setError("Could not load report data.");
    } finally {
      setLoading(false);
      setTimeout(() => window.dispatchEvent(new Event("resize")), 100);
    }
  }

  async function fetchRevenue(range) {
    try {
      const res = await fetch(`${API_URL}/revenue?range=${range}`);
      const json = await res.json();
      const data = json?.data?.data || json?.data || {};

      setRevenue({
        data: Array.isArray(data.data) ? data.data : [],
        total: data.total || 0,
        range: data.range || range,
      });
      setTimeout(() => window.dispatchEvent(new Event("resize")), 100);
    } catch {
      alert("Failed to fetch revenue data");
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs active="reports" />

      {loading ? (
        <Card title="Reports" subtitle="Loading analytics...">
          <p className="p-4 text-center text-slate-500">Fetching data...</p>
        </Card>
      ) : error ? (
        <Card title="Reports" subtitle="Analytics and summaries">
          <p className="text-center text-red-500">{error}</p>
        </Card>
      ) : (
        <>
          {/* 1️⃣ Issues Trend */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card title="Issues Trend" subtitle="Logged issues per month">
              {issuesTrend.length > 0 ? (
                <div className="relative w-full h-[280px] min-h-[18rem]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={issuesTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="issues" fill="#0f172a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-slate-500 py-6">
                  No issues logged yet.
                </p>
              )}
            </Card>

            {/* 2️⃣ Active vs Inactive */}
            <Card
              title="Active vs Inactive Customers"
              subtitle="Connection distribution"
            >
              <div className="relative w-full h-[280px] min-h-[18rem]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { label: "Active", value: customerStats.active },
                      { label: "Inactive", value: customerStats.inactive },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#0f172a" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* 3️⃣ Revenue Report */}
          <Card
            title="💰 Revenue Report"
            subtitle={`Total revenue (${revenue.range})`}
            right={
              <select
                value={revenue.range}
                onChange={(e) => fetchRevenue(e.target.value)}
                className="border rounded-lg px-2 py-1 text-sm"
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
              </select>
            }
          >
            {revenue.data.length > 0 ? (
              <div className="relative w-full h-[300px] min-h-[18rem]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenue.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="amount" stroke="#10b981" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-slate-500 py-6">
                No revenue data available.
              </p>
            )}
            <p className="text-right text-sm font-medium mt-3 text-slate-700">
              Total: ₹{revenue.total?.toLocaleString("en-IN") || 0}
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
