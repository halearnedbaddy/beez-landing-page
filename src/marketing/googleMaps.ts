declare global {
  interface Window {
    initBeezMap?: () => void;
  }
}

let mapsPromise: Promise<typeof google.maps> | undefined;

export function loadGoogleMaps(): Promise<typeof google.maps> {
  if (typeof google !== "undefined" && google.maps?.Map) return Promise.resolve(google.maps);
  if (mapsPromise) return mapsPromise;
  mapsPromise = new Promise((resolve, reject) => {
    const key = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"];
    const channel = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"];
    if (!key) {
      reject(new Error("The map connection is not available."));
      return;
    }
    const timeout = window.setTimeout(() => reject(new Error("The world map could not load. Please try again later.")), 20000);
    window.initBeezMap = () => {
      window.clearTimeout(timeout);
      if (typeof google !== "undefined" && google.maps?.Map) resolve(google.maps);
      else reject(new Error("The world map could not initialize."));
      delete window.initBeezMap;
    };
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&loading=async&callback=initBeezMap&channel=${encodeURIComponent(channel ?? "")}`;
    script.onerror = () => {
      window.clearTimeout(timeout);
      reject(new Error("The world map could not load. Please try again later."));
    };
    document.head.appendChild(script);
  });
  return mapsPromise;
}