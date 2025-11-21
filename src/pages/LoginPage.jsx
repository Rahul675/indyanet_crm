import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(email.trim().toLowerCase(), password.trim());

      if (result?.success && result?.data?.token) {
        const user = result.data.user;
        const token = result.data.token;

        // ✅ Save JWT token securely
        localStorage.setItem("auth_token", token);
        localStorage.setItem("user_role", user.role);
        localStorage.setItem("user_email", user.email);
        localStorage.setItem("user_name", user.name);

        console.log("✅ Logged in as:", user.role);
        console.log(
          "🔐 Token stored successfully:",
          token.slice(0, 25) + "..."
        );

        // ✅ Notify app of login
        window.dispatchEvent(new Event("storage"));

        // Slight delay to sync state before reload
        setTimeout(() => window.location.reload(), 300);
      } else {
        setError(result?.message || "Invalid login credentials");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 px-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 w-full max-w-md border dark:border-slate-800">
        {/* 🔹 Header */}
        <h1 className="text-2xl font-bold mb-2 text-center text-slate-800 dark:text-slate-100">
          CRM Login
        </h1>
        <p className="text-xs text-center text-slate-500 mb-6">
          Please sign in to access your dashboard
        </p>

        {/* 🔹 Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-500 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full border rounded-xl px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-slate-400/40"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-500 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••"
              className="w-full border rounded-xl px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-slate-400/40"
            />
          </div>

          {/* 🔹 Error Message */}
          {error && (
            <p className="text-sm text-red-500 text-center font-medium">
              {error}
            </p>
          )}

          {/* 🔹 Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-xl py-2 text-white font-medium transition ${
              loading
                ? "bg-slate-600 cursor-not-allowed"
                : "bg-slate-900 hover:bg-slate-800 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300"
            }`}
          >
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>

        {/* 🔹 Demo Info */}
        <div className="text-xs text-center text-slate-500 mt-6 leading-relaxed">
          Demo Logins:
          <br />
          <b>admin@crm.com</b> / <b>123456</b>
          <br />
          <b>operator1@crm.com</b> / <b>123456</b>
          <br />
          <b>operator2@crm.com</b> / <b>123456</b>
          <br />
          <b>operator3@crm.com</b> / <b>123456</b>
        </div>
      </div>
    </div>
  );
}
