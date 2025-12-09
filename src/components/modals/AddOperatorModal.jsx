import React, { useState } from "react";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function AddOperatorModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError("All fields are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("auth_token"); // adjust key if needed
      if (!token) {
        setError("You must be logged in as admin to add operators.");
        setLoading(false);
        return;
      }
      const res = await fetch(`${API_URL}/operators`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: "operator",
        }),
      });
      if (!res.ok) throw new Error("Failed to create operator");
      onAdd();
    } catch (err) {
      console.error(err);
      setError("Failed to add operator. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!form.name || !form.email || !form.password) {
  //     setError("All fields are required.");
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     setError("");

  // const token = localStorage.getItem("auth_token"); // adjust key if needed
  // if (!token) {
  //   setError("You must be logged in as admin to add operators.");
  //   setLoading(false);
  //   return;
  // }

  //     const res = await fetch(`${API_URL}/operators`, {
  //       method: "POST",
  // headers: {
  //   "Content-Type": "application/json",
  //   Authorization: `Bearer ${token}`,
  // },
  //       body: JSON.stringify({
  //         name: form.name,
  //         email: form.email,
  //         password: form.password,
  //         role: "operator", // optional — your controller/service forces role=operator
  //       }),
  //     });

  //     if (!res.ok) {
  //       const errBody = await res.json().catch(() => null);
  //       throw new Error(
  //         errBody?.message || `Failed to create operator (status ${res.status})`
  //       );
  //     }

  //     onAdd();
  //     onClose();
  //   } catch (err) {
  //     console.error(err);
  //     setError(err.message || "Failed to add operator. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg w-full max-w-md p-6 border dark:border-slate-800">
        <h2 className="text-lg font-semibold mb-4">Add Operator</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-xl px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded-xl px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border rounded-xl px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border dark:border-slate-700 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900 text-sm disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Operator"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
