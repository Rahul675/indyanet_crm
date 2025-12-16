import { useState } from "react";
import Card from "../ui/Card";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function AddClusterModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    code: "",
    name: "",
    state: "",
    status: "Active",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.code || !form.name || !form.state) {
      setError("All fields are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_URL}/clusters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      await onAdd();
    } catch (err) {
      console.error("Failed to add cluster:", err);
      setError("Failed to create cluster.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <Card title="Add Cluster" className="w-full max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-red-500 bg-red-50 p-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Cluster Code */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Cluster Code
            </label>
            <input
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="e.g. CL-DEL-01"
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>

          {/* Cluster Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Cluster Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Delhi Central"
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              placeholder="Delhi"
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full rounded-xl border px-3 py-2 text-sm"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-xl border"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm rounded-xl bg-slate-900 text-white"
            >
              {loading ? "Saving..." : "Create Cluster"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
