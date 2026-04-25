import React from "react";
import {
  Camera,
  Check,
  ChevronRight,
  CornerUpRight,
  MapPin,
  ScanSearch,
  X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import EmptyState from "../../components/EmptyState.jsx";

function getStreetNumber(address) {
  const match = String(address).match(/\d+/);
  return match ? Number(match[0]) : 999999;
}

function getStreetName(address) {
  return String(address).replace(/\d+/g, "").trim().toLowerCase();
}

export default function ScannerPage({
  packages,
  scannedPackages,
  loading,
  error,
  onScanPackage,
  onRemoveScannedPackage,
  onStatusChange
}) {
  const [barcode, setBarcode] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [scannerMessage, setScannerMessage] = useState("");
  const [selectedStopKey, setSelectedStopKey] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanTimerRef = useRef(null);

  const groupedStops = useMemo(() => {
    const groups = {};

    scannedPackages.forEach((pkg) => {
      const key = `${pkg.address}-${pkg.city}`;

      if (!groups[key]) {
        groups[key] = {
          key,
          address: pkg.address,
          city: pkg.city,
          section: pkg.section,
          packages: []
        };
      }

      groups[key].packages.push(pkg);
    });

    return Object.values(groups).sort((a, b) => {
      const streetCompare = getStreetName(a.address).localeCompare(getStreetName(b.address));
      if (streetCompare !== 0) return streetCompare;

      return getStreetNumber(a.address) - getStreetNumber(b.address);
    });
  }, [scannedPackages]);

  const selectedStop =
    groupedStops.find((stop) => stop.key === selectedStopKey) || groupedStops[0];

  useEffect(() => {
    if (!selectedStopKey && groupedStops.length > 0) {
      setSelectedStopKey(groupedStops[0].key);
    }

    if (selectedStopKey && !groupedStops.some((stop) => stop.key === selectedStopKey)) {
      setSelectedStopKey(groupedStops[0]?.key || null);
    }
  }, [groupedStops, selectedStopKey]);

  function addScannedPackage(code) {
    const query = code.trim().toLowerCase();
    if (!query) return;

    const foundPackage = packages.find((pkg) =>
      pkg.barcode.toLowerCase().includes(query)
    );

    if (!foundPackage) {
      setScannerMessage("No package matches that barcode.");
      return;
    }

    onScanPackage(foundPackage);
    setSelectedStopKey(`${foundPackage.address}-${foundPackage.city}`);
    setScannerMessage("Package added to scanned list.");
    setBarcode("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    addScannedPackage(barcode);
  }

  function handleStatusChange(id, status) {
    if (onStatusChange) {
      onStatusChange(id, status);
    }
  }

  function stopCamera() {
    if (scanTimerRef.current) {
      window.clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setCameraActive(false);
  }

  async function startCamera() {
    setScannerMessage("");

    if (!("BarcodeDetector" in window)) {
      setScannerMessage("Camera scanning is not supported. Type the barcode manually.");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setScannerMessage("Camera access is not available. Type the barcode manually.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false
      });

      streamRef.current = stream;
      setCameraActive(true);

      const detector = new window.BarcodeDetector({
        formats: ["code_128", "code_39", "ean_13", "ean_8", "qr_code", "upc_a", "upc_e"]
      });

      window.setTimeout(async () => {
        if (!videoRef.current || !streamRef.current) return;

        videoRef.current.srcObject = streamRef.current;
        await videoRef.current.play();

        scanTimerRef.current = window.setInterval(async () => {
          if (!videoRef.current) return;

          try {
            const barcodes = await detector.detect(videoRef.current);

            if (barcodes.length > 0) {
              addScannedPackage(barcodes[0].rawValue);
              stopCamera();
            }
          } catch {
            setScannerMessage("Could not read the camera image.");
          }
        }, 700);
      }, 0);
    } catch {
      setScannerMessage("Camera permission was blocked or no camera was found.");
      stopCamera();
    }
  }

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="page-stack">
      <section className="scanner-panel scanner-panel-clean">
        <div className="scanner-icon">
          <ScanSearch size={24} />
        </div>

        <div>
          <h2>Scanner</h2>
          <p>Scan with a phone camera or type a barcode manually.</p>
        </div>

        <form className="scanner-controls scanner-controls-clean" onSubmit={handleSubmit}>
          <input
            value={barcode}
            onChange={(event) => setBarcode(event.target.value)}
            placeholder="Enter or scan barcode"
            autoComplete="off"
          />

          <button className="scan-button" type="submit">
            Add Scan
          </button>

          {cameraActive ? (
            <button className="phone-scan-button danger-text" type="button" onClick={stopCamera}>
              <X size={16} />
              Stop
            </button>
          ) : (
            <button className="phone-scan-button" type="button" onClick={startCamera}>
              <Camera size={16} />
              Phone scan
            </button>
          )}
        </form>
      </section>

      {(cameraActive || scannerMessage) && (
        <section className="camera-panel">
          {cameraActive && <video ref={videoRef} className="scanner-video" muted playsInline />}
          {scannerMessage && <p>{scannerMessage}</p>}
        </section>
      )}

      {error && <div className="alert">{error}</div>}

      {loading ? (
        <div className="loading">Loading scanner...</div>
      ) : scannedPackages.length > 0 ? (
        <section>
          <div className="section-title-row">
            <div>
              <p className="eyebrow">Delivery</p>
              <h2>Scanned delivery stops</h2>
            </div>

            <span className="scan-count">
              {groupedStops.length} stops · {scannedPackages.length} packages
            </span>
          </div>

          <div className="delivery-layout">
            <div className="delivery-panel">
              <div className="delivery-panel-header">
                <p className="eyebrow">Selected address</p>
                <h3>{selectedStop?.address}</h3>
                <p>{selectedStop?.city} · Section {selectedStop?.section}</p>
              </div>

              {selectedStop?.packages
                .sort((a, b) => a.barcode.localeCompare(b.barcode))
                .map((pkg) => (
                  <article className="delivery-package-card" key={pkg.id}>
                    <button
                      className="delivery-remove"
                      type="button"
                      title="Remove from scanned list"
                      onClick={() => onRemoveScannedPackage(pkg.id)}
                    >
                      ×
                    </button>

                    <span className="barcode">{pkg.barcode}</span>
                    <h4>{pkg.recipient_name}</h4>

                    <div className="delivery-actions">
                      <button
                        className="icon-button success"
                        type="button"
                        title="Uručeno"
                        onClick={() => handleStatusChange(pkg.id, "delivered")}
                      >
                        <Check size={17} />
                      </button>

                      <button
                        className="icon-button warning"
                        type="button"
                        title="Nije uručeno"
                        onClick={() => handleStatusChange(pkg.id, "not_delivered")}
                      >
                        <X size={17} />
                      </button>

                      <button
                        className="icon-button info"
                        type="button"
                        title="Preusmjereno"
                        onClick={() => handleStatusChange(pkg.id, "redirected")}
                      >
                        <CornerUpRight size={17} />
                      </button>
                    </div>
                  </article>
                ))}
            </div>

            <div className="stops-panel">
              <p className="eyebrow">Scanned packages</p>

              <div className="stop-list compact">
                {groupedStops.map((stop) => (
                  <button
                    className={selectedStopKey === stop.key ? "stop-row active" : "stop-row"}
                    key={stop.key}
                    type="button"
                    onClick={() => setSelectedStopKey(stop.key)}
                  >
                    <div>
                      <strong>
                        <MapPin size={16} />
                        {stop.address}
                      </strong>
                      <span>{stop.city} · Section {stop.section}</span>
                    </div>

                    <span className="stop-count">
                      {stop.packages.length} paket{stop.packages.length > 1 ? "a" : ""}
                    </span>

                    <ChevronRight size={17} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : (
        <EmptyState title="Scan or type a barcode to begin" />
      )}
    </div>
  );
}