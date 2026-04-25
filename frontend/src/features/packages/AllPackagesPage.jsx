import React from "react";
import EmptyState from "../../components/EmptyState.jsx";
import PackageForm from "../../components/PackageForm.jsx";
import PackageGrid from "../../components/PackageGrid.jsx";

export default function AllPackagesPage({
  packages,
  loading,
  error,
  onAddPackage,
  onStatusChange,
  onDeletePackage,
  onClearScannedPackages
}) {
  return (
    <div className="page-stack">
      <section className="toolbar-panel">
        <div>
          <h2>Scanned Packages</h2>
          <p>Only packages scanned in this session are shown here.</p>
        </div>

        {packages.length > 0 && (
          <button className="secondary-button danger-text" onClick={onClearScannedPackages}>
            Clear scanned list
          </button>
        )}
      </section>

      <PackageForm onAddPackage={onAddPackage} />

      {error && <div className="alert">{error}</div>}

      {loading ? (
        <div className="loading">Loading packages...</div>
      ) : packages.length === 0 ? (
        <EmptyState title="No scanned packages yet. Scan a package first." />
      ) : (
        <PackageGrid
          packages={packages}
          emptyTitle="No scanned packages yet"
          onStatusChange={onStatusChange}
          onDeletePackage={onDeletePackage}
        />
      )}
    </div>
  );
}