import React, { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import AddIssueModal from "../components/modals/AddIssueModal";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function IssuesPage() {
  const [issues, setIssues] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const categories = ["Billing", "Connectivity", "Speed", "Installation"];
  const statuses = ["Pending", "Resolved"];

  // 🔐 GET TOKEN
  const token = localStorage.getItem("auth_token");

  const authHeader = {
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };

  useEffect(() => {
    fetchIssues();
    fetchCustomers();
  }, []);

  // ✅ Fetch issues with JWT
  async function fetchIssues() {
    try {
      setLoading(true);
      setError("");

      if (!token) throw new Error("No token found — please log in again.");

      const res = await fetch(`${API_URL}/issues`, {
        headers: authHeader,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const data = Array.isArray(json)
        ? json
        : Array.isArray(json.data)
        ? json.data
        : Array.isArray(json.data?.data)
        ? json.data.data
        : [];

      setIssues(data);
    } catch (err) {
      console.error("Failed to fetch issues:", err);
      setError("Could not load issues.");
      setIssues([]);
    } finally {
      setLoading(false);
    }
  }

  // ✅ Fetch customers for dropdown with JWT
  async function fetchCustomers() {
    try {
      const res = await fetch(`${API_URL}/customers`, {
        headers: authHeader,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const data = Array.isArray(json)
        ? json
        : Array.isArray(json.data)
        ? json.data
        : Array.isArray(json.data?.data)
        ? json.data.data
        : [];

      setCustomers(data);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      setCustomers([]);
    }
  }

  // ✅ Create issue and refresh
  async function handleAdd() {
    try {
      await fetchIssues(); // refresh table after modal success
      setShowModal(false);
    } catch (err) {
      console.error("Error refreshing issues:", err);
    }
  }

  // ✅ Delete issue with JWT
  async function handleDelete(id) {
    if (!confirm("Delete this issue?")) return;

    try {
      setDeletingId(id);

      if (!token) {
        alert("Session expired. Please log in again.");
        return;
      }

      const res = await fetch(`${API_URL}/issues/${id}`, {
        method: "DELETE",
        headers: authHeader,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);

      setIssues((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Could not delete issue.");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredRows = issues.filter(
    (r) =>
      (filterStatus === "All" || r.status === filterStatus) &&
      (filterCategory === "All" || r.category === filterCategory)
  );

  const badge = (s) =>
    s === "Resolved" ? (
      <Badge tone="green">Resolved</Badge>
    ) : (
      <Badge tone="amber">Pending</Badge>
    );

  return (
    <div className="space-y-6">
      <Breadcrumbs active="issues" />
      <Card
        title="Issue Tracker"
        subtitle="Log complaints and monitor resolution progress."
        right={
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center rounded-xl border px-3 py-2 text-sm bg-slate-900 text-white"
          >
            + Add Issue
          </button>
        }
      >
        {/* Filters */}
        <div className="flex flex-wrap gap-4 p-3 border-b dark:border-slate-800">
          <div>
            <label className="block text-xs text-slate-500">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded-lg px-3 py-1 text-sm dark:bg-slate-900 dark:border-slate-800"
            >
              <option>All</option>
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-500">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border rounded-lg px-3 py-1 text-sm dark:bg-slate-900 dark:border-slate-800"
            >
              <option>All</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto border rounded-2xl mt-4 dark:border-slate-800">
          {loading ? (
            <p className="p-4 text-center text-slate-500">Loading issues...</p>
          ) : error ? (
            <p className="p-4 text-center text-red-500">{error}</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-100 dark:bg-slate-900">
                <tr>
                  {[
                    "ID",
                    "Customer Code",
                    "Customer Name",
                    "Category",
                    "Description",
                    "Status",
                    "Assignee",
                    "Created Date",
                    "Resolved Date",
                    "Resolution Notes",
                    "",
                  ].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    <td className="px-3 py-2 font-mono">{r.id}</td>
                    <td className="px-3 py-2">{r.customer.customerCode}</td>
                    <td className="px-3 py-2">{r.customer?.fullName || "-"}</td>
                    <td className="px-3 py-2">{r.category}</td>
                    <td className="px-3 py-2">{r.description}</td>
                    <td className="px-3 py-2">{badge(r.status)}</td>
                    <td className="px-3 py-2">{r.assignee || "-"}</td>
                    <td className="px-3 py-2">
                      {r.createdDate
                        ? new Date(r.createdDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-3 py-2">
                      {r.resolvedDate
                        ? new Date(r.resolvedDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-3 py-2">{r.resolutionNotes || "-"}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => handleDelete(r.id)}
                        disabled={deletingId === r.id}
                        className="border px-3 py-1.5 text-xs rounded-xl"
                      >
                        {deletingId === r.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredRows.length === 0 && !loading && !error && (
                  <tr>
                    <td
                      colSpan={11}
                      className="text-center text-slate-500 py-6"
                    >
                      No issues found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {showModal && (
        <AddIssueModal
          onClose={() => setShowModal(false)}
          onAdd={handleAdd}
          customers={customers}
        />
      )}
    </div>
  );
}
