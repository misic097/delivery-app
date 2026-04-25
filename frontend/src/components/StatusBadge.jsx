import React from "react";

const statusLabels = {
  pending: "Pending",
  delivered: "Delivered",
  not_delivered: "Not delivered",
  redirected: "Redirected"
};

export default function StatusBadge({ status }) {
  return <span className={`status-badge status-${status}`}>{statusLabels[status] || status}</span>;
}
