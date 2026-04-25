import React from "react";
import {
  Check,
  ClipboardList,
  CornerUpRight,
  MapPin,
  PackageCheck,
  PackageX,
  Route,
  X
} from "lucide-react";
import PackageGrid from "../../components/PackageGrid.jsx";

const reportCards = [
  { key: "total", label: "Total", icon: ClipboardList },
  { key: "pending", label: "Pending", icon: Route },
  { key: "delivered", label: "Delivered", icon: PackageCheck },
  { key: "not_delivered", label: "Not delivered", icon: PackageX },
  { key: "redirected", label: "Redirected", icon: CornerUpRight }
];

export default function SectionPage({
  packages,
  loading,
  error,
  stats,
  onStatusChange,
  onDeletePackage
}) {
  const [localPackages, setLocalPackages] = React.useState([]);

  React.useEffect(() => {
    setLocalPackages(packages);
  }, [packages]);

  const pendingPackages = localPackages.filter((pkg) => pkg.status === "pending");
  const nextPackage = pendingPackages[0];
  const upcomingPackages = pendingPackages.slice(1, 7);

  const handleStatusChange = (id, status) => {
    setLocalPackages((prev) =>
      prev.map((pkg) => (pkg.id === id ? { ...pkg, status } : pkg))
    );

    onStatusChange(id, status);
  };

  return (
    <div className="page-stack">
      <section className="daily-report">
        <div className="report-heading">
          <div>
            <p className="eyebrow">Daily report</p>
            <h2>Today&apos;s route overview</h2>
          </div>
          <span>{stats.pending} pending stops</span>
        </div>

        <div className="stats-grid">
          {reportCards.map((card) => {
            const Icon = card.icon;

            return (
              <div className="stat-card" key={card.key}>
                <Icon size={20} />
                <span>{card.label}</span>
                <strong>{stats[card.key]}</strong>
              </div>
            );
          })}
        </div>
      </section>

      {error && <div className="alert">{error}</div>}

      {loading ? (
        <div className="loading">Loading dashboard...</div>
      ) : nextPackage ? (
        <>
          <section className="next-delivery-card">
            <div className="next-delivery-header">
              <div>
                <p className="eyebrow">Next delivery</p>
                <h2>{nextPackage.recipient_name}</h2>
              </div>
              <span className="next-badge">NEXT</span>
            </div>

            <div className="next-delivery-info">
              <p>
                <MapPin size={18} />
                {nextPackage.address}, {nextPackage.city}
              </p>
              <p>Barcode: {nextPackage.barcode}</p>
              <p>Section: {nextPackage.section}</p>
            </div>

            <div className="next-actions">
              <button
                className="primary-button success"
                onClick={() => handleStatusChange(nextPackage.id, "delivered")}
              >
                <Check size={18} />
                Delivered
              </button>

              <button
                className="primary-button warning"
                onClick={() => handleStatusChange(nextPackage.id, "not_delivered")}
              >
                <X size={18} />
                Not delivered
              </button>

              <button
                className="primary-button info"
                onClick={() => handleStatusChange(nextPackage.id, "redirected")}
              >
                <CornerUpRight size={18} />
                Redirect
              </button>
            </div>
          </section>

          <section>
            <div className="section-title-row">
              <div>
                <p className="eyebrow">Upcoming stops</p>
                <h2>Next packages in route</h2>
              </div>
            </div>

            <PackageGrid
              packages={upcomingPackages}
              emptyTitle="No more upcoming packages"
              onStatusChange={handleStatusChange}
              onDeletePackage={onDeletePackage}
            />
          </section>
        </>
      ) : (
        <div className="success-panel">
          <h2>Route completed</h2>
          <p>No pending packages left for today.</p>
        </div>
      )}
    </div>
  );
}