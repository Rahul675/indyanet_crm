import React, { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import AddRechargeModal from "../components/modals/AddRechargeModal";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function RechargePage() {
  const [recharges, setRecharges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editRecharge, setEditRecharge] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // ⭐ NEW: Month Filter state
  const [monthFilter, setMonthFilter] = useState("");

  const headers = [
    "ID",
    "Customer",
    "Plan Type",
    "Recharge Date",
    "Amount",
    "Validity (days)",
    "Expiry Date",
    "Status",
    "",
  ];

  useEffect(() => {
    fetchRecharges();

    // Auto-close menu when clicking outside
    const handleClickOutside = (e) => {
      if (!e.target.closest(".menu-container")) setMenuOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // ✅ Fetch recharge data
  async function fetchRecharges() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_URL}/recharges`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      const data = Array.isArray(json.data)
        ? json.data
        : Array.isArray(json.data?.data)
        ? json.data.data
        : [];
      setRecharges(data);
    } catch (err) {
      console.error("Failed to fetch recharges:", err);
      setError("Could not load recharge data from server.");
    } finally {
      setLoading(false);
    }
  }

  // ⭐ NEW: Filtered recharge list
  const filteredRecharges = monthFilter
    ? recharges.filter((r) => {
        const rechargeMonth = new Date(r.rechargeDate).getMonth() + 1;
        return rechargeMonth === parseInt(monthFilter);
      })
    : recharges;

  // CSV Export
  const handleExport = () => {
    const csvHeader = [
      "ID,Customer,Plan Type,Recharge Date,Amount,Validity Days,Expiry Date,Status",
    ];
    const csvRows = recharges.map(
      (r) =>
        `${r.id},"${r.customer?.fullName || "-"}","${r.planType}",${new Date(
          r.rechargeDate
        ).toLocaleDateString()},${r.amount},${r.validityDays},${new Date(
          r.expiryDate
        ).toLocaleDateString()},${r.status}`
    );
    const blob = new Blob([csvHeader.concat(csvRows).join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recharges.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // CSV Import
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const lines = event.target.result.split("\n").slice(1);
      for (const line of lines) {
        const [, customerName, planType, rechargeDate, amount, validityDays] =
          line.split(",");
        if (!customerName || !planType) continue;

        await fetch(`${API_URL}/recharges`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planType,
            rechargeDate: new Date(rechargeDate),
            amount: parseFloat(amount),
            validityDays: parseInt(validityDays),
            status: "Active",
            customerId: "",
          }),
        });
      }
      fetchRecharges();
    };
    reader.readAsText(file);
  };

  // Delete recharge
  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this recharge?")) return;
    try {
      const res = await fetch(`${API_URL}/recharges/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchRecharges();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete recharge. Check backend logs.");
    }
  }

  const handleEdit = (recharge) => {
    setEditRecharge(recharge);
    setShowAddModal(true);
  };

  const badge = (s) =>
    s === "Active" ? (
      <Badge tone="green">Active</Badge>
    ) : s === "Pending" ? (
      <Badge tone="amber">Pending</Badge>
    ) : (
      <Badge tone="red">Expired</Badge>
    );

  return (
    <div className="space-y-6">
      <Breadcrumbs active="recharge" />

      <Card
        title="Recharge Management"
        subtitle="Track recharges, validity, and expiry status."
        right={
          <div className="flex gap-2 items-center relative">
            {/* ⭐ Month Filter */}
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="border rounded-xl px-3 py-2 text-sm"
            >
              <option value="">All Months</option>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>

            {/* ⋯ Menu */}
            <div className="relative menu-container">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm"
              >
                ⋯
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 border rounded-xl shadow-lg z-50 transition-all duration-150 ease-in-out">
                  <label
                    htmlFor="importFile"
                    className="block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    Import CSV
                  </label>
                  <input
                    type="file"
                    id="importFile"
                    className="hidden"
                    accept=".csv"
                    onChange={handleImport}
                  />
                  <button
                    onClick={handleExport}
                    className="w-full text-left block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    Export CSV
                  </button>
                </div>
              )}
            </div>

            {/* Add Recharge */}
            <button
              onClick={() => {
                setEditRecharge(null);
                setShowAddModal(true);
              }}
              className="inline-flex items-center rounded-xl border px-3 py-2 text-sm bg-slate-900 text-white"
            >
              + Add Recharge
            </button>
          </div>
        }
      >
        <div className="overflow-auto border rounded-2xl dark:border-slate-800">
          {loading ? (
            <p className="p-4 text-center text-slate-500">
              Loading recharges...
            </p>
          ) : error ? (
            <p className="p-4 text-center text-red-500">{error}</p>
          ) : filteredRecharges.length === 0 ? (
            <p className="p-4 text-center text-slate-500 italic">
              No recharges found.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-100 sticky top-0 dark:bg-slate-900">
                <tr>
                  {headers.map((h) => (
                    <th
                      key={h}
                      className="text-left font-semibold px-3 py-2 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRecharges.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t hover:bg-slate-50 dark:hover:bg-slate-900 dark:border-slate-800"
                  >
                    <td className="px-3 py-2 font-mono">{r.id}</td>
                    <td className="px-3 py-2">{r.customer?.fullName || "-"}</td>
                    <td className="px-3 py-2">{r.planType}</td>
                    <td className="px-3 py-2">
                      {new Date(r.rechargeDate).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2">₹{r.amount}</td>
                    <td className="px-3 py-2">{r.validityDays}</td>
                    <td className="px-3 py-2">
                      {new Date(r.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2">{badge(r.status)}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(r)}
                          className="inline-flex items-center rounded-xl border px-3 py-1.5 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="inline-flex items-center rounded-xl border px-3 py-1.5 text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {showAddModal && (
        <AddRechargeModal
          onClose={() => setShowAddModal(false)}
          onAdd={fetchRecharges}
          editData={editRecharge}
        />
      )}
    </div>
  );
}
