/* eslint-disable no-unused-vars */
import React, { useState } from "react";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/other-clients`;

export default function AddOtherClientModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    site: "",
    publicIp1: "",
    publicIp2: "",
    isp1: "",
    isp2: "",
    lanIp: "",
    remarks: "",
    macId: "",
    landlineWifiId: "",
    speedMbps: "",
    internetInstallation: "",
    prevBillReceived: "",
    dispatchDate: "",
    reachedDayDate: "",
    installationDate: "",
    aValue: "",
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
    const token = localStorage.getItem("auth_token");

    const cleanData = {
      ...form,
      // Date conversion for backend DateTime fields
      dispatchDate: form.dispatchDate
        ? new Date(form.dispatchDate).toISOString()
        : null,
      reachedDayDate: form.reachedDayDate
        ? new Date(form.reachedDayDate).toISOString()
        : null,
      installationDate: form.installationDate
        ? new Date(form.installationDate).toISOString()
        : null,
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cleanData),
      });

      const json = await res.json();
      if (res.ok) {
        alert("✅ Client added!");
        onAdd();
        onClose();
      } else {
        alert(json.message || "❌ Failed to add client");
      }
    } catch (err) {
      alert("⚠️ Error adding client");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border shadow-2xl">
        <div className="sticky top-0 p-6 border-b flex justify-between items-center bg-white dark:bg-slate-900 rounded-t-2xl z-10">
          <h2 className="text-lg font-semibold">Add Other Client</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-black text-2xl"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 text-sm"
        >
          {Object.keys(form).map((key) => (
            <div key={key}>
              <label className="block mb-1 font-medium text-slate-700 dark:text-slate-300">
                {key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
              </label>
              <input
                name={key}
                type={key.toLowerCase().includes("date") ? "date" : "text"}
                value={form[key]}
                onChange={handleChange}
                className="border dark:border-slate-700 dark:bg-slate-800 rounded-lg p-2 w-full"
                placeholder={`Enter ${key}`}
                required={key === "site"}
              />
            </div>
          ))}

          <div className="md:col-span-2 flex justify-end gap-3 pt-6 sticky bottom-0 bg-white dark:bg-slate-900 py-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-slate-900 text-white px-6 py-2 rounded-xl"
            >
              Save Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
