import { useRef } from "react";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import Card from "../components/ui/Card";

export default function SettingsPage() {
  const fileInputRef = useRef(null);

  // 🧩 Handle backup (download localStorage or app data)
  const handleBackup = () => {
    const data = {
      timestamp: new Date().toISOString(),
      localStorage: { ...localStorage },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `crm-backup-${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 🧩 Handle restore (upload JSON)
  const handleRestore = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.localStorage) {
          Object.entries(parsed.localStorage).forEach(([k, v]) => {
            localStorage.setItem(k, v);
          });
          alert("✅ Backup restored successfully! Reloading...");
          window.location.reload();
        } else {
          alert("❌ Invalid backup file format.");
        }
      } catch {
        alert("❌ Failed to read JSON file.");
      }
    };
    reader.readAsText(file);
  };

  // ⚠️ Clear all local data
  const handleClearData = () => {
    if (
      window.confirm(
        "This will permanently clear all local data including cached user info and settings. Continue?"
      )
    ) {
      localStorage.clear();
      sessionStorage.clear();
      alert("🧹 Local data cleared.");
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs active="Settings" />

      <Card title="Settings" subtitle="Backup & restore data">
        <div className="grid md:grid-cols-2 gap-4">
          {/* === Backup Section === */}
          <div className="rounded-xl border p-4 dark:border-slate-800">
            <div className="font-medium mb-2">Full Backup</div>
            <p className="text-sm text-slate-500 mb-3">
              Export your local CRM data as a backup file.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleBackup}
                className="inline-flex items-center rounded-xl border px-3 py-2 text-sm bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900"
              >
                Download JSON
              </button>

              <button
                onClick={() => fileInputRef.current.click()}
                className="inline-flex items-center rounded-xl border px-3 py-2 text-sm"
              >
                Restore JSON
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleRestore}
              />
            </div>
          </div>

          {/* === Danger Zone === */}
          <div className="rounded-xl border p-4 dark:border-slate-800">
            <div className="font-medium mb-2 text-red-600">Danger Zone</div>
            <p className="text-sm text-slate-500 mb-3">
              Permanently remove all locally stored CRM data.
            </p>
            <button
              onClick={handleClearData}
              className="inline-flex items-center rounded-xl border px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-slate-900"
            >
              Clear All Local Data
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
