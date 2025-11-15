import React, { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import Breadcrumbs from "../components/ui/Breadcrumbs";

export default function AuditPage() {
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  /**
   * 🧠 Fetch audit logs from backend
   */
  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/audit`);
      const result = await res.json();

      if (!res.ok)
        throw new Error(result.message || "Failed to fetch audit logs");

      // ✅ Your backend returns { success, timestamp, data: [...] }
      const logs = Array.isArray(result.data) ? result.data : [];

      // Sort newest first
      const sortedLogs = logs.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setAudit(sortedLogs);
    } catch (err) {
      console.error("Error fetching logs:", err);
      setError("Failed to load audit logs. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🧹 Clear all logs
   */
  const handleClear = async () => {
    if (
      !window.confirm("Are you sure you want to clear all audit log entries?")
    )
      return;

    try {
      const res = await fetch(`${API_URL}/audit/clear`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to clear logs");
      setAudit([]);
    } catch (err) {
      console.error("Error clearing logs:", err);
      alert("Error clearing logs. Check console for details.");
    }
  };

  /**
   * 🔁 Auto-refresh logs every 15 seconds
   */
  useEffect(() => {
    fetchAuditLogs();
    const interval = setInterval(fetchAuditLogs, 15000);
    return () => clearInterval(interval);
  }, []);

  /**
   * 🧾 Render
   */
  return (
    <div className="space-y-6">
      <Breadcrumbs active="Audit Log" />
      <Card
        title="Audit Log"
        subtitle="System and user activity logs (Login / Logout / Create / Update / Delete)"
        right={
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAuditLogs}
              disabled={loading}
              className="inline-flex items-center rounded-xl border px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-60"
            >
              Refresh
            </button>
            <button
              onClick={handleClear}
              disabled={loading}
              className="inline-flex items-center rounded-xl border px-3 py-2 text-sm text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-60"
            >
              Clear All
            </button>
          </div>
        }
      >
        {loading ? (
          <p className="text-center text-slate-500 italic py-6">
            Loading logs...
          </p>
        ) : error ? (
          <p className="text-center text-red-500 italic py-6">{error}</p>
        ) : audit.length === 0 ? (
          <p className="text-center text-slate-500 italic py-6">
            No audit entries yet. Actions like login, logout, or user creation
            will appear here.
          </p>
        ) : (
          <div className="overflow-auto border rounded-2xl dark:border-slate-800 max-h-[70vh]">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 sticky top-0 dark:bg-slate-900">
                <tr>
                  <th className="text-left font-semibold px-3 py-2">When</th>
                  <th className="text-left font-semibold px-3 py-2">User</th>
                  <th className="text-left font-semibold px-3 py-2">Role</th>
                  <th className="text-left font-semibold px-3 py-2">Action</th>
                  <th className="text-left font-semibold px-3 py-2">Entity</th>
                  <th className="text-left font-semibold px-3 py-2">Detail</th>
                </tr>
              </thead>
              <tbody>
                {audit.map((log) => (
                  <tr
                    key={log.id}
                    className="border-t hover:bg-slate-50 dark:hover:bg-slate-900 dark:border-slate-800"
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">{log.user?.name || "System"}</td>
                    <td className="px-3 py-2 text-slate-500">
                      {log.user?.role || "-"}
                    </td>
                    <td className="px-3 py-2 font-medium text-blue-600 dark:text-blue-400">
                      {log.action}
                    </td>
                    <td className="px-3 py-2">{log.entity}</td>
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-300">
                      {log.detail || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
