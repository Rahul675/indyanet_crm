import React, { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import AddOperatorModal from "../../components/modals/AddOperatorModal";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function OperatorsPage({ setSelectedOperator }) {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchOperators();
  }, []);

  async function fetchOperators() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("auth_token");
      if (!token) throw new Error("No token found — please log in again.");

      const res = await fetch(`${API_URL}/auth/users`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ include JWT
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const data = Array.isArray(json)
        ? json
        : Array.isArray(json.data)
        ? json.data
        : Array.isArray(json.data?.data)
        ? json.data.data
        : [];

      const filtered = data.filter((u) => u.role?.toLowerCase() === "operator");
      setOperators(filtered);
    } catch (err) {
      console.error("Failed to fetch operators:", err);
      setError("Could not load operators from backend.");
      setOperators([]);
    } finally {
      setLoading(false);
    }
  }

  const handleAdd = async () => {
    await fetchOperators();
    setShowAddModal(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this operator?"))
      return;

    try {
      setDeletingId(id);
      const token = localStorage.getItem("auth_token");
      if (!token) throw new Error("No token found — please log in again.");

      const res = await fetch(`${API_URL}/operators/${id}?role=admin`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ include JWT
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);

      alert(data.data?.message || "Operator deleted successfully!");
      await fetchOperators();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Could not delete operator. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const badge = (status) =>
    status === "active" ? (
      <Badge tone="green">Active</Badge>
    ) : (
      <Badge tone="red">Inactive</Badge>
    );

  return (
    <div className="space-y-6">
      <Breadcrumbs active="operators" />
      <Card
        title="Operators"
        subtitle="Manage operator accounts. Click to view or delete."
        right={
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center rounded-xl border px-3 py-2 text-sm bg-slate-900 text-white"
          >
            + Add Operator
          </button>
        }
      >
        {loading ? (
          <p className="p-4 text-center text-slate-500">Loading operators...</p>
        ) : error ? (
          <p className="p-4 text-center text-red-500">{error}</p>
        ) : (
          <div className="overflow-auto border rounded-2xl dark:border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 dark:bg-slate-900">
                <tr>
                  {["Name", "Email", "Role", "Status", "Actions"].map((h) => (
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
                {operators.map((op) => (
                  <tr
                    key={op.id || op._id}
                    className="border-t hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    <td
                      className="px-3 py-2 cursor-pointer"
                      onClick={() => setSelectedOperator(op)}
                    >
                      {op.name}
                    </td>
                    <td
                      className="px-3 py-2 cursor-pointer"
                      onClick={() => setSelectedOperator(op)}
                    >
                      {op.email}
                    </td>
                    <td className="px-3 py-2 capitalize">{op.role}</td>
                    <td className="px-3 py-2">
                      {badge(op.status || "active")}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => handleDelete(op.id || op._id)}
                        disabled={deletingId === (op.id || op._id)}
                        className="text-red-600 hover:text-red-800 text-xs border border-red-200 hover:border-red-400 px-2 py-1 rounded-xl disabled:opacity-50"
                      >
                        {deletingId === (op.id || op._id)
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
                {operators.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-slate-500 py-6">
                      No operators found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showAddModal && (
        <AddOperatorModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAdd}
        />
      )}
    </div>
  );
}
