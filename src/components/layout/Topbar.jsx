import { useState, useEffect } from "react";
import { Search, Bell, User, LogOut, X, Loader2 } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";
import { useAuth } from "../../context/AuthContext";

export default function Topbar({ setActive }) {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [logoutReason, setLogoutReason] = useState("");
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  /**
   * 🔔 Fetch latest notifications from backend
   */
  const fetchNotifications = async () => {
    try {
      setLoadingNotifs(true);
      const res = await fetch(`${API_URL}/notifications`);
      const json = await res.json();

      if (!res.ok)
        throw new Error(json.message || "Failed to fetch notifications");

      // Handle both possible response shapes
      const rawData =
        json?.data?.data && Array.isArray(json.data.data)
          ? json.data.data
          : Array.isArray(json.data)
          ? json.data
          : [];

      setNotifications(rawData.slice(0, 10)); // top 10
    } catch (err) {
      console.error("Notification fetch error:", err);
    } finally {
      setLoadingNotifs(false);
    }
  };

  // 🔁 Auto-refresh every 20 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  /**
   * 🧠 Handle logout with reason (operators)
   */
  const handleLogoutSubmit = () => {
    if (logoutReason.trim().length < 30) {
      setError("Please enter at least 30 characters before logging out.");
      return;
    }

    logout(logoutReason);
    setLogoutReason("");
    setError("");
    setShowLogoutDialog(false);
  };

  return (
    <>
      {/* === HEADER === */}
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-30 dark:bg-slate-950/80">
        <div className="mx-auto max-w-[1400px] px-4 py-3 flex items-center justify-between gap-4">
          {/* --- Logo + Title --- */}
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white text-lg shadow-sm dark:bg-slate-100 dark:text-slate-900">
              ⚡
            </span>
            <div>
              <h1 className="text-lg font-bold leading-tight">CRM SaaS</h1>
              <p className="text-xs text-slate-500 leading-tight">
                Welcome back, {user?.name || user?.user?.name || "User"} 👋
              </p>
            </div>
          </div>

          {/* --- Actions --- */}
          <div className="flex items-center gap-3 relative">
            {/* 🔍 Search */}
            <form
              onSubmit={(e) => e.preventDefault()}
              className="hidden sm:block"
            >
              <div className="relative">
                <input
                  className="w-[280px] rounded-xl border pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-slate-400/40 dark:bg-slate-900 dark:border-slate-800"
                  placeholder="Global search…"
                />
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </form>

            {/* 🌓 Theme Toggle */}
            <ThemeToggle />

            {/* 🔔 Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative h-9 w-9 rounded-full border grid place-items-center text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Bell size={18} />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border rounded-xl shadow-lg dark:bg-slate-900 dark:border-slate-800 z-50">
                  <div className="p-2 border-b text-sm font-medium flex items-center justify-between dark:border-slate-800">
                    Notifications
                    {loadingNotifs && (
                      <Loader2
                        className="animate-spin text-slate-400"
                        size={14}
                      />
                    )}
                  </div>
                  <ul className="max-h-80 overflow-auto">
                    {notifications.length > 0 ? (
                      notifications.map((n, idx) => (
                        <li
                          key={idx}
                          className="px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 border-b last:border-none dark:border-slate-800"
                        >
                          <p className="font-medium text-slate-800 dark:text-slate-200">
                            {n.type || "Notification"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {n.message || "—"}
                          </p>
                          {n.createdAt && (
                            <p className="text-xs text-slate-400 mt-1">
                              {new Date(n.createdAt).toLocaleString()}
                            </p>
                          )}
                        </li>
                      ))
                    ) : (
                      <li className="px-3 py-3 text-sm text-slate-500 text-center">
                        No notifications yet
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* 🙂 User Info */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2"
              >
                <div className="h-9 w-9 rounded-full bg-slate-200 grid place-items-center text-slate-700 dark:bg-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition">
                  🙂
                </div>
                <div className="hidden md:block text-sm text-left">
                  <div className="font-medium">
                    {user?.name || user?.user?.name || "User"}
                  </div>
                  <div className="text-xs text-slate-500 capitalize">
                    {user?.role || user?.user?.role || "Role"}
                  </div>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-lg dark:bg-slate-900 dark:border-slate-800 z-50">
                  {/* ✅ Go to Profile */}
                  <button
                    onClick={() => {
                      setActive("Profile"); // ✅ switch to profile
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <User size={16} />
                    <span>Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      if ((user?.role || user?.user?.role) === "operator") {
                        setShowLogoutDialog(true);
                        setShowUserMenu(false);
                      } else {
                        logout();
                      }
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-slate-800"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* === Logout Reason Dialog === */}
      {showLogoutDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border dark:border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Logout Reason</h2>
              <button
                onClick={() => {
                  setShowLogoutDialog(false);
                  setLogoutReason("");
                  setError("");
                }}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Please enter a reason for logging out or completing your work.
              Minimum 30 characters required.
            </p>

            <textarea
              rows="4"
              value={logoutReason}
              onChange={(e) => setLogoutReason(e.target.value)}
              placeholder="Enter your reason..."
              className="w-full border rounded-xl px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-slate-400/50"
            />

            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowLogoutDialog(false);
                  setLogoutReason("");
                  setError("");
                }}
                className="px-4 py-2 text-sm rounded-xl border dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutSubmit}
                className="px-4 py-2 text-sm rounded-xl bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900 disabled:opacity-50"
                disabled={logoutReason.trim().length < 30}
              >
                Submit & Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
