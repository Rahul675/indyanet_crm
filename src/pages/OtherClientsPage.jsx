/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import AddOtherClientModal from "../components/modals/AddOtherClientModal";
// import EditOtherClientModal from "../components/modals/EditOtherClientModal";
import { useAuth } from "../context/AuthContext";
import EditOtherClientModal from "../components/modals/EditOtherClientModal";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/other-clients`;

export default function OtherClientsPage() {
  const { user } = useAuth();
  const role = (user?.role || user?.user?.role)?.toLowerCase();

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [search, setSearch] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    fetchClients();
  }, [search]);

  // Helper for consistent headers
  const getAuthHeaders = (extra = {}) => {
    const token = localStorage.getItem("auth_token");
    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extra,
    };
  };

  async function fetchClients() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(
        `${API_URL}?search=${encodeURIComponent(search)}`,
        { headers: getAuthHeaders() }
      );
      const json = await res.json();

      // Matches the backend structure from your curl result: json.data.data
      const data = json.data?.data || json.data || [];
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Could not load clients from backend.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAll() {
    if (
      !window.confirm(
        "⚠️ DANGER: This will permanently delete ALL Other Client records. Continue?"
      )
    )
      return;

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/clear/all`, {
        method: "DELETE",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        alert(`🧹 Success: ${json.data?.message || "Records deleted"}`);
        setClients([]);
      } else {
        alert(json.message || "Failed to delete all records.");
      }
    } catch (err) {
      console.error("Delete All Error:", err);
      alert("An error occurred during deletion.");
    } finally {
      setLoading(false);
    }
  }

  const handleExport = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/export/excel`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Other_Clients_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export Excel file.");
    } finally {
      setLoading(false);
    }
  };

  async function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/import/excel`, {
        method: "POST",
        headers: getAuthHeaders(), // Do NOT add Content-Type for FormData
        body: formData,
      });

      const result = await res.json();
      if (res.ok && result.success) {
        alert(`✅ Imported records!`);
        // alert(`✅ Imported ${result.imported || 0} records!`);
        fetchClients();
      } else {
        alert(result.message || "Import failed");
      }
    } catch (err) {
      alert("Error uploading file.");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this record permanently?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res.ok) fetchClients();
    } catch (err) {
      alert("Error deleting record");
    }
  }

  const headers = [
    "S.no",
    "SITE",
    "PUBLIC IP 1",
    "ISP 1",
    "LAN-IP",
    "MAC ID",
    "SPEED",
    "REMARKS",
    "INSTALL DATE",
    "CONTACT",
    "SIM NO",
    "ACTIONS",
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs active="other clients" />
      <Card
        title="Other Clients"
        subtitle="Manage configurations and installation status."
        right={
          <div className="flex gap-2 items-center flex-wrap relative">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search site, IP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border rounded-xl px-3 py-1.5 text-sm w-48 pr-8 focus:ring-2 focus:ring-slate-400 outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  ×
                </button>
              )}
            </div>

            {/* Add Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm hover:bg-slate-800 transition-all shadow-md active:scale-95"
            >
              + Add
            </button>

            {/* Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-xl border hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="font-bold text-lg leading-none">⋮</span>
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setShowMenu(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-30 py-2 animate-in fade-in zoom-in duration-150">
                    <label className="flex items-center px-4 py-2.5 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 gap-3">
                      <span>📥</span> Import Excel
                      <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={(e) => {
                          handleImport(e);
                          setShowMenu(false);
                        }}
                        className="hidden"
                      />
                    </label>

                    <button
                      onClick={() => {
                        handleExport();
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
                    >
                      <span>📤</span> Export Excel
                    </button>

                    {role === "admin" && (
                      <>
                        <hr className="my-1 border-slate-100 dark:border-slate-700" />
                        <button
                          onClick={() => {
                            handleDeleteAll();
                            setShowMenu(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3"
                        >
                          <span>🧹</span> Delete All Records
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        }
      >
        {loading && !clients.length ? (
          <p className="p-10 text-center text-slate-500 animate-pulse font-medium">
            Synchronizing with server...
          </p>
        ) : error ? (
          <p className="p-10 text-center text-red-500 bg-red-50 rounded-xl m-4">
            {error}
          </p>
        ) : (
          <div className="overflow-auto border rounded-2xl dark:border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 sticky top-0 dark:bg-slate-900 z-10">
                <tr>
                  {headers.map((h) => (
                    <th
                      key={h}
                      className="text-left font-semibold px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-800">
                {clients.map((r, i) => (
                  <tr
                    key={r.id || i}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                      {r.site}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono bg-slate-50/50 dark:bg-slate-900/30">
                      {r.publicIp1 || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {r.isp1 || "-"}
                    </td>
                    <td className="px-4 py-3 font-mono text-blue-600 dark:text-blue-400">
                      {r.lanIp}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-500">
                      {r.macId}
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-pre-line leading-relaxed">
                      {r.speedMbps}
                    </td>
                    <td className="px-4 py-3 text-slate-500 italic max-w-[150px] truncate">
                      {r.remarks}
                    </td>
                    {/* <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          r.internetInstallation === "DONE"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {r.internetInstallation || "Pending"}
                      </span>
                    </td> */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {r.installationDate
                        ? new Date(r.installationDate).toLocaleDateString(
                            "en-GB"
                          )
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {r.contactNo}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{r.simNo}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditRecord(r)}
                          className="text-blue-600 text-xs border border-blue-200 rounded-xl px-2.5 py-1 hover:bg-blue-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="text-red-600 text-xs border border-red-200 rounded-xl px-2.5 py-1 hover:bg-red-50 transition-colors"
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

      {editRecord && (
        <EditOtherClientModal
          record={editRecord}
          onClose={() => setEditRecord(null)}
          onUpdate={() => {
            setEditRecord(null);
            fetchClients();
          }}
        />
      )}
    </div>
  );
}
