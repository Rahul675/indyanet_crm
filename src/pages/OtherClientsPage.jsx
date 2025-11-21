import React, { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import AddOtherClientModal from "../components/modals/AddOtherClientModal";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/other-clients`;

export default function OtherClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchClients();
  }, []);

  // 🔹 Fetch all or filtered
  async function fetchClients() {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_URL}?search=${encodeURIComponent(search)}`
      );
      const json = await res.json();

      const data = json.data?.data || json.data || [];
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Could not load clients from backend.");
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Export CSV
  const handleExport = async () => {
    const res = await fetch(`${API_URL}/export/json`);
    const json = await res.json();
    const blob = new Blob([JSON.stringify(json.data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "other_clients.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // 🔹 Import JSON
  async function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();

    try {
      const json = JSON.parse(text);
      const res = await fetch(`${API_URL}/import/json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });
      const result = await res.json();
      alert(result.message || "Import successful!");
      fetchClients();
    } catch {
      alert("Invalid JSON file");
    }
  }

  // 🔹 Delete client
  async function handleDelete(id) {
    if (!window.confirm("Delete this record?")) return;
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    fetchClients();
  }

  const headers = [
    "S.no",
    "SITE",
    "LAN-IP",
    "REMARKS",
    "MAC ID",
    "LANDLINE & WIFI ID",
    "Speed mbps",
    "INTERNET",
    "INSTALLATION",
    "PREVIOUS INTERNET BILL",
    "RECEIVED",
    "DISPATCH",
    "DATE",
    "Reached DAY",
    "Installation Date",
    "A Spoke",
    "Contact No.",
    "DVR Connected",
    "SIM NO",
    "Device name",
    "Device license",
    "",
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs active="other clients" />
      <Card
        title="Other Clients"
        subtitle="Installation status, networking, device & SIM info."
        right={
          <div className="flex gap-2 items-center flex-wrap">
            <input
              type="text"
              placeholder="Search by site or LAN-IP"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchClients()}
              className="border rounded-xl px-3 py-1.5 text-sm w-56"
            />
            <label className="inline-flex items-center rounded-xl border px-3 py-2 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900">
              Import JSON
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            <button
              onClick={handleExport}
              className="inline-flex items-center rounded-xl border px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              Export JSON
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center rounded-xl border px-3 py-2 text-sm bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900"
            >
              + Add Client
            </button>
          </div>
        }
      >
        {loading ? (
          <p className="p-4 text-center text-slate-500">Loading clients...</p>
        ) : error ? (
          <p className="p-4 text-center text-red-500">{error}</p>
        ) : clients.length === 0 ? (
          <p className="p-4 text-center text-slate-500 italic">
            No clients found.
          </p>
        ) : (
          <div className="overflow-auto border rounded-2xl dark:border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 sticky top-0 dark:bg-slate-900">
                <tr>
                  {headers.map((h) => (
                    <th
                      key={h}
                      className="text-left font-semibold px-3 py-2 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clients.map((r, i) => (
                  <tr
                    key={r.id || i}
                    className="border-t hover:bg-slate-50 dark:hover:bg-slate-900 dark:border-slate-800"
                  >
                    <td className="px-3 py-2">{i + 1}</td>
                    <td className="px-3 py-2">{r.site}</td>
                    <td className="px-3 py-2 font-mono">{r.lanIp}</td>
                    <td className="px-3 py-2">{r.remarks}</td>
                    <td className="px-3 py-2 font-mono">{r.macId}</td>
                    <td className="px-3 py-2">{r.landlineWifiId}</td>
                    <td className="px-3 py-2">{r.speedMbps}</td>
                    <td className="px-3 py-2">{r.internet}</td>
                    <td className="px-3 py-2">{r.installation}</td>
                    <td className="px-3 py-2">{r.previousInternetBill}</td>
                    <td className="px-3 py-2">{r.received}</td>
                    <td className="px-3 py-2">{r.dispatch}</td>
                    <td className="px-3 py-2">{r.date}</td>
                    <td className="px-3 py-2">{r.reachedDay}</td>
                    <td className="px-3 py-2">{r.installationDate}</td>
                    <td className="px-3 py-2">{r.aSpoke}</td>
                    <td className="px-3 py-2">{r.contactNo}</td>
                    <td className="px-3 py-2">{r.dvrConnected}</td>
                    <td className="px-3 py-2 font-mono">{r.simNo}</td>
                    <td className="px-3 py-2">{r.deviceName}</td>
                    <td className="px-3 py-2">{r.deviceLicense}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="inline-flex items-center rounded-xl border px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showAddModal && (
        <AddOtherClientModal
          onClose={() => setShowAddModal(false)}
          onAdd={fetchClients}
        />
      )}
    </div>
  );
}
