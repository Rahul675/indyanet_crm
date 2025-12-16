import React, { useState } from "react";

// Use your environment variable for API base URL
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/loadshare`;

export default function AddLoadshareModal({ onClose, onAdd, clusterId }) {
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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();

    if (!clusterId) {
      alert("❌ clusterId is missing!");
      return;
    }

    const token = localStorage.getItem("auth_token");
    if (!token) {
      alert("❌ You are not logged in!");
      return;
    }

    const cleanData = {
      ...form,
      clusterId,
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
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ add token here
        },
        body: JSON.stringify(cleanData),
      });

      const json = await res.json();
      console.log("Server response:", json);

      if (res.status === 401) {
        alert("⚠️ Unauthorized! Please login again.");
        return;
      }

      if (json.success) {
        alert("✅ Record added successfully!");
        onAdd();
        onClose();
      } else {
        alert(json.message || "❌ Failed to create record");
      }
    } catch (err) {
      console.error("POST error:", err);
      alert("⚠️ Error saving record");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700">
        <div className="sticky top-0 flex justify-between items-center p-6 border-b bg-white dark:bg-slate-900 rounded-t-2xl">
          <h2 className="text-lg font-semibold">Add Loadshare Record</h2>
          <button
            onClick={onClose}
            className="text-xl font-bold text-slate-600 hover:text-black"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-2 gap-4 text-sm p-6"
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
              <label className="block mb-1 font-medium">{label}</label>
              <input
                name={key}
                type={
                  key.includes("Date")
                    ? "date"
                    : key.includes("Charges") || key === "validity"
                    ? "number"
                    : "text"
                }
                value={form[key]}
                onChange={handleChange}
                className="border rounded-lg p-2 w-full"
                required={["nameOfLocation", "address", "rtNumber"].includes(
                  key
                )}
              />
            </div>
          ))}

          <div className="col-span-2 flex justify-end gap-3 pt-6 sticky bottom-0 bg-white dark:bg-slate-900 border-t rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="border rounded-xl px-4 py-2 text-sm hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-slate-900 text-white rounded-xl px-4 py-2 text-sm hover:bg-slate-800"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
