import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Card from "../components/ui/Card";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import AddLoadshareModal from "../components/modals/AddLoadshareModal";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/loadshare`;

export default function LoadsharePage() {
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [importedData, setImportedData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [importSummary, setImportSummary] = useState(null);

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
    "",
  ];

  useEffect(() => {
    fetchRecords();
  }, []);

  // Helper — always include token
  function getAuthHeaders(extra = {}) {
    const token = localStorage.getItem("auth_token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extra,
    };
  }

  async function fetchRecords() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(
        `${API_URL}?search=${encodeURIComponent(search)}`,
        { headers: getAuthHeaders() }
      );
      const json = await res.json();
      const data = json?.data?.data ?? json?.data ?? [];
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching records:", err);
      setError("Failed to load records from backend.");
    } finally {
      setLoading(false);
    }
  }

  async function handleExportExcel() {
    try {
      setDownloading(true);
      const res = await fetch(`${API_URL}/export/excel`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch Excel file");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `LoadShare_Export_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Excel export failed:", err);
      alert("Failed to export Excel file.");
    } finally {
      setDownloading(false);
    }
  }

  async function handleImportExcel(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      setUploading(true);
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_URL}/import/excel`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {}, // ✅ no Content-Type
        body: formData,
      });

      const result = await res.json();
      if (result?.success) {
        setImportSummary({
          imported: result.imported,
          skipped: result.skipped,
          missing: result.missingRtNumbers || [],
          duplicates: result.duplicateRtNumbers || [],
        });
        setImportedData([]);
        fetchRecords();
      } else {
        alert(result?.message || "Excel import failed.");
      }
    } catch (err) {
      console.error("Excel import failed:", err);
      alert("Failed to import Excel file. Please check the format.");
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
      alert("Error deleting record.");
      console.error(err);
    }
  }

  async function handleDeleteAll() {
    if (
      !window.confirm("⚠️ This will permanently delete all records. Continue?")
    )
      return;
    try {
      const res = await fetch(`${API_URL}/clear/all`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        alert("🧹 All records deleted successfully!");
        setRecords([]);
      } else {
        alert(json.message || "Failed to delete all records.");
      }
    } catch (err) {
      console.error("Delete all failed:", err);
      alert("Error deleting all records.");
    }
  }

  const displayData = importedData.length > 0 ? importedData : records;

  return (
    <div className="space-y-6">
      <Breadcrumbs active="loadshare" />

      <Card
        title="Loadshare"
        subtitle="Manage and monitor all load share connections."
        right={
          <div className="flex gap-2 items-center flex-wrap">
            <input
              type="text"
              placeholder="Search by RT # or Location"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchRecords()}
              className="border rounded-xl px-3 py-1.5 text-sm w-56"
            />

            {/* ✅ Import Excel */}
            <label className="inline-flex items-center rounded-xl border px-3 py-2 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900">
              {uploading ? "Uploading..." : "Import Excel"}
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleImportExcel}
                className="hidden"
                disabled={uploading}
              />
            </label>

            {/* ✅ Export Excel */}
            <button
              onClick={handleExportExcel}
              disabled={downloading}
              className="inline-flex items-center rounded-xl border px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              {downloading ? "Exporting..." : "Export Excel"}
            </button>

            {/* ✅ Delete All */}
            <button
              onClick={handleDeleteAll}
              className="inline-flex items-center rounded-xl border border-red-600 text-red-600 px-3 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/30"
            >
              🧹 Delete All
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center rounded-xl border px-3 py-2 text-sm bg-slate-900 text-white hover:bg-slate-800"
            >
              + Add
            </button>
          </div>
        }
      >
        {/* ✅ Import Summary */}
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

        {/* ✅ Table */}
        {loading ? (
          <p className="text-center py-6 text-slate-500">Loading...</p>
        ) : error ? (
          <p className="text-center py-6 text-red-500">{error}</p>
        ) : displayData.length === 0 ? (
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
                {displayData.map((r, idx) => (
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
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-red-600 text-xs border rounded-xl px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/30"
                      >
                        Delete
                      </button>
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
        />
      )}
    </div>
  );
}
