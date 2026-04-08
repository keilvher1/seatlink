"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { mockLibraries } from "@/lib/mock-data";
import { getCongestionColor, cn } from "@/lib/utils";
import { LibraryWithDistance } from "@/lib/types";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { Particles } from "@/components/magicui/particles";

export default function HomePage() {
  const [radius, setRadius] = useState(5);
  const [sortBy, setSortBy] = useState<"distance" | "seats">("distance");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [userPos, setUserPos] = useState<[number, number]>([36.5, 127.5]);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObjRef = useRef<any>(null);
  const markerLayerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);

  const sorted = useMemo(() => {
    const list = [...mockLibraries].filter((l) => l.distance <= radius);
    if (sortBy === "seats") list.sort((a, b) => b.totalAvailable - a.totalAvailable);
    else list.sort((a, b) => a.distance - b.distance);
    return list;
  }, [radius, sortBy]);

  const requestGeolocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserPos([latitude, longitude]);
          if (mapObjRef.current) {
            mapObjRef.current.setView([latitude, longitude], 12);
            updateUserMarker([latitude, longitude]);
          }
        },
        (error) => {
          console.log("Geolocation denied or unavailable:", error);
        }
      );
    }
  };

  const updateUserMarker = (pos: [number, number]) => {
    if (!mapObjRef.current || !userMarkerRef.current) return;
    userMarkerRef.current.setLatLng(pos);
  };

  useEffect(() => {
    if (!mapRef.current || mapObjRef.current) return;

    const initLeaflet = async () => {
      const L = (await import("leaflet")).default;
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, { center: userPos, zoom: 7, zoomControl: false });
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", { attribution: "", maxZoom: 19 }).addTo(map);
      L.control.zoom({ position: "topright" }).addTo(map);

      const userIcon = L.divIcon({
        html: '<div style="width:16px;height:16px;background:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 0 0 6px rgba(59,130,246,0.2),0 0 12px rgba(59,130,246,0.4);"></div>',
        className: "", iconSize: [16, 16], iconAnchor: [8, 8],
      });
      const userMarker = L.marker(userPos, { icon: userIcon }).addTo(map);
      userMarkerRef.current = userMarker;
      markerLayerRef.current = L.layerGroup().addTo(map);
      mapObjRef.current = map;
      updateMarkers(L);
      setTimeout(() => map.invalidateSize(), 100);
    };

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    initLeaflet();
    requestGeolocation();
  }, []);

  const updateMarkers = async (LParam?: any) => {
    const L = LParam || (await import("leaflet")).default;
    if (!markerLayerRef.current) return;
    markerLayerRef.current.clearLayers();

    const colorMap: Record<string, string> = {
      "\uC5EC\uC720": "#22c55e",
      "\uBCF4\uD1B5": "#f59e0b",
      "\uD63C\uC7A1": "#ef4444",
    };

    sorted.forEach((lib) => {
      const c = colorMap[lib.congestionLevel] || "#3b82f6";
      const icon = L.divIcon({
        html: '<a href="/library/' + lib.id + '" style="text-decoration:none;display:flex;flex-direction:column;align-items:center;">' +
          '<div style="width:44px;height:44px;background:' + c + ';border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:12px;border:3px solid white;box-shadow:0 3px 10px ' + c + '88;">' + lib.totalAvailable + '</div>' +
          '<div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:7px solid white;margin-top:-2px;"></div>' +
          '<div style="background:white;padding:1px 6px;border-radius:6px;margin-top:1px;box-shadow:0 1px 4px rgba(0,0,0,0.1);"><span style="font-size:10px;font-weight:600;color:#334155;">' + lib.name + '</span></div>' +
          '</a>',
        className: "", iconSize: [80, 70], iconAnchor: [40, 55],
      });
      L.marker([lib.lat, lib.lng], { icon }).addTo(markerLayerRef.current);
    });
  };

  useEffect(() => {
    if (!mapObjRef.current) return;
    updateMarkers();
  }, [sorted]);

  return (
    <div className="relative h-[calc(100vh-56px)] overflow-hidden">
      {/* Map */}
      <div className="absolute inset-0">
        <div ref={mapRef} id="map-container" className="w-full h-full z-0" />

        {/* Radius filter - Magic UI style */}
        <div className="absolute top-4 left-4 flex gap-2 z-[1000] animate-fade-in">
          {[1, 3, 5, 10].map((r, idx) => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className={cn(
                "px-4 py-2 text-sm font-semibold rounded-full backdrop-blur-md transition-all duration-300 transform",
                radius === r
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/40 scale-105 animate-glow-ring"
                  : "bg-white/80 backdrop-blur-md text-slate-700 hover:shadow-lg hover:scale-105 shadow-md"
              )}
              style={{ transitionDelay: `${idx * 50}ms` }}
            >
              {r}km
            </button>
          ))}
        </div>

        {/* My location button */}
        <button
          className="absolute bottom-28 right-4 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-lg shadow-blue-500/20 flex items-center justify-center z-[1000] hover:bg-white transition-all transform hover:scale-110 hover:shadow-blue-500/40"
          onClick={requestGeolocation}
        >
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06z" />
          </svg>
        </button>
      </div>

      {/* Bottom Sheet */}
      <div
        className={cn(
          "bottom-sheet transition-transform duration-500 ease-out",
          sheetOpen ? "translate-y-0" : "translate-y-[calc(100%-80px)]"
        )}
        style={{ height: "70vh" }}
      >
        <div
          className="cursor-grab active:cursor-grabbing pt-3 pb-2 hover:bg-slate-50/50 transition rounded-t-3xl"
          onClick={() => setSheetOpen(!sheetOpen)}
        >
          <div className="bottom-sheet-handle" />
          {!sheetOpen && (
            <div className="px-6 mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AnimatedShinyText className="text-base font-bold text-slate-800" shimmerWidth={80}>
                  {"\uD83D\uDCCD"} {"\uB0B4 \uC8FC\uBCC0 \uB3C4\uC11C\uAD00"}
                </AnimatedShinyText>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full animate-scale-in">{sorted.length}{"\uAC1D"}</span>
              </div>
              <span className="text-xs text-slate-400">{"\u2191"} {"\uC704\uB85C \uBC00\uC5B4 \uC5F4\uAE30"}</span>
            </div>
          )}
        </div>

        {sheetOpen && (
          <div className="px-6 pb-4 flex items-center justify-between border-b border-slate-200/50 animate-fade-in">
            <div className="flex items-center gap-3">
              <AnimatedShinyText className="text-xl font-bold gradient-text" shimmerWidth={120}>
                {"\uD83D\uDCCD"} {"\uB0B4 \uC8FC\uBCC0 \uB3C4\uC11C\uAD00"}
              </AnimatedShinyText>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">{sorted.length}{"\uAC1D"}</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "distance" | "seats")}
              className="text-sm font-medium text-slate-700 bg-white/80 backdrop-blur-md rounded-lg px-3 py-1.5 border border-slate-200 focus:ring-2 focus:ring-blue-500"
            >
              <option value="distance">{"\uAC70\uB9AC\uC21C"}</option>
              <option value="seats">{"\uC794\uC5EC\uC88C\uC11D\uC21C"}</option>
            </select>
          </div>
        )}

        <div className={cn("overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin", sheetOpen ? "h-[calc(70vh-120px)]" : "h-0 overflow-hidden")}>
          {sorted.map((lib, idx) => (
            <div key={lib.id} style={{ animationDelay: `${idx * 50}ms` }} className="animate-slide-up">
              <LibraryCard library={lib} />
            </div>
          ))}

          {sorted.length === 0 && (
            <div className="text-center py-12 text-slate-400 relative">
              <Particles className="absolute inset-0" quantity={20} color="#94a3b8" size={0.8} />
              <p className="text-5xl mb-3 animate-float">{"\uD83D\uDD0D"}</p>
              <p className="font-bold text-slate-600">{"\uBC18\uACBD"} {radius}{"km \uB0B4 \uB3C4\uC11C\uAD00\uC774 \uC5C6\uC2B5\uB2C8\uB2E4"}</p>
              <p className="text-sm mt-2 text-slate-500">{"\uAC80\uC0C9 \uBC18\uACBD\uC744 \uB113\uD600\uBCF4\uC138\uC694"}</p>
            </div>
          )}

          <ShimmerButton
            className="w-full py-4 text-lg rounded-2xl"
            shimmerColor="rgba(255,255,255,0.3)"
            background="linear-gradient(110deg, #2563eb, #4f46e5, #2563eb)"
          >
            <a href="/recommend" className="flex items-center justify-center gap-2 text-white">
              {"\uD83E\uDD16"} {"AI \uCD5C\uC801 \uB3C4\uC11C\uAD00 \uCD94\uCC9C\uBC1B\uAE30"}
            </a>
          </ShimmerButton>
        </div>
      </div>
    </div>
  );
}

