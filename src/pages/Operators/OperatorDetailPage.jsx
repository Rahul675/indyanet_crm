import React from "react";
import Card from "../../components/ui/Card";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import Badge from "../../components/ui/Badge";

export default function OperatorDetailPage({ operator, onBack }) {
  const badge = (status) =>
    status === "active" ? (
      <Badge tone="green">Active</Badge>
    ) : (
      <Badge tone="red">Inactive</Badge>
    );

  return (
    <div className="space-y-6">
      <Breadcrumbs active={`Operator ${operator.name}`} />

      <Card
        title={`Operator Details - ${operator.name}`}
        subtitle="Account information and access control"
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
            <strong>Name:</strong> {operator.name}
          </p>
          <p>
            <strong>Email:</strong> {operator.email}
          </p>
          <p>
            <strong>Role:</strong> {operator.role}
          </p>
          <p>
            <strong>Status:</strong> {badge(operator.status || "active")}
          </p>
          <p>
            <strong>Created At:</strong>{" "}
            {operator.createdAt
              ? new Date(operator.createdAt).toLocaleDateString()
              : "-"}
          </p>
          <p>
            <strong>Updated At:</strong>{" "}
            {operator.updatedAt
              ? new Date(operator.updatedAt).toLocaleDateString()
              : "-"}
          </p>
        </div>
      </Card>
    </div>
  );
}
