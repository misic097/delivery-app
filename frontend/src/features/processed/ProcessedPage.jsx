import React, { useState } from "react";
import { Check, ChevronDown, ChevronRight, CornerUpRight, X } from "lucide-react";

export default function ProcessedPage({
  packages,
  loading,
  error,
  onDeletePackage
}) {
  const [openSection, setOpenSection] = useState(null);

  const delivered = packages.filter((p) => p.status === "delivered");
  const notDelivered = packages.filter((p) => p.status === "not_delivered");
  const redirected = packages.filter((p) => p.status === "redirected");

  function toggle(section) {
    setOpenSection((current) => (current === section ? null : section));
  }

  function Section({ title, icon, data, type }) {
    const isOpen = openSection === type;

    return (
      <div className={`processed-section ${isOpen ? "active" : "collapsed"}`}>
        <button
          className="processed-header"
          onClick={() => toggle(type)}
        >
          <div className="left">
            {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            {icon}
            <strong>{title}</strong>
          </div>

          <span className="count">{data.length}</span>
        </button>

        {isOpen && (
          <div className="processed-list">
            {data.map((pkg) => (
              <div className="processed-card" key={pkg.id}>
                <button
                  className="remove-btn"
                  onClick={() => onDeletePackage(pkg.id)}
                >
                  ×
                </button>

                <span className="barcode">{pkg.barcode}</span>
                <h4>{pkg.recipient_name}</h4>
                <p>{pkg.address}</p>
                <p>{pkg.city} · Section {pkg.section}</p>

                <span className={`status-badge ${pkg.status}`}>
                  {pkg.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="toolbar-panel">
        <div>
          <h2>Processed Packages</h2>
          <p>Click to expand each section.</p>
        </div>
      </section>

      {error && <div className="alert">{error}</div>}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="processed-accordion">
          <Section
            title="Delivered"
            icon={<Check size={18} />}
            data={delivered}
            type="delivered"
          />

          <Section
            title="Not delivered"
            icon={<X size={18} />}
            data={notDelivered}
            type="not_delivered"
          />

          <Section
            title="Redirected"
            icon={<CornerUpRight size={18} />}
            data={redirected}
            type="redirected"
          />
        </div>
      )}
    </div>
  );
}