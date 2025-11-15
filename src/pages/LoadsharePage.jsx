import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Card from "../components/ui/Card";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import AddLoadshareModal from "../components/modals/AddLoadshareModal";

const API_URL = "http://localhost:3000/loadshare";

export default function LoadsharePage() {
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [importedData, setImportedData] = useState([]); // ✅ preview data
  const [uploading, setUploading] = useState(false);

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

  async function fetchRecords() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `${API_URL}?search=${encodeURIComponent(search)}`
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

  async function handleExport() {
    try {
      const res = await fetch(`${API_URL}/export/json`);
      const json = await res.json();
      const blob = new Blob([JSON.stringify(json.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "loadshare_export.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export data.");
      console.error(err);
    }
  }

  // ✅ Import Excel handler (FormData upload)
  async function handleImportExcel(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // 🧩 Show preview before upload
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
      setImportedData(json);

      // 🧩 Prepare form data
      const formData = new FormData();
      formData.append("file", file);

      setUploading(true);

      const res = await fetch(`${API_URL}/import/excel`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (result?.success) {
        alert(result?.data?.message || "Excel imported successfully!");
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
      e.target.value = ""; // reset input for next upload
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      fetchRecords();
    } catch (err) {
      alert("Error deleting record.");
      console.error(err);
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

            {/* ✅ Excel Import */}
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

            <button
              onClick={handleExport}
              className="inline-flex items-center rounded-xl border px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              Export JSON
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
        {/* Loader / Error / Empty State */}
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
