import React, { useEffect, useState } from "react";
const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function AddRechargeModal({ onClose, onAdd }) {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    customerId: "",
    planType: "",
    rechargeDate: new Date().toISOString().split("T")[0],
    amount: "",
    validityDays: "",
    status: "Active",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    try {
      const res = await fetch(`${API_URL}/customers`);
      const json = await res.json();
      const data = Array.isArray(json.data)
        ? json.data
        : Array.isArray(json.data?.data)
        ? json.data.data
        : [];
      setCustomers(data);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (
      !form.customerId ||
      !form.planType ||
      !form.amount ||
      !form.validityDays
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/recharges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount),
          validityDays: parseInt(form.validityDays),
          rechargeDate: new Date(form.rechargeDate),
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await onAdd();
      onClose();
    } catch (err) {
      console.error("Error adding recharge:", err);
      alert("Failed to add recharge.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg w-full max-w-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Add New Recharge</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Customer *
            </label>
            <select
              value={form.customerId}
              onChange={(e) => setForm({ ...form, customerId: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">-- Select Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.planType})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Plan Type *
            </label>
            <input
              type="text"
              value={form.planType}
              onChange={(e) => setForm({ ...form, planType: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Recharge Date *
            </label>
            <input
              type="date"
              value={form.rechargeDate}
              onChange={(e) =>
                setForm({ ...form, rechargeDate: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Amount *
              </label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Validity Days *
              </label>
              <input
                type="number"
                value={form.validityDays}
                onChange={(e) =>
                  setForm({ ...form, validityDays: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-sm border rounded-xl"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm rounded-xl bg-slate-900 text-white"
            >
              {loading ? "Adding..." : "Add Recharge"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