function LibraryCard({ library }: { library: LibraryWithDistance }) {
  const color = getCongestionColor(library.congestionLevel);

  return (
    <a
      href={`/library/${library.id}`}
      className="block glass rounded-2xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300 p-4 group relative overflow-hidden"
    >
      {/* Subtle gradient hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
      <div className="flex gap-3 relative z-10">
        <div className={cn("w-2 rounded-full shrink-0 shadow-md", color.bg)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-[15px] text-slate-900 group-hover:text-blue-700 transition-colors">{library.name}</h3>
              <p className="text-xs text-slate-500 mt-1 truncate">{library.address}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold gradient-text">{library.distanceText}</p>
              <span className={cn("inline-block px-2.5 py-1 text-xs font-bold rounded-full mt-1 shadow-sm", color.light, color.text)}>
                {library.congestionLevel}
              </span>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {library.rooms.map((room) => {
              const rc = getCongestionColor(room.congestionLevel);
              return (
                <div key={room.name} className="flex items-center gap-2 text-xs">
                  <span className="text-slate-600 font-medium w-20 truncate">{room.name}</span>
                  <div className="flex-1 h-2.5 bg-slate-200/60 rounded-full overflow-hidden shadow-inner">
                    <div className={cn("h-full rounded-full transition-all duration-500 shadow-sm", rc.bg)} style={{ width: `${room.congestionPercent}%` }} />
                  </div>
                  <span className={cn("font-bold w-16 text-right", rc.text)}>{room.availableSeats}/{room.totalSeats}</span>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {library.nightOperation && <Tag>{"\uD83C\uDF19 \uC57C\uAC04"}</Tag>}
            {library.accessible && <Tag>{"\u267F \uC811\uADFC"}</Tag>}
            {library.reservable && <Tag>{"\uD83D\uDCDD \uC608\uC57D"}</Tag>}
            {library.wifi && <Tag>{"\uD83D\uDCF6 \uC640\uC774\uD30C\uC774"}</Tag>}
          </div>
        </div>
        <svg className="w-5 h-5 text-slate-300 shrink-0 mt-1 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </a>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="px-2.5 py-0.5 bg-slate-200/60 text-slate-700 text-[10px] font-bold rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors">{children}</span>;
}
