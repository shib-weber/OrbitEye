import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Polygon, 
  Circle, 
  useMap, 
  useMapEvents 
} from "react-leaflet";
import L from "leaflet";
import { 
  ShieldAlert, 
  FileDown, 
  CheckCircle2, 
  XCircle, 
  Satellite, 
  Camera, 
  Activity, 
  Search, 
  Eye, 
  Layers, 
  X, 
  Radio, 
  Check, 
  RefreshCw, 
  Compass, 
  Crosshair,
  Maximize2,
  Lightbulb,
  Wrench
} from "lucide-react";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const API_BASE = "http://localhost:8000/api";

function MapClickHandler({ onLocationChange }) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapFlyController({ center, zoom = 15 }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

function DraggablePin({ position, onLocationChange }) {
  const markerRef = useRef(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          onLocationChange(latLng.lat, latLng.lng);
        }
      },
    }),
    [onLocationChange]
  );

  return (
    <Marker draggable={true} eventHandlers={eventHandlers} position={position} ref={markerRef}>
      <Popup>
        <div className="text-slate-900 text-xs font-sans">
          <strong>Observation Aperture Target</strong><br />
          Drag anywhere to reposition.
        </div>
      </Popup>
    </Marker>
  );
}

export default function App() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchingPlace, setSearchingPlace] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [highlightedSpotId, setHighlightedSpotId] = useState(null);
  const [modalFlyFocus, setModalFlyFocus] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("Kolkata");
  const [mainFlyFocus, setMainFlyFocus] = useState(null);

  const [targetLocation, setTargetLocation] = useState({
    village_name: "Kolkata",
    ward_no: "Ward 45 / Central",
    latitude: 22.5726,
    longitude: 88.3639,
  });

  const fetchAlerts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/alerts`);
      setAlerts(res.data);
    } catch (err) {
      console.error("Failed to load alerts", err);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
        params: { lat, lon: lng, format: "json", addressdetails: 1 },
      });

      if (res.data && res.data.address) {
        const addr = res.data.address;
        const place = addr.village || addr.suburb || addr.neighbourhood || addr.city || addr.town || "Identified Territory";
        
        let ward = "Ward / Sector";
        if (addr.borough) ward = addr.borough;
        else if (addr.suburb) ward = `Zone: ${addr.suburb}`;
        else if (addr.postcode) ward = `Pin Zone: ${addr.postcode}`;
        else {
          const gridSector = Math.abs(Math.floor((lat + lng) * 100) % 50) + 1;
          ward = `Ward ${gridSector}`;
        }

        setTargetLocation({ village_name: place, ward_no: ward, latitude: lat, longitude: lng });
        setMainFlyFocus([lat, lng]);
      }
    } catch {
      setTargetLocation((prev) => ({ ...prev, latitude: lat, longitude: lng }));
      setMainFlyFocus([lat, lng]);
    }
  };

  const handleLocationUpdate = (lat, lng) => {
    reverseGeocode(parseFloat(lat.toFixed(5)), parseFloat(lng.toFixed(5)));
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchingPlace(true);
    try {
      const res = await axios.get(`https://photon.komoot.io/api/`, { params: { q: searchQuery, limit: 1 } });
      if (res.data?.features?.length > 0) {
        const [lon, lat] = res.data.features[0].geometry.coordinates;
        await reverseGeocode(parseFloat(lat.toFixed(5)), parseFloat(lon.toFixed(5)));
      } else {
        const nomRes = await axios.get(`https://nominatim.openstreetmap.org/search`, {
          params: { q: searchQuery, format: "json", limit: 1 },
        });
        if (nomRes.data?.length > 0) {
          const place = nomRes.data[0];
          await reverseGeocode(parseFloat(parseFloat(place.lat).toFixed(5)), parseFloat(parseFloat(place.lon).toFixed(5)));
        } else {
          alert(`Location "${searchQuery}" not found. Click anywhere on the map to pin it.`);
        }
      }
    } finally {
      setSearchingPlace(false);
    }
  };

  const handleConfirmAndScan = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/scan`, {
        village_name: targetLocation.village_name,
        ward_no: targetLocation.ward_no,
        latitude: targetLocation.latitude,
        longitude: targetLocation.longitude,
      });
      await fetchAlerts();
      setSelectedAlert(res.data);
      setModalFlyFocus([res.data.latitude, res.data.longitude]);
    } catch (err) {
      alert("Satellite anomaly pipeline failed. Verify backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    await axios.patch(`${API_BASE}/alerts/${id}/status?status=${status}`);
    fetchAlerts();
    if (selectedAlert?.id === id) setSelectedAlert((prev) => ({ ...prev, status }));
  };

  const handleCrackUpload = async (alertId, file) => {
    if (!file) return;
    setUploadingId(alertId);
    const data = new FormData();
    data.append("file", file);
    try {
      await axios.post(`${API_BASE}/alerts/${alertId}/crack-inspect`, data);
      const updated = await axios.get(`${API_BASE}/alerts`);
      setAlerts(updated.data);
      const matched = updated.data.find(a => a.id === alertId);
      if (matched) setSelectedAlert(matched);
    } finally {
      setUploadingId(null);
    }
  };

  const parseClusters = (issuesJson) => {
    try { 
      const parsed = JSON.parse(issuesJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch { 
      return []; 
    }
  };

  const openDossier = (alert) => {
    setSelectedAlert(alert);
    setHighlightedSpotId(null);
    setModalFlyFocus([alert.latitude, alert.longitude]);
  };

  const zoomToSpotInModal = (spot) => {
    if (spot?.exact_center) {
      setModalFlyFocus([spot.exact_center[0], spot.exact_center[1]]);
      setHighlightedSpotId(spot.cluster_id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 py-3.5 sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500/10 rounded-lg border border-sky-500/30 text-sky-400 shrink-0">
            <Radio size={20} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-wide flex flex-wrap items-center gap-2">
              OrbitEye <span className="text-[10px] sm:text-[11px] bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded border border-sky-500/30 font-medium">Risk Sentinel</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400 leading-tight">Multi-Date Sentinel-2 Ingestion • Live Map Verification</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs self-end sm:self-auto">
          <Activity size={14} className="text-emerald-400 animate-pulse" />
          <span className="text-slate-400">Active Queue:</span>
          <span className="font-bold text-amber-400">{alerts.filter(a => a.status === 'PENDING_VERIFICATION').length}</span>
        </div>
      </header>

      {/* Main Responsive Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* SECTION 1: Target Intake (Mobile: 1st | Desktop: Top Left) */}
        <div className="order-1 lg:order-none lg:col-span-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Compass size={16} className="text-sky-400" /> Target Territory Intake
              </h2>
              <span className="text-[9px] sm:text-[10px] text-sky-400 font-mono">Live Sync</span>
            </div>

            <form onSubmit={handleSearch} className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase font-medium">Search City / Town / Village</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="e.g. Kakdwip, Siliguri, Varanasi"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none transition"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={searchingPlace}
                  className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition shrink-0"
                >
                  <Search size={14} className={searchingPlace ? "animate-spin" : ""} /> Search
                </button>
              </div>
            </form>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5 sm:space-y-2">
              <div className="flex flex-wrap justify-between items-center text-xs gap-1">
                <span className="text-slate-500">Territory:</span>
                <span className="font-semibold text-slate-200 text-right">{targetLocation.village_name}</span>
              </div>
              <div className="flex flex-wrap justify-between items-center text-xs gap-1">
                <span className="text-slate-500">Jurisdiction Sector:</span>
                <span className="font-semibold text-amber-400 text-right">{targetLocation.ward_no}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-900 font-mono text-[10.5px] sm:text-[11px]">
                <span className="text-sky-400">{targetLocation.latitude.toFixed(5)}° N</span>
                <span className="text-sky-400 text-right">{targetLocation.longitude.toFixed(5)}° E</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmAndScan}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={15} /> Processing Multi-Date Scan...
                </>
              ) : (
                <>
                  <Check size={15} /> Confirm & Detect Exact Anomaly Spots
                </>
              )}
            </button>
          </div>
        </div>

        {/* SECTION 2: Map Canvas (Mobile: 2nd | Desktop: Right Column, Rows 1-2) */}
        <div className="order-2 lg:order-none lg:col-span-7 lg:row-span-2">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 sm:p-5 shadow-xl flex flex-col h-[380px] sm:h-[450px] lg:h-full lg:min-h-[560px] relative">
            <div className="flex flex-wrap justify-between items-center mb-2.5 sm:mb-3 gap-1">
              <h2 className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Layers size={16} className="text-sky-400" /> Geospatial Anomaly Observation Canvas
              </h2>
              <span className="text-[10px] sm:text-xs text-sky-400 font-mono">1.5 KM Radar Aperture</span>
            </div>

            <div className="flex-1 rounded-lg overflow-hidden border border-slate-800 relative z-0 min-h-[300px]">
              <MapContainer center={[targetLocation.latitude, targetLocation.longitude]} zoom={14} className="h-full w-full">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapFlyController center={mainFlyFocus || [targetLocation.latitude, targetLocation.longitude]} />
                <MapClickHandler onLocationChange={handleLocationUpdate} />

                <DraggablePin position={[targetLocation.latitude, targetLocation.longitude]} onLocationChange={handleLocationUpdate} />

                <Circle
                  center={[targetLocation.latitude, targetLocation.longitude]}
                  radius={450}
                  pathOptions={{ color: "#0284c7", fillColor: "#0284c7", fillOpacity: 0.06, dashArray: "4, 6" }}
                />

                {alerts.map((alert) => {
                  const clusters = parseClusters(alert.detected_issues);
                  return clusters.map((cluster, idx) => {
                    let latLngPositions = [];

                    if (cluster?.geojson?.coordinates?.[0]) {
                      latLngPositions = cluster.geojson.coordinates[0].map(([lon, lat]) => [lat, lon]);
                    } else {
                      const cLat = cluster?.exact_center?.[0] || alert.latitude;
                      const cLon = cluster?.exact_center?.[1] || alert.longitude;
                      latLngPositions = [
                        [cLat + 0.0006, cLon - 0.0006],
                        [cLat + 0.0006, cLon + 0.0006],
                        [cLat - 0.0006, cLon + 0.0006],
                        [cLat - 0.0006, cLon - 0.0006],
                      ];
                    }

                    const isHighPriority = (cluster?.confidence_score ?? alert.confidence_score) < 0.70;

                    return (
                      <Polygon
                        key={`${alert.id}-${cluster.cluster_id || idx}`}
                        positions={latLngPositions}
                        pathOptions={{
                          color: isHighPriority ? "#ef4444" : "#f59e0b",
                          fillColor: isHighPriority ? "#ef4444" : "#f59e0b",
                          fillOpacity: 0.40,
                          weight: 2,
                        }}
                      >
                        <Popup>
                          <div className="text-slate-900 text-xs font-sans space-y-1">
                            <strong className="text-rose-600 block">
                              Box #{cluster.cluster_id} — {cluster.sub_location_label || "Spot"}
                            </strong>
                            <div><strong>Anomaly:</strong> {cluster.issue}</div>
                            <div><strong>Footprint:</strong> {cluster.area_sq_meters.toLocaleString()} m²</div>
                            <button
                              onClick={() => openDossier(alert)}
                              className="mt-1 text-[11px] text-sky-600 underline font-semibold block"
                            >
                              Inspect Full Dossier + Map
                            </button>
                          </div>
                        </Popup>
                      </Polygon>
                    );
                  });
                })}
              </MapContainer>
            </div>
          </div>
        </div>

        {/* SECTION 3: Active Verification Queue (Mobile: 3rd | Desktop: Bottom Left) */}
        <div className="order-3 lg:order-none lg:col-span-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl">
            <h2 className="text-xs sm:text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <ShieldAlert size={16} className="text-amber-400" /> Map-Based Verification Queue
            </h2>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {alerts.length === 0 ? (
                <div className="text-xs text-slate-500 text-center py-6">No anomalies logged yet. Run a scan above.</div>
              ) : (
                alerts.map((item) => {
                  const clusters = parseClusters(item.detected_issues);
                  return (
                    <div key={item.id} className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-xs space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="font-semibold text-slate-200">{item.village_name} ({item.ward_no})</div>
                          <div className="text-amber-400 text-[11px] font-medium leading-snug">{item.change_type}</div>
                          <div className="text-sky-400 text-[10px] pt-0.5">
                            {clusters.length} Sub-Location Bounding Box(es)
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          item.confidence_score < 0.7 
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/30" 
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        }`}>
                          {Math.round(item.confidence_score * 100)}% Conf
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <button
                            onClick={() => openDossier(item)}
                            className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium text-[11px] bg-slate-900 px-2 py-1 rounded border border-slate-800"
                          >
                            <Eye size={12} /> View Dossier + Map
                          </button>
                          <a
                            href={`${API_BASE}/alerts/${item.id}/pdf`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-300 hover:text-white flex items-center gap-1 text-[11px] bg-slate-900 px-2 py-1 rounded border border-slate-800"
                          >
                            <FileDown size={12} /> PDF
                          </a>
                        </div>

                        {item.status === "PENDING_VERIFICATION" ? (
                          <div className="flex gap-2">
                            <button onClick={() => updateStatus(item.id, "VERIFIED_REAL")} className="text-emerald-400 hover:text-emerald-300" title="Confirm Real">
                              <CheckCircle2 size={16} />
                            </button>
                            <button onClick={() => updateStatus(item.id, "FALSE_POSITIVE")} className="text-rose-400 hover:text-rose-300" title="False Alarm">
                              <XCircle size={16} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] uppercase font-mono text-slate-500">{item.status}</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </main>

      {/* Interactive Split-Screen Dossier Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl max-w-6xl w-full p-4 sm:p-6 space-y-3 sm:space-y-4 shadow-2xl relative my-auto max-h-[96vh] sm:max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3 gap-2">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="p-2 bg-sky-500/10 rounded-lg border border-sky-500/30 text-sky-400 shrink-0">
                  <Satellite size={20} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white leading-snug">OrbitEye Evidence Dossier #{selectedAlert.id}</h3>
                  <p className="text-[10px] sm:text-xs text-slate-400">
                    {selectedAlert.village_name} ({selectedAlert.ward_no}) • {selectedAlert.latitude.toFixed(4)}°N, {selectedAlert.longitude.toFixed(4)}°E
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAlert(null)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Split Screen Container */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 flex-1 overflow-y-auto lg:overflow-hidden min-h-[300px]">
              
              {/* Left Column: Report, Hotspot Cards, AI Directives */}
              <div className="lg:col-span-6 space-y-3 overflow-visible lg:overflow-y-auto lg:pr-2">
                
                {/* Boxed Hotspots List with Click-to-Focus */}
                <div className="bg-slate-950 p-3 sm:p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex flex-wrap justify-between items-center gap-1">
                    <h4 className="text-[11px] sm:text-xs font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Crosshair size={14} className="text-rose-400" /> Physical Hotspots Inside Sector
                    </h4>
                    <span className="text-[9.5px] sm:text-[10px] text-slate-500">Tap card to focus map →</span>
                  </div>

                  <div className="space-y-2 max-h-[190px] sm:max-h-[220px] overflow-y-auto pr-1">
                    {parseClusters(selectedAlert.detected_issues).map((cluster) => {
                      const isHighlighted = highlightedSpotId === cluster.cluster_id;
                      const isHighPriority = cluster.confidence_score < 0.70;
                      const bbox = cluster.bounding_box || {};

                      return (
                        <div 
                          key={cluster.cluster_id} 
                          className={`p-2 sm:p-2.5 rounded-lg border text-xs space-y-1 transition cursor-pointer ${
                            isHighlighted 
                              ? "bg-slate-900 border-sky-500 shadow-md shadow-sky-950" 
                              : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                          }`}
                          onClick={() => zoomToSpotInModal(cluster)}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-semibold text-slate-200 flex items-center gap-1 text-[11px] sm:text-xs">
                              <Maximize2 size={12} className="text-sky-400 shrink-0" /> Spot #{cluster.cluster_id}: {cluster.issue}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                              isHighPriority 
                                ? "bg-rose-900/60 text-rose-300 border border-rose-700/50" 
                                : "bg-emerald-900/60 text-emerald-300 border border-emerald-700/50"
                            }`}>
                              {Math.round(cluster.confidence_score * 100)}% Conf
                            </span>
                          </div>

                          <div className="text-[10px] sm:text-[10.5px] text-sky-400 font-mono">
                            Footprint: {cluster.area_sq_meters.toLocaleString()} m² | BBox: [{bbox.north?.toFixed(3)}°N, {bbox.east?.toFixed(3)}°E]
                          </div>

                          <div className="text-[10px] sm:text-[10.5px] text-slate-300 bg-slate-950 p-1.5 rounded border border-slate-800/80 leading-relaxed">
                            {cluster.spectral_explanation}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* AI Inspector Diagnostics */}
                <div className="bg-slate-950 p-3 sm:p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-[11px] sm:text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb size={13} /> AI Municipal Inspector Root-Cause Diagnostics
                  </h4>
                  <p className="text-[11px] sm:text-[11.5px] text-slate-300 leading-relaxed bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                    {selectedAlert.ai_inspector_notes}
                  </p>

                  <h4 className="text-[11px] sm:text-xs font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-1.5 pt-1">
                    <Wrench size={13} /> Actionable Mitigation Plan
                  </h4>
                  <p className="text-[11px] sm:text-[11.5px] text-slate-300 leading-relaxed bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                    {selectedAlert.ai_mitigation_plan}
                  </p>
                </div>

                {/* Edge CV Upload */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex flex-wrap justify-between items-center gap-1.5">
                    <h4 className="text-[11px] sm:text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Camera size={13} /> On-Field Ground Truth Verification
                    </h4>
                    <label className="text-[10px] sm:text-[10.5px] bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 px-2 py-1 rounded cursor-pointer font-medium transition">
                      {uploadingId === selectedAlert.id ? "Analyzing..." : "Upload Photo"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingId === selectedAlert.id}
                        onChange={(e) => handleCrackUpload(selectedAlert.id, e.target.files[0])}
                      />
                    </label>
                  </div>

                  {selectedAlert.crack_severity ? (
                    <div className="text-[10.5px] sm:text-[11px] flex justify-between bg-slate-900 p-2 rounded border border-amber-500/30 text-amber-300">
                      <span>Ground Defect: {selectedAlert.crack_severity}</span>
                      <span className="font-mono">{selectedAlert.crack_density}% Surface Defect</span>
                    </div>
                  ) : (
                    <p className="text-[10px] sm:text-[10.5px] text-slate-500">Attach on-site photos to validate satellite spectral findings.</p>
                  )}
                </div>
              </div>

              {/* Right Column: Dedicated Synchronized GIS Map */}
              <div className="lg:col-span-6 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden relative flex flex-col min-h-[260px] sm:min-h-[350px]">
                <div className="bg-slate-900/90 px-3 py-1.5 border-b border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5 text-[11px] sm:text-xs">
                    <Layers size={13} className="text-sky-400" /> Synchronized Physical Hotspots
                  </span>
                  <span className="text-[9.5px] sm:text-[10px] text-sky-400 font-mono">Zoom: 15x</span>
                </div>

                <div className="flex-1 w-full h-full min-h-[220px] relative">
                  <MapContainer center={[selectedAlert.latitude, selectedAlert.longitude]} zoom={15} className="h-full w-full">
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <MapFlyController center={modalFlyFocus || [selectedAlert.latitude, selectedAlert.longitude]} zoom={16} />

                    <Marker position={[selectedAlert.latitude, selectedAlert.longitude]}>
                      <Popup>
                        <div className="text-slate-900 text-xs font-sans">
                          <strong>{selectedAlert.village_name} ({selectedAlert.ward_no})</strong><br />
                          Centroid Aperture Center
                        </div>
                      </Popup>
                    </Marker>

                    {parseClusters(selectedAlert.detected_issues).map((cluster, idx) => {
                      let latLngPositions = [];

                      if (cluster?.geojson?.coordinates?.[0]) {
                        latLngPositions = cluster.geojson.coordinates[0].map(([lon, lat]) => [lat, lon]);
                      } else {
                        const cLat = cluster?.exact_center?.[0] || selectedAlert.latitude;
                        const cLon = cluster?.exact_center?.[1] || selectedAlert.longitude;
                        latLngPositions = [
                          [cLat + 0.0006, cLon - 0.0006],
                          [cLat + 0.0006, cLon + 0.0006],
                          [cLat - 0.0006, cLon + 0.0006],
                          [cLat - 0.0006, cLon - 0.0006],
                        ];
                      }

                      const isHighlighted = highlightedSpotId === cluster.cluster_id;
                      const isHighPriority = cluster.confidence_score < 0.70;

                      return (
                        <Polygon
                          key={`modal-poly-${cluster.cluster_id || idx}`}
                          positions={latLngPositions}
                          pathOptions={{
                            color: isHighlighted ? "#38bdf8" : isHighPriority ? "#ef4444" : "#f59e0b",
                            fillColor: isHighlighted ? "#38bdf8" : isHighPriority ? "#ef4444" : "#f59e0b",
                            fillOpacity: isHighlighted ? 0.70 : 0.45,
                            weight: isHighlighted ? 3 : 2,
                          }}
                        >
                          <Popup>
                            <div className="text-slate-900 text-xs font-sans space-y-1">
                              <strong className="text-rose-600 block">Spot #{cluster.cluster_id}</strong>
                              <div><strong>Type:</strong> {cluster.issue}</div>
                              <div><strong>Area:</strong> {cluster.area_sq_meters.toLocaleString()} m²</div>
                              <div><strong>Confidence:</strong> {Math.round(cluster.confidence_score * 100)}%</div>
                            </div>
                          </Popup>
                        </Polygon>
                      );
                    })}
                  </MapContainer>
                </div>
              </div>
            </div>

            {/* Modal Bottom Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center pt-2.5 sm:pt-2 border-t border-slate-800 gap-2 sm:gap-3 shrink-0">
              <a
                href={`${API_BASE}/alerts/${selectedAlert.id}/pdf`}
                target="_blank"
                rel="noreferrer"
                className="bg-sky-600 hover:bg-sky-500 text-white text-xs px-3 sm:px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg shadow-sky-900/30 transition text-center"
              >
                <FileDown size={14} /> Download PDF with Embedded Map
              </a>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => updateStatus(selectedAlert.id, "VERIFIED_REAL")}
                  className="flex-1 sm:flex-none bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-600/30 text-xs px-3 py-2 rounded-lg font-medium transition text-center"
                >
                  Confirm Real
                </button>
                <button
                  onClick={() => updateStatus(selectedAlert.id, "FALSE_POSITIVE")}
                  className="flex-1 sm:flex-none bg-rose-600/20 border border-rose-500/40 text-rose-400 hover:bg-rose-600/30 text-xs px-3 py-2 rounded-lg font-medium transition text-center"
                >
                  False Alarm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}