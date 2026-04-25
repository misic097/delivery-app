import React from "react";
import EmptyState from "./EmptyState.jsx";
import PackageCard from "./PackageCard.jsx";

export default function PackageGrid({ packages, emptyTitle, onStatusChange, onDeletePackage }) {
  if (packages.length === 0) {
    return <EmptyState title={emptyTitle} />;
  }

  return (
    <div className="package-grid">
      {packages.map((pkg) => (
        <PackageCard
          key={pkg.id}
          pkg={pkg}
          onStatusChange={onStatusChange}
          onDeletePackage={onDeletePackage}
        />
      ))}
    </div>
  );
}
