import React, { useState } from "react";

// const API_URL = "http://localhost:9000/other-clients";
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/other-clients`;

export default function AddOtherClientModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    site: "",
    lanIp: "",
    remarks: "",
    macId: "",
    landlineWifiId: "",
    speedMbps: "",
    internet: "",
    installation: "",
    previousInternetBill: "",
    received: "",
    dispatch: "",
    date: "",
    reachedDay: "",
    installationDate: "",
    aSpoke: "",
    contactNo: "",
    dvrConnected: "",
    simNo: "",
    deviceName: "",
    deviceLicense: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();

    const cleanData = {
      ...form,
      speedMbps: form.speedMbps ? Number(form.speedMbps) : null,
      previousInternetBill: form.previousInternetBill
        ? Number(form.previousInternetBill)
        : null,
      date: form.date ? new Date(form.date).toISOString() : null,
      installationDate: form.installationDate
        ? new Date(form.installationDate).toISOString()
        : null,
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanData),
      });

      const json = await res.json();
      console.log("Response:", json);

      if (json.id || json.success) {
        alert("✅ Client added!");
        onAdd();
        onClose();
      } else {
        alert(json.message || "❌ Failed to add client");
      }
    } catch (err) {
      console.error("POST error:", err);
      alert("⚠️ Error adding client");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border shadow-2xl">
        <div className="sticky top-0 p-6 border-b flex justify-between items-center bg-white dark:bg-slate-900 rounded-t-2xl">
          <h2 className="text-lg font-semibold">Add Other Client</h2>
          <button
            onClick={onClose}
            className="text-slate-600 dark:text-slate-300 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-2 gap-4 p-6 text-sm"
        >
          {Object.entries(form).map(([key, value]) => (
            <div key={key}>
              <label className="block mb-1 font-medium capitalize">
                {key.replace(/([A-Z])/g, " $1")}
              </label>
              <input
                name={key}
                value={value}
                onChange={handleChange}
                className="border rounded-lg p-2 w-full"
                placeholder={`Enter ${key}`}
                required={key === "site"}
              />
            </div>
          ))}

          <div className="col-span-2 flex justify-end gap-3 pt-6">
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
