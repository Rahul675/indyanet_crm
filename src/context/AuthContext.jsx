import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  // 🔹 Load saved session from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("crm_user");
    const token = localStorage.getItem("auth_token");

    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("crm_user");
        localStorage.removeItem("auth_token");
      }
    }
    setLoading(false);
  }, []);

  // 🟢 LOGIN — backend returns JWT token
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

      const userData = data?.user || data?.data?.user;
      const token = data?.token || data?.data?.token;

      if (!token || !userData) {
        throw new Error("Invalid login response");
      }

      // ✅ Save user + token
      localStorage.setItem("crm_user", JSON.stringify(userData));
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user_id", userData.id);
      setUser(userData);

      return { success: true, user: userData };
    } catch (err) {
      console.error("Login error:", err);
      return { success: false, message: "Server connection failed" };
    }
  };

  // 🔴 LOGOUT — send reason + token, then clear localStorage
  const logout = async (reason = "") => {
    const token = localStorage.getItem("auth_token");
    const userId = localStorage.getItem("user_id");

    if (!userId || !token) {
      localStorage.clear();
      setUser(null);
      return;
    }

    try {
      await fetch(`${API_URL}/auth/logout/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });
    } catch (err) {
      console.warn("Logout API failed:", err);
    } finally {
      localStorage.clear();
      setUser(null);
      window.location.reload();
    }
  };

  // 👥 REGISTER — admin only (JWT protected)
  const register = async (name, email, password, role = "operator") => {
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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

  // 🔍 Fetch all users — protected endpoint
  const fetchUsers = async () => {
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${API_URL}/auth/users`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch users");

      return data;
    } catch (err) {
      console.error("Error fetching users:", err);
      return [];
    }
  };

  // 🔑 Helper — check access
  const hasAccess = (allowedRoles) => user && allowedRoles.includes(user.role);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, register, fetchUsers, hasAccess, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ✅ Custom hook
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
