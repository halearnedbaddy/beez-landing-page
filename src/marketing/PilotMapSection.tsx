import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "./googleMaps";

const pilot = { lat: -4.0435, lng: 39.6682 };
const targets = [
  { title: "Africa", position: { lat: 7, lng: 8 } },
  { title: "India", position: { lat: 20.5937, lng: 78.9629 } },
  { title: "Beyond: Latin America", position: { lat: -14, lng: -52 } },
  { title: "Beyond: Southeast Asia", position: { lat: -2, lng: 118 } },
];

export default function PilotMapSection() {
  const canvas = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("Loading world map…");

  useEffect(() => {
    let disposed = false;
    const cleanups: Array<() => void> = [];
    loadGoogleMaps().then((maps) => {
      if (disposed || !canvas.current) return;
      const tokens = getComputedStyle(document.documentElement);
      const color = (name: string) => tokens.getPropertyValue(name).trim();
      const map = new maps.Map(canvas.current, {
        center: { lat: 8, lng: 25 }, zoom: 2, minZoom: 2,
        clickableIcons: false, streetViewControl: false, mapTypeControl: false,
        fullscreenControl: true, zoomControl: true, gestureHandling: "cooperative",
        backgroundColor: color("--map-water"),
        styles: [
          { elementType: "geometry", stylers: [{ color: color("--map-land") }] },
          { elementType: "labels.text.fill", stylers: [{ color: color("--map-label") }] },
          { elementType: "labels.text.stroke", stylers: [{ color: color("--map-water") }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: color("--map-water") }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: color("--map-road") }] },
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { featureType: "transit", stylers: [{ visibility: "off" }] },
        ],
      });
      const info = new maps.InfoWindow();
      const showInfo = (marker: google.maps.Marker, title: string, description: string) => {
        const content = document.createElement("div");
        content.className = "expansion-info";
        const heading = document.createElement("strong");
        heading.textContent = title;
        const detail = document.createElement("span");
        detail.textContent = description;
        content.append(heading, detail);
        info.setContent(content);
        info.open({ map, anchor: marker });
      };
      const pilotMarker = new maps.Marker({
        map, position: pilot, title: "Mombasa, Kenya — Kenya pilot, now",
        icon: { path: maps.SymbolPath.CIRCLE, scale: 9, fillColor: color("--y"), fillOpacity: 1, strokeColor: color("--y"), strokeWeight: 3 },
        label: { text: "Mombasa, Kenya", color: color("--ink"), fontSize: "12px", fontWeight: "600" },
      });
      const pilotClick = pilotMarker.addListener("click", () => showInfo(pilotMarker, "Mombasa, Kenya", "Kenya pilot, now"));
      cleanups.push(() => { pilotClick.remove(); pilotMarker.setMap(null); });
      targets.forEach((target) => {
        const marker = new maps.Marker({
          map, position: target.position, title: `${target.title} — Expansion target`,
          icon: { path: maps.SymbolPath.CIRCLE, scale: 6, fillColor: color("--map-target"), fillOpacity: 0.25, strokeColor: color("--map-target"), strokeWeight: 2 },
        });
        const line = new maps.Polyline({ map, path: [pilot, target.position], geodesic: true, strokeColor: color("--y"), strokeOpacity: 0.8, strokeWeight: 2 });
        const click = marker.addListener("click", () => showInfo(marker, target.title, "Expansion target — not an active location."));
        cleanups.push(() => { click.remove(); marker.setMap(null); line.setMap(null); });
      });
      const idle = maps.event.addListenerOnce(map, "idle", () => { if (!disposed) setStatus(""); });
      cleanups.push(() => { idle.remove(); info.close(); maps.event.clearInstanceListeners(map); });
    }).catch((error: unknown) => {
      if (!disposed) setStatus(error instanceof Error ? error.message : "The world map is unavailable.");
    });
    return () => { disposed = true; cleanups.forEach((cleanup) => cleanup()); };
  }, []);

  return (
    <section className="mission-map">
      <h3>Global Expansion Map &amp; Mission</h3>
      <div className="map">
        <div ref={canvas} className="world-map-canvas" role="region" aria-label="Interactive global expansion map, with Mombasa as the Kenya pilot" />
        {status && <p className="map-message" role="status">{status}</p>}
        <div className="legend">
          <span><i className="k now" aria-hidden="true" />Kenya pilot, now</span>
          <span><i className="k" aria-hidden="true" />Target: Africa, India and beyond</span>
        </div>
      </div>
      <p className="goal">The target: <b>every informal merchant, counted.</b></p>
    </section>
  );
}
