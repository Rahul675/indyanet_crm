import React from "react";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function AddCustomerModal({ onClose, onAdd }) {
  const [form, setForm] = React.useState({
    fullName: "",
    contactNumber: "",
    planType: "",
    connectionStatus: "Active",
    installDate: "",
  });

  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fullName || !form.contactNumber || !form.planType) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          installDate:
            form.installDate || new Date().toISOString().split("T")[0],
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to create customer");
      }

      await res.json(); // we don’t need to manually push to state
      onAdd(); // ✅ tell parent to refetch
      onClose();
    } catch (err) {
      console.error("Error adding customer:", err);
      alert("Failed to add customer. Check backend logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg w-full max-w-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Add New Customer</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Contact Number *
            </label>
            <input
              type="text"
              value={form.contactNumber}
              onChange={(e) =>
                setForm({ ...form, contactNumber: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">Plan *</label>
            <input
              type="text"
              placeholder="e.g. 100 Mbps / 500GB"
              value={form.planType}
              onChange={(e) => setForm({ ...form, planType: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Status
              </label>
              <select
                value={form.connectionStatus}
                onChange={(e) =>
                  setForm({ ...form, connectionStatus: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700"
              >
                <option>Active</option>
                <option>Inactive</option>
                <option>Suspended</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Installation Date
              </label>
              <input
                type="date"
                value={form.installDate}
                onChange={(e) =>
                  setForm({ ...form, installDate: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-sm rounded-xl border"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm rounded-xl bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900"
            >
              {loading ? "Adding..." : "Add Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
