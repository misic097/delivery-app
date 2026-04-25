import React from "react";
import { Check, CornerUpRight, X } from "lucide-react";
import StatusBadge from "./StatusBadge.jsx";

export default function PackageCard({ pkg, onStatusChange, onDeletePackage }) {
  return (
    <article className="package-card">
      <button
        className="delete-top"
        type="button"
        title="Remove package"
        onClick={() => onDeletePackage(pkg.id)}
      >
        <X size={14} />
      </button>

      <div className="package-card__top">
        <div>
          <span className="barcode">{pkg.barcode}</span>
          <h3>{pkg.recipient_name}</h3>
        </div>

        <StatusBadge status={pkg.status} />
      </div>

      <div className="package-card__body">
        <p>{pkg.address}</p>
        <p>
          {pkg.city} · Section {pkg.section}
        </p>
      </div>

      <div className="action-row" aria-label={`Actions for ${pkg.barcode}`}>
        <button
          className="icon-button success"
          type="button"
          title="Delivered"
          onClick={() => onStatusChange(pkg.id, "delivered")}
        >
          <Check size={17} />
        </button>

        <button
          className="icon-button warning"
          type="button"
          title="Not delivered"
          onClick={() => onStatusChange(pkg.id, "not_delivered")}
        >
          <X size={17} />
        </button>

        <button
          className="icon-button info"
          type="button"
          title="Redirect"
          onClick={() => onStatusChange(pkg.id, "redirected")}
        >
          <CornerUpRight size={17} />
        </button>
      </div>
    </article>
  );
}