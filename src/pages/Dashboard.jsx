import React, { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import RevenueChart from "../components/charts/RevenueChart";
import GrowthChart from "../components/charts/GrowthChart";
import IssuesTrendChart from "../components/charts/IssuesTrendChart";
import ActiveInactiveChart from "../components/charts/ActiveInactiveChart";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/dashboard`;

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    renewals: 0,
    newInstallations: 0,
    suspensions: 0,
    deactivations: 0,
    activeCRMUsers: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const json = await res.json();

      // 👇 Corrected data extraction
      const data = json?.data?.data || json?.data || json || {};

      setStats(data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Could not load dashboard stats.");
    } finally {
      setLoading(false);
    }
  }

  const {
    total,
    active,
    inactive,
    renewals,
    newInstallations,
    suspensions,
    deactivations,
    activeCRMUsers,
  } = stats;

  return (
    <div className="space-y-6">
      <Breadcrumbs active="dashboard" />

      {loading ? (
        <Card title="Dashboard" subtitle="Loading analytics...">
          <p className="text-center text-slate-500 p-4">Fetching data...</p>
        </Card>
      ) : error ? (
        <Card title="Dashboard" subtitle="Analytics and summaries">
          <p className="text-center text-red-500 p-4">{error}</p>
        </Card>
      ) : (
        <>
          {/* 🔹 Quick Overview Section */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card title="Overview" subtitle="Quick stats">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="rounded-xl border p-4 dark:border-slate-800">
                  <div className="text-2xl font-bold">{total}</div>
                  <div className="text-xs text-slate-500">Customers</div>
                </div>
                <div className="rounded-xl border p-4 dark:border-slate-800">
                  <div className="text-2xl font-bold text-green-600">
                    {active}
                  </div>
                  <div className="text-xs text-slate-500">Active</div>
                </div>
                <div className="rounded-xl border p-4 dark:border-slate-800">
                  <div className="text-2xl font-bold text-red-500">
                    {inactive}
                  </div>
                  <div className="text-xs text-slate-500">Inactive</div>
                </div>
              </div>
            </Card>

            {/* 🔹 Renewals & Installations */}
            <Card title="Renewals & Installs" subtitle="This month’s growth">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="rounded-xl border p-4 dark:border-slate-800">
                  <div className="text-2xl font-bold text-blue-600">
                    {renewals}
                  </div>
                  <div className="text-xs text-slate-500">Renewals</div>
                </div>
                <div className="rounded-xl border p-4 dark:border-slate-800">
                  <div className="text-2xl font-bold text-emerald-600">
                    {newInstallations}
                  </div>
                  <div className="text-xs text-slate-500">
                    New Installations
                  </div>
                </div>
              </div>
            </Card>

            {/* 🔹 Suspensions & Deactivations */}
            <Card title="Account Status" subtitle="Connection changes">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="rounded-xl border p-4 dark:border-slate-800">
                  <div className="text-2xl font-bold text-yellow-500">
                    {suspensions}
                  </div>
                  <div className="text-xs text-slate-500">Suspensions</div>
                </div>
                <div className="rounded-xl border p-4 dark:border-slate-800">
                  <div className="text-2xl font-bold text-red-600">
                    {deactivations}
                  </div>
                  <div className="text-xs text-slate-500">Deactivations</div>
                </div>
              </div>
            </Card>
          </div>

          {/* 🔹 CRM Active Users */}
          <Card title="CRM Users" subtitle="Currently active on the platform">
            <div className="text-center py-4">
              <div className="text-3xl font-bold text-indigo-600">
                {activeCRMUsers}
              </div>
              <div className="text-sm text-slate-500 mt-1">
                Active CRM Users in the past 24 hours
              </div>
            </div>
          </Card>

          {/* 🔹 Charts Section */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card title="Revenue Trend" subtitle="Sum of recharges per month">
              <RevenueChart />
            </Card>

            <Card title="Customer Growth" subtitle="Running installs per month">
              <GrowthChart />
            </Card>

            <Card title="Active vs Inactive" subtitle="Distribution overview">
              <ActiveInactiveChart
                data={[
                  { label: "Active", value: active },
                  { label: "Inactive", value: inactive },
                ]}
              />
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
