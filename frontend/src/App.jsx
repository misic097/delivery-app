import React, { useEffect, useMemo, useState } from "react";
import { ClipboardList, PackageCheck, PackageSearch, ScanLine } from "lucide-react";
import ScannerPage from "./features/scanner/ScannerPage.jsx";
import ProcessedPage from "./features/processed/ProcessedPage.jsx";
import ReportPage from "./features/report/ReportPage.jsx";

const API_URL = "http://localhost:3000/api/packages";

export default function App() {
  const [activePage, setActivePage] = useState("scanner");
  const [packages, setPackages] = useState([]);

  const [scannedPackages, setScannedPackages] = useState(() => {
    const saved = localStorage.getItem("scanned-packages");
    return saved ? JSON.parse(saved) : [];
  });

  const [processedPackages, setProcessedPackages] = useState(() => {
    const saved = localStorage.getItem("processed-packages");
    return saved ? JSON.parse(saved) : [];
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem("scanned-packages", JSON.stringify(scannedPackages));
  }, [scannedPackages]);

  useEffect(() => {
    localStorage.setItem("processed-packages", JSON.stringify(processedPackages));
  }, [processedPackages]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(API_URL);

        if (!res.ok) {
          throw new Error("Unable to load packages");
        }

        const data = await res.json();
        setPackages(data);
      } catch {
        setError("Greška kod učitavanja paketa");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  function addScannedPackage(pkg) {
    setScannedPackages((prev) => {
      const exists = prev.find((p) => p.id === pkg.id);
      if (exists) return prev;
      return [pkg, ...prev];
    });
  }

  function removeScannedPackage(id) {
    setScannedPackages((prev) => prev.filter((pkg) => pkg.id !== id));
  }

  function removeProcessedPackage(id) {
    setProcessedPackages((prev) => prev.filter((pkg) => pkg.id !== id));
  }

  async function updateStatus(id, status) {
    setError("");

    try {
      const response = await fetch(`${API_URL}/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error("Unable to update package");
      }

      const updatedPackage = await response.json();

      setPackages((current) =>
        current.map((pkg) =>
          pkg.id === updatedPackage.id ? updatedPackage : pkg
        )
      );

      setScannedPackages((current) =>
        current.filter((pkg) => pkg.id !== id)
      );

      setProcessedPackages((current) => {
        const withoutDuplicate = current.filter((pkg) => pkg.id !== id);
        return [updatedPackage, ...withoutDuplicate];
      });
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  const scannedRoutes = useMemo(() => {
    const uniqueStops = new Set(
      scannedPackages.map((pkg) => `${pkg.address}-${pkg.city}`)
    );

    return {
      count: uniqueStops.size,
      reached: uniqueStops.size >= 85
    };
  }, [scannedPackages]);

  const pageTitle = {
    scanner: "All Packages",
    processed: "Processed Packages",
    report: "Daily Report"
  }[activePage];

  return (
    <div className="app-main">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Driver route control</p>
          <h1>{pageTitle}</h1>
        </div>

        <div className="header-actions">
          <div className={`search-pill ${scannedRoutes.reached ? "bonus" : ""}`}>
            <PackageSearch size={18} />
            <span>
              {scannedRoutes.reached
                ? `${scannedRoutes.count} scanned routes · BONUS +15€`
                : `${scannedRoutes.count} scanned routes`}
            </span>
          </div>

          <button
            className="secondary-button"
            type="button"
            onClick={() => setActivePage("scanner")}
          >
            <ScanLine size={17} />
            Scanner
          </button>

          <button
            className="secondary-button"
            type="button"
            onClick={() => setActivePage("processed")}
          >
            <PackageCheck size={17} />
            Processed
          </button>

          <button
            className="secondary-button"
            type="button"
            onClick={() => setActivePage("report")}
          >
            <ClipboardList size={17} />
            Report
          </button>
        </div>
      </section>

      {activePage === "scanner" && (
        <ScannerPage
          packages={packages}
          scannedPackages={scannedPackages}
          loading={loading}
          error={error}
          onScanPackage={addScannedPackage}
          onRemoveScannedPackage={removeScannedPackage}
          onStatusChange={updateStatus}
        />
      )}

      {activePage === "processed" && (
        <ProcessedPage
          packages={processedPackages}
          loading={loading}
          error={error}
          onStatusChange={updateStatus}
          onDeletePackage={removeProcessedPackage}
        />
      )}

      {activePage === "report" && (
        <ReportPage processedPackages={processedPackages} />
      )}
    </div>
  );
}