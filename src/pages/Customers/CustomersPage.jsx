import React, { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import AddCustomerModal from "../../components/modals/AddCustomerModal";

const API_URL = "http://localhost:3000";

export default function CustomersPage({ setSelectedCustomer }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState("");

  // ✅ Fetch all customers from backend
  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_URL}/customers`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      // ✅ Handle wrapped response { data: { data: [...] } }
      const data = Array.isArray(json)
        ? json
        : Array.isArray(json.data)
        ? json.data
        : Array.isArray(json.data?.data)
        ? json.data.data
        : [];

      setCustomers(data);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      setError("Could not load customers from backend.");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }

  // ✅ After add, just refresh instead of pushing manually
  const handleAdd = async () => {
    await fetchCustomers();
    setShowAddModal(false);
  };

  const badge = (s) =>
    s === "Active" ? (
      <Badge tone="green">Active</Badge>
    ) : s === "Suspended" ? (
      <Badge tone="amber">Suspended</Badge>
    ) : (
      <Badge tone="red">Inactive</Badge>
    );

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(customers, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customers.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const imported = JSON.parse(evt.target.result);
      for (const customer of imported) {
        await fetch(`${API_URL}/customers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(customer),
        });
      }
      fetchCustomers();
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs active="customers" />
      <Card
        title="Customers"
        subtitle="Click any customer to view details and linked issues."
        right={
          <div className="flex gap-2 items-center relative">
            {/* ⋯ Menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm"
              >
                ⋯
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 border rounded-xl shadow-lg z-50">
                  <label
                    htmlFor="importFile"
                    className="block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    Import JSON
                  </label>
                  <input
                    type="file"
                    id="importFile"
                    className="hidden"
                    accept=".json"
                    onChange={handleImport}
                  />
                  <button
                    onClick={handleExport}
                    className="w-full text-left block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    Export JSON
                  </button>
                </div>
              )}
            </div>

            {/* Add Customer Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center rounded-xl border px-3 py-2 text-sm bg-slate-900 text-white"
            >
              + Add Customer
            </button>
          </div>
        }
      >
        {loading ? (
          <p className="p-4 text-center text-slate-500">Loading customers...</p>
        ) : error ? (
          <p className="p-4 text-center text-red-500">{error}</p>
        ) : (
          <div className="overflow-auto border rounded-2xl dark:border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 dark:bg-slate-900">
                <tr>
                  {[
                    "Code",
                    "Name",
                    "Contact",
                    "Plan",
                    "Status",
                    "Installed",
                  ].map((h) => (
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
                {customers.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
                    className="border-t cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    <td className="px-3 py-2 font-mono">{c.customerCode}</td>
                    <td className="px-3 py-2">{c.fullName}</td>
                    <td className="px-3 py-2">{c.contactNumber}</td>
                    <td className="px-3 py-2">{c.planType}</td>
                    <td className="px-3 py-2">{badge(c.connectionStatus)}</td>
                    <td className="px-3 py-2">
                      {c.installDate
                        ? new Date(c.installDate).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center text-slate-500 py-6">
                      No customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showAddModal && (
        <AddCustomerModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAdd}
        />
      )}
    </div>
  );
}
