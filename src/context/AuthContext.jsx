import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  // 🔹 Load saved session from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("crm_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("crm_user");
      }
    }
    setLoading(false);
  }, []);

  // 🟢 LOGIN — calls backend
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: data.message || "Login failed" };
      }

      const userData = data.user || data.data || data;
      localStorage.setItem("crm_user", JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (err) {
      console.error("Login error:", err);
      return { success: false, message: "Server connection failed" };
    }
  };

  // 🔴 LOGOUT — calls backend and clears storage
  const logout = async (reason) => {
    if (!user) return;

    try {
      await fetch(`${API_URL}/auth/logout/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      console.warn("Logout API failed (offline mode).");
    }

    localStorage.removeItem("crm_user");
    setUser(null);
  };

  // 👥 REGISTER (admin only)
  const register = async (name, email, password, role = "operator") => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          message: data.message || "Registration failed",
        };
      }

      return { success: true, user: data.user };
    } catch (err) {
      console.error("Registration error:", err);
      return { success: false, message: "Server error" };
    }
  };

  // 🔍 Fetch all users (for admin dashboard)
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/users`);
      if (!res.ok) throw new Error("Failed to fetch users");
      return await res.json();
    } catch (err) {
      console.error("Error fetching users:", err);
      return [];
    }
  };

  const hasAccess = (allowedRoles) => user && allowedRoles.includes(user.role);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, register, fetchUsers, hasAccess, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ✅ Custom hook export
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
