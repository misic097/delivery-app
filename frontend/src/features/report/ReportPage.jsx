import React, { useMemo, useState } from "react";

export default function ReportPage({ processedPackages }) {
  const stats = useMemo(() => {
    const delivered = processedPackages.filter((pkg) => pkg.status === "delivered");
    const notDelivered = processedPackages.filter((pkg) => pkg.status === "not_delivered");
    const redirected = processedPackages.filter((pkg) => pkg.status === "redirected");

    const uniqueStops = new Set(
      processedPackages.map((pkg) => `${pkg.address}-${pkg.city}`)
    );

    return {
      total: processedPackages.length,
      delivered: delivered.length,
      notDelivered: notDelivered.length,
      redirected: redirected.length,
      stops: uniqueStops.size,
      deliveredList: delivered,
      notDeliveredList: notDelivered,
      redirectedList: redirected
    };
  }, [processedPackages]);

  function handleFinishShift() {
    const confirmFinish = window.confirm("Ispisati report i završiti smjenu?");
    if (!confirmFinish) return;

    window.print();

    setTimeout(() => {
      localStorage.removeItem("scanned-packages");
      localStorage.removeItem("processed-packages");
      window.location.reload();
    }, 700);
  }

  return (
    <div className="page-stack report-page">
      <section className="toolbar-panel">
        <div>
          <h2>Daily Report</h2>
          <p>Summary of packages processed today.</p>
        </div>
      </section>

      <div className="report-grid">
        <div className="report-card">
          <h3>Total packages</h3>
          <p>{stats.total}</p>
        </div>

        <div className="report-card green">
          <h3>Delivered</h3>
          <p>{stats.delivered}</p>
        </div>

        <div className="report-card red">
          <h3>Not delivered</h3>
          <p>{stats.notDelivered}</p>
        </div>

        <div className="report-card blue">
          <h3>Redirected</h3>
          <p>{stats.redirected}</p>
        </div>

        <div className="report-card">
          <h3>Stops / addresses</h3>
          <p>{stats.stops}</p>
        </div>
      </div>

      <section className="report-details">
        <ReportList title="Delivered packages" packages={stats.deliveredList} />
        <ReportList title="Not delivered packages" packages={stats.notDeliveredList} />
        <ReportList title="Redirected packages" packages={stats.redirectedList} />
      </section>

      <div className="report-button-wrapper">
        <button className="primary-button danger" onClick={handleFinishShift}>
          Završi smjenu i ispiši report
        </button>
      </div>
    </div>
  );
}

function ReportList({ title, packages }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="report-list-card">
      <button className="report-list-header" type="button" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <span className="count">{packages.length}</span>
      </button>

      {open && (
        <>
          {packages.length === 0 ? (
            <p className="report-empty">No packages</p>
          ) : (
            <div className="report-table">
              {packages.map((pkg) => (
                <div className="report-row" key={pkg.id}>
                  <strong>{pkg.barcode}</strong>
                  <span>{pkg.recipient_name}</span>
                  <span>{pkg.address}</span>
                  <span>{pkg.city} · Section {pkg.section}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}