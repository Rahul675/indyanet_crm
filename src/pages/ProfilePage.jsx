import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Clock,
  Loader2,
  Save,
} from "lucide-react";
import Card from "../components/ui/Card";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // 🔹 Fetch current user details from backend (optional)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // If backend has /auth/users/:id
        const res = await fetch(`${API_URL}/auth/users`);
        const data = await res.json();

        if (res.ok) {
          const found = Array.isArray(data)
            ? data.find(
                (u) => u.email === user?.user?.email || u.email === user?.email
              )
            : null;
          setProfile(found || user?.user || user);
        } else {
          setProfile(user?.user || user);
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        setProfile(user?.user || user);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [API_URL, user]);

  // 🧩 Handle profile updates (placeholder)
  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await new Promise((r) => setTimeout(r, 1000)); // mock save delay
      setMessage("✅ Profile updated successfully!");
    } catch {
      setMessage("❌ Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-slate-400" size={28} />
      </div>
    );

  if (!profile)
    return (
      <div className="p-6 text-center text-slate-500 italic">
        Could not load profile details.
      </div>
    );

  return (
    <div className="space-y-6">
      <Breadcrumbs active="Profile" />

      <Card
        title="My Profile"
        subtitle="View and update your account details"
        right={
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Save size={16} />
            )}
            Save Changes
          </button>
        }
      >
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Full Name
              </label>
              <div className="flex items-center gap-2">
                <User size={16} className="text-slate-400" />
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  className="w-full border rounded-xl px-3 py-2 text-sm dark:bg-slate-900 dark:border-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-slate-400" />
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full border rounded-xl px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 dark:border-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-slate-400" />
                <input
                  type="text"
                  value={profile.role || "operator"}
                  disabled
                  className="w-full border rounded-xl px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 dark:border-slate-700 capitalize"
                />
              </div>
            </div>
          </div>

          {/* Right: Status */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                  profile.isOnline
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    profile.isOnline ? "bg-green-500" : "bg-slate-400"
                  }`}
                />
                {profile.isOnline ? "Online" : "Offline"}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Last Login
              </label>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Calendar size={16} />
                {profile.lastLoginAt
                  ? new Date(profile.lastLoginAt).toLocaleString()
                  : "—"}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Last Logout
              </label>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Clock size={16} />
                {profile.lastLogoutAt
                  ? new Date(profile.lastLogoutAt).toLocaleString()
                  : "—"}
              </div>
            </div>
          </div>
        </div>

        {message && (
          <p
            className={`mt-4 text-sm ${
              message.startsWith("✅") ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
      </Card>
    </div>
  );
}
