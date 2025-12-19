import React, { useState, useEffect } from "react";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/loadshare`;

export default function EditLoadshareModal({ record, onClose, onUpdate }) {
  const [form, setForm] = useState({
    nameOfLocation: "",
    address: "",
    state: "",
    circuitId: "",
    isp: "",
    rtNumber: "",
    invoice: "",
    speed: "",
    status: "Active",
    validity: 30,
    paidBy: "Client",
    activationDate: "",
    expiryDate: "",
    installationCharges: 0,
    internetCharges: 0,
    gstPercent: 18,
    month: "",
    requestedBy: "",
    approvedFrom: "",
    wifiOrNumber: "",
    hubSpocName: "",
    hubSpocNumber: "",
  });

  // Helper to format ISO dates to YYYY-MM-DD for input fields
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  };

  useEffect(() => {
    if (record) {
      setForm({
        ...record,
        // Ensure dates are in YYYY-MM-DD format for the <input type="date">
        activationDate: formatDateForInput(record.activationDate),
        expiryDate: formatDateForInput(record.expiryDate),
        // Ensure numbers are numbers
        validity: record.validity || 0,
        installationCharges: record.installationCharges || 0,
        internetCharges: record.internetCharges || 0,
        gstPercent: record.gstPercent || 18,
      });
    }
  }, [record]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();

    const token = localStorage.getItem("auth_token");
    if (!token) {
      alert("❌ You are not logged in!");
      return;
    }

    // Clean data for backend
    const cleanData = {
      ...form,
      validity: Number(form.validity),
      installationCharges: Number(form.installationCharges),
      internetCharges: Number(form.internetCharges),
      gstPercent: Number(form.gstPercent),
      activationDate: form.activationDate
        ? new Date(form.activationDate).toISOString()
        : null,
      expiryDate: form.expiryDate
        ? new Date(form.expiryDate).toISOString()
        : null,
    };

    try {
      // Use PATCH and target the specific record ID
      const res = await fetch(`${API_URL}/${record.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cleanData),
      });

      const json = await res.json();

      if (json.success) {
        alert("✅ Record updated successfully!");
        onUpdate(); // Refetch records in parent
        onClose(); // Close modal
      } else {
        alert(json.message || "❌ Failed to update record");
      }
    } catch (err) {
      console.error("PATCH error:", err);
      alert("⚠️ Error updating record");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="sticky top-0 flex justify-between items-center p-6 border-b bg-white dark:bg-slate-900 rounded-t-2xl z-10">
          <h2 className="text-lg font-semibold">
            Edit Loadshare Record: {record.rtNumber}
          </h2>
          <button
            onClick={onClose}
            className="text-xl font-bold text-slate-400 hover:text-black dark:hover:text-white"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm p-6"
        >
          {Object.entries({
            nameOfLocation: "Name of Location",
            address: "Address",
            state: "State",
            circuitId: "Circuit ID",
            isp: "ISP Name",
            rtNumber: "RT Number",
            invoice: "Invoice #",
            speed: "Speed",
            status: "Connection Status",
            validity: "Validity (Days)",
            paidBy: "Paid By",
            activationDate: "Activation Date",
            expiryDate: "Expiry Date",
            installationCharges: "Installation Charges (₹)",
            internetCharges: "Internet Charges (₹)",
            gstPercent: "GST %",
            month: "Billing Month (YYYY-MM)",
            requestedBy: "Requested By",
            approvedFrom: "Approved From",
            wifiOrNumber: "WiFi / Number",
            hubSpocName: "Hub SPOC Name",
            hubSpocNumber: "Hub SPOC Number",
          }).map(([key, label]) => (
            <div key={key}>
              <label className="block mb-1 font-medium text-slate-700 dark:text-slate-300">
                {label}
              </label>
              <input
                name={key}
                type={
                  key.includes("Date")
                    ? "date"
                    : key.includes("Charges") ||
                      key === "validity" ||
                      key === "gstPercent"
                    ? "number"
                    : "text"
                }
                value={form[key] || ""}
                onChange={handleChange}
                className="border dark:border-slate-700 dark:bg-slate-800 rounded-lg p-2 w-full focus:ring-2 focus:ring-slate-500 outline-none"
                required={["nameOfLocation", "address", "rtNumber"].includes(
                  key
                )}
              />
            </div>
          ))}

          {/* Form Actions */}
          <div className="col-span-1 md:col-span-2 flex justify-end gap-3 pt-6 sticky bottom-0 bg-white dark:bg-slate-900 border-t mt-4 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="border rounded-xl px-6 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white rounded-xl px-6 py-2 text-sm font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all"
            >
              Update Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
