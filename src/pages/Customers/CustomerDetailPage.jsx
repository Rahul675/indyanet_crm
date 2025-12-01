import React, { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Breadcrumbs from "../../components/ui/Breadcrumbs";

export default function CustomerDetailPage({ customer, onBack }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (Array.isArray(customer.issues) && customer.issues.length > 0) {
      setIssues(customer.issues);
    } else {
      fetchIssues();
    }
  }, [customer]);

  async function fetchIssues() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/issues?customerId=${customer.id}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const data = Array.isArray(json)
        ? json
        : Array.isArray(json.data)
        ? json.data
        : Array.isArray(json.data?.data)
        ? json.data.data
        : [];

      setIssues(data);
    } catch (err) {
      console.error("Failed to fetch linked issues:", err);
      setError("Could not load issues for this customer.");
    } finally {
      setLoading(false);
    }
  }

  const badge = (status) =>
    status === "Resolved" ? (
      <Badge tone="green">Resolved</Badge>
    ) : (
      <Badge tone="amber">Pending</Badge>
    );

  const statusBadge = (s) =>
    s === "Active" ? (
      <Badge tone="green">Active</Badge>
    ) : (
      <Badge tone="red">Inactive</Badge>
    );

  return (
    <div className="space-y-6">
      <Breadcrumbs active={`Customer ${customer.fullName}`} />

      {/* 🧾 Customer Details */}
      <Card
        title={`Customer Details - ${customer.fullName}`}
        subtitle="Overview and linked account information"
        right={
          <button
            onClick={onBack}
            className="inline-flex items-center rounded-xl border px-3 py-2 text-sm"
          >
            ← Back
          </button>
        }
      >
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <p>
            <strong>Code:</strong> {customer.customerCode}
          </p>
          <p>
            <strong>Name:</strong> {customer.fullName}
          </p>
          <p>
            <strong>Contact:</strong> {customer.contactNumber}
          </p>
          <p>
            <strong>Plan:</strong> {customer.planType}
          </p>
          <p>
            <strong>Status:</strong> {statusBadge(customer.connectionStatus)}
          </p>
          <p>
            <strong>Installed On:</strong>{" "}
            {new Date(customer.installDate).toLocaleDateString()}
          </p>
          {/* 🧩 New fields */}
          {customer.lastRechargeDate && (
            <p>
              <strong>Last Recharge:</strong>{" "}
              {new Date(customer.lastRechargeDate).toLocaleDateString()}
            </p>
          )}
          {customer.expiryDate && (
            <p>
              <strong>Expiry Date:</strong>{" "}
              {new Date(customer.expiryDate).toLocaleDateString()}
            </p>
          )}
          <p>
            <strong>Total Recharges:</strong> {customer.totalRecharges ?? 0}
          </p>
          <p>
            <strong>Total Spent:</strong> ₹
            {customer.totalSpent?.toFixed(2) ?? "0.00"}
          </p>
          <p>
            <strong>Created On:</strong>{" "}
            {new Date(customer.createdAt).toLocaleDateString()}
          </p>
          <p>
            <strong>Last Updated:</strong>{" "}
            {new Date(customer.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </Card>

      {/* 🧾 Linked Issues */}
      <Card
        title={`Linked Issues (${issues.length})`}
        subtitle="All complaints for this customer"
      >
        {loading ? (
          <p className="p-4 text-center text-slate-500">Loading issues...</p>
        ) : error ? (
          <p className="p-4 text-center text-red-500">{error}</p>
        ) : issues.length > 0 ? (
          <div className="overflow-auto border rounded-2xl dark:border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 dark:bg-slate-900">
                <tr>
                  {[
                    "Issue ID",
                    "Category",
                    "Description",
                    "Status",
                    "Assignee",
                    "Created Date",
                  ].map((h) => (
                    <th key={h} className="text-left font-semibold px-3 py-2">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {issues.map((i) => (
                  <tr
                    key={i.id}
                    className="border-t hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    <td className="px-3 py-2 font-mono">{i.id}</td>
                    <td className="px-3 py-2">{i.category}</td>
                    <td className="px-3 py-2">{i.description}</td>
                    <td className="px-3 py-2">{badge(i.status)}</td>
                    <td className="px-3 py-2">{i.assignee || "-"}</td>
                    <td className="px-3 py-2">
                      {new Date(i.createdDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-500 text-sm italic p-4">
            No issues found for this customer.
          </p>
        )}
      </Card>
    </div>
  );
}
