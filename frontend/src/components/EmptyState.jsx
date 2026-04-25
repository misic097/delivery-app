import React from "react";
import { PackageOpen } from "lucide-react";

export default function EmptyState({ title = "No packages found" }) {
  return (
    <div className="empty-state">
      <PackageOpen size={28} />
      <p>{title}</p>
    </div>
  );
}
