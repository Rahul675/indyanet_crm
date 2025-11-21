import React from "react";
const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function AddIssueModal({ onClose, onAdd, customers }) {
  const [form, setForm] = React.useState({
    customerId: "",
    category: "Billing",
    description: "",
    assignee: "",
    status: "Pending",
  });

  const [loading, setLoading] = React.useState(false);
  const categories = ["Billing", "Connectivity", "Speed", "Installation"];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.customerId || !form.description) {
      alert("Please select a customer and fill all required fields");
      return;
    }

    console.log("Submitting issue payload:", form);

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/issues`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const text = await res.text();
      console.log("Raw backend response:", text);

      let json;
      try {
        json = JSON.parse(text);
      } catch {
        json = {};
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);

      console.log("Issue created:", json);

      // ✅ Just tell parent to refresh, don’t pass the issue object
      onAdd();
      onClose();
    } catch (err) {
      console.error("Error creating issue:", err);
      alert("Failed to add issue. Check backend logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg w-full max-w-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Add New Issue</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Customer Dropdown */}
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Select Customer *
            </label>
            <select
              value={form.customerId}
              onChange={(e) => setForm({ ...form, customerId: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700"
            >
              <option value="">-- Select Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.planType})
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700"
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Description *
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700"
              rows={3}
              required
            />
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Assignee
            </label>
            <input
              type="text"
              value={form.assignee}
              onChange={(e) => setForm({ ...form, assignee: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700"
            />
          </div>

          {/* Buttons */}
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
              {loading ? "Adding..." : "Add Issue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
