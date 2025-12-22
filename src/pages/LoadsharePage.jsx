import React, { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import AddLoadshareModal from "../components/modals/AddLoadshareModal";
import { useAuth } from "../context/AuthContext";
import EditLoadshareModal from "../components/modals/EditLoadshareModal";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/loadshare`;

export default function LoadsharePage({
  cluster,
  globalSearchValue,
  clearGlobalSearch,
  onBack,
}) {
  const { user } = useAuth();
  const role = (user?.role || user?.user?.role)?.toLowerCase();
  const [search, setSearch] = useState(globalSearchValue || "");
  const [searchConsumed, setSearchConsumed] = useState(false);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [importSummary, setImportSummary] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [editRecord, setEditRecord] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  const headers = [
    "Sl. No.",
    "Location",
    "Address",
    "State",
    "Circuit ID",
    "ISP",
    "RT #",
    "Invoice #",
    "Speed",
    "Status",
    "Validity (days)",
    "Paid by",
    "Activation Date",
    "Expiry Date",
    "Installation",
    "Internet",
    "GST %",
    "GST Amt",
    "Total Payable",
    "Month",
    "Requested By",
    "Approved From",
    "Wifi/Number",
    "Hub SPOC Name",
    "Hub SPOC Number",
    "Actions",
  ];

  function handleBack() {
    setSearch(""); // ✅ clear input
    onBack?.(); // ⬅️ go back
  }

  useEffect(() => {
    if (cluster.id) fetchRecords();
  }, [search, cluster.id]);

  useEffect(() => {
    if (!globalSearchValue) return;

    setSearch(globalSearchValue);
    fetchRecords();

    // ✅ clear it after consuming
    clearGlobalSearch?.();
  }, [globalSearchValue]);

  const getAuthHeaders = (extra = {}) => {
    const token = localStorage.getItem("auth_token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extra,
    };
  };

  async function fetchRecords() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `${API_URL}?search=${encodeURIComponent(search)}&clusterId=${
          cluster.id
        }`,
        { headers: getAuthHeaders() }
      );

      const json = await res.json();
      const data = json?.data?.data ?? json?.data ?? [];
      setRecords(Array.isArray(data) ? data : []);

      // ✅ CLEAR search once it has been used
      if (searchConsumed) {
        setSearch("");
        setSearchConsumed(false);
      }
    } catch (err) {
      console.error("Error fetching records:", err);
      setError("Failed to load records.");
    } finally {
      setLoading(false);
    }
  }

  const filteredRecords = records.filter((r) => {
    if (selectedMonth === "") return true; // Show everything if no month selected
    if (!r.expiryDate) return false; // Hide records without expiry date if a month is selected

    const expiryDate = new Date(r.expiryDate);
    // getMonth() returns 0 for Jan, 1 for Feb, etc.
    return expiryDate.getMonth() === parseInt(selectedMonth);
  });

  async function handleExportExcel() {
    try {
      setDownloading(true);

      // 1. Construct query parameters
      const params = new URLSearchParams();
      params.append("clusterId", cluster.id);

      // 2. Only append month if a specific one is selected (0-11)
      // The backend uses this to filter the Prisma query by expiryDate
      if (selectedMonth !== "" && selectedMonth !== null) {
        params.append("month", selectedMonth.toString());
      }

      // 3. Construct the full URL for the request
      const exportUrl = `${API_URL}/export/excel?${params.toString()}`;

      const res = await fetch(exportUrl, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to fetch Excel file");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // 4. Set a dynamic filename for better user experience
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const monthLabel =
        selectedMonth !== "" ? `_${months[selectedMonth]}` : "_All";

      a.download = `LoadShare_Export${monthLabel}_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;

      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Excel export failed:", err);
      alert(`Export failed: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  }

  async function handleImportExcel(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!cluster.id) {
      alert("Cluster ID missing. Open loadshares from a cluster first.");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("auth_token");

      // ✅ Pass clusterId separately in query
      const res = await fetch(
        `${API_URL}/import/excel?clusterId=${encodeURIComponent(cluster.id)}`,
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        }
      );

      const result = await res.json();

      if (result?.success) {
        setImportSummary({
          imported: result.imported,
          skipped: result.skippedCount || 0,
          missing: result.missingRtNumbers || [],
          duplicates: result.duplicateRtNumbers || [],
        });
        fetchRecords();
      } else {
        alert(result?.message || "Excel import failed.");
      }
    } catch (err) {
      console.error("Excel import failed:", err);
      alert("Failed to import Excel file.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      fetchRecords();
    } catch (err) {
      console.error(err);
      alert("Error deleting record.");
    }
  }

  async function handleDeleteAll() {
    if (
      !window.confirm(
        "⚠️ This will permanently delete all records for this cluster. Continue?"
      )
    )
      return;
    try {
      const res = await fetch(
        `${API_URL}/clear/cluster?clusterId=${cluster.id}`, // ✅ use 'cluster' instead of 'all'
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );
      const json = await res.json();
      if (json.success) {
        alert("🧹 All records deleted successfully!");
        setRecords([]);
      } else {
        alert(json.message || "Failed to delete all records.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting all records.");
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs active="loadshare" onBack={handleBack} />

      <Card
        title={cluster.name}
        subtitle="Manage and monitor all load share connections."
        right={
          <div className="flex gap-2 items-center flex-wrap relative">
            {/* 2. Month Filter - Visible */}
            <select
              className="border rounded-xl px-3 py-1.5 text-sm w-36 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-slate-400 outline-none"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="">All Expiry</option>
              {[
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ].map((m, i) => (
                <option key={m} value={i}>
                  {m}
                </option>
              ))}
            </select>

            {/* 3. Search Bar - Visible */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchRecords()}
                className="border rounded-xl px-3 py-1.5 text-sm w-48 pr-8"
              />
            </div>

            {/* 4. The Unified "Actions" Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm hover:bg-slate-800 transition-all shadow-md"
              >
                <span>Actions</span>
                <span
                  className={`text-xs transition-transform ${
                    showMenu ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              {showMenu && (
                <>
                  {/* Overlay to close menu */}
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setShowMenu(false)}
                  ></div>

                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-30 py-2 animate-in fade-in zoom-in duration-150">
                    {/* Add Record */}
                    <button
                      onClick={() => {
                        setShowAddModal(true);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
                    >
                      <span className="text-lg">+</span> Add New Record
                    </button>

                    <hr className="my-1 border-slate-100 dark:border-slate-700" />

                    {/* Import Action */}
                    <label className="flex items-center px-4 py-2.5 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 gap-3">
                      <span className="text-base">📥</span>
                      {uploading ? "Uploading..." : "Import Excel"}
                      <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={(e) => {
                          handleImportExcel(e);
                          setShowMenu(false);
                        }}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>

                    {/* Export Action */}
                    <button
                      onClick={() => {
                        handleExportExcel();
                        setShowMenu(false);
                      }}
                      disabled={downloading} // ✅ Now 'downloading' is used!
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 ${
                        downloading
                          ? "text-slate-400 cursor-not-allowed"
                          : "hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <span className="text-base">
                        {downloading ? "⌛" : "📤"}
                      </span>
                      {downloading ? "Exporting..." : "Export Excel"}
                    </button>

                    {/* Dangerous Action (Admin Only) */}
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
                          <span className="text-base">🧹</span> Delete All
                          Records
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
            {/* 1. Back Button - Visible */}
            <button
              onClick={handleBack}
              className="gap-2 bg-slate-900 text-white inline-flex items-center rounded-xl border px-3 py-2 text-sm transition-colors"
            >
              ← Back
            </button>
          </div>
        }
      >
        {importSummary && (
          <div className="border rounded-xl p-4 bg-green-50 dark:bg-green-900/30 text-sm mb-4">
            <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">
              ✅ Import Summary
            </h3>
            <p>
              <strong>Imported:</strong> {importSummary.imported}
            </p>
            <p>
              <strong>Skipped:</strong> {importSummary.skipped}
            </p>
            {importSummary.missing.length > 0 && (
              <p className="text-yellow-700 mt-2">
                ⚠️ Missing RT Numbers: {importSummary.missing.join(", ")}
              </p>
            )}
            {importSummary.duplicates.length > 0 && (
              <p className="text-orange-600 mt-1">
                🔁 Duplicate RT Numbers: {importSummary.duplicates.join(", ")}
              </p>
            )}
            <button
              onClick={() => setImportSummary(null)}
              className="mt-3 px-3 py-1 text-xs rounded-xl border hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-center py-6 text-slate-500">Loading...</p>
        ) : error ? (
          <p className="text-center py-6 text-red-500">{error}</p>
        ) : records.length === 0 ? (
          <p className="text-center py-6 text-slate-500 italic">
            No records found.
          </p>
        ) : (
          <div className="overflow-auto border rounded-2xl dark:border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 dark:bg-slate-900 sticky top-0 z-10">
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
                {filteredRecords.map((r, idx) => (
                  <tr
                    key={r.id || idx}
                    className="border-t hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    <td className="px-3 py-2">{idx + 1}</td>
                    <td className="px-3 py-2">{r.nameOfLocation}</td>
                    <td className="px-3 py-2">{r.address}</td>
                    <td className="px-3 py-2">{r.state}</td>
                    <td className="px-3 py-2">{r.circuitId}</td>
                    <td className="px-3 py-2">{r.isp}</td>
                    <td className="px-3 py-2">{r.rtNumber}</td>
                    <td className="px-3 py-2">{r.invoice}</td>
                    <td className="px-3 py-2">{r.speed}</td>
                    <td className="px-3 py-2">{r.status}</td>
                    <td className="px-3 py-2">{r.validity}</td>
                    <td className="px-3 py-2">{r.paidBy}</td>
                    <td className="px-3 py-2">
                      {r.activationDate
                        ? new Date(r.activationDate).toLocaleDateString("en-GB")
                        : "-"}
                    </td>
                    <td className="px-3 py-2">
                      {r.expiryDate
                        ? new Date(r.expiryDate).toLocaleDateString("en-GB")
                        : "-"}
                    </td>
                    <td className="px-3 py-2">
                      ₹
                      {Number(r.installationCharges || 0).toLocaleString(
                        "en-IN"
                      )}
                    </td>
                    <td className="px-3 py-2">
                      ₹{Number(r.internetCharges || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-3 py-2">{r.gstPercent}%</td>
                    <td className="px-3 py-2">
                      ₹{Number(r.gstAmount || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-3 py-2 font-semibold">
                      ₹{Number(r.totalPayable || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-3 py-2">{r.month}</td>
                    <td className="px-3 py-2">{r.requestedBy}</td>
                    <td className="px-3 py-2">{r.approvedFrom}</td>
                    <td className="px-3 py-2">{r.wifiOrNumber}</td>
                    <td className="px-3 py-2">{r.hubSpocName}</td>
                    <td className="px-3 py-2">{r.hubSpocNumber}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex gap-2">
                        {/* ✅ NEW EDIT BUTTON */}
                        <button
                          onClick={() => setEditRecord(r)}
                          className="text-blue-600 text-xs border rounded-xl px-3 py-1.5 hover:bg-blue-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="text-red-600 text-xs border rounded-xl px-3 py-1.5 hover:bg-red-50"
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
        <AddLoadshareModal
          onClose={() => setShowAddModal(false)}
          onAdd={fetchRecords}
          clusterId={cluster.id}
        />
      )}
      {/* ✅ NEW EDIT MODAL INTEGRATION */}
      {editRecord && (
        <EditLoadshareModal
          record={editRecord}
          onClose={() => setEditRecord(null)}
          onUpdate={() => {
            setEditRecord(null);
            fetchRecords();
          }}
        />
      )}
    </div>
  );
}
