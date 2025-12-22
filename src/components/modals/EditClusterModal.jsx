import { useState, useEffect } from "react";
import Card from "../ui/Card";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function EditClusterModal({ cluster, onClose, onUpdate }) {
  const [form, setForm] = useState({
    code: "",
    name: "",
    state: "",
    status: "Active",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Populate form when modal opens
  useEffect(() => {
    if (cluster) {
      setForm({
        code: cluster.code || "",
        name: cluster.name || "",
        state: cluster.state || "",
        status: cluster.status || "Active",
      });
    }
  }, [cluster]);

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

      const res = await fetch(`${API_URL}/clusters/${cluster.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      await onUpdate();
      onClose();
    } catch (err) {
      console.error("Failed to update cluster:", err);
      setError("Failed to update cluster.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <Card title="Edit Cluster" className="w-full max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-red-500 bg-red-50 p-2 rounded-lg">
              {error}
            </p>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              Cluster Code
            </label>
            <input
              name="code"
              value={form.code}
              onChange={handleChange}
              className="w-full rounded-xl border px-3 py-2 text-sm bg-slate-50 cursor-not-allowed"
              disabled // Usually cluster codes shouldn't change
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Cluster Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>

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
              {loading ? "Saving..." : "Update Cluster"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
