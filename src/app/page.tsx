"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { mockLibraries } from "@/lib/mock-data";
import { getCongestionColor, cn } from "@/lib/utils";
import { LibraryWithDistance } from "@/lib/types";

export default function HomePage() {
  const [radius, setRadius] = useState(5);
  const [sortBy, setSortBy] = useState<"distance" | "seats">("distance");
  const [sheetOpen, setSheetOpen] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObjRef = useRef<any>(null);
  const markerLayerRef = useRef<any>(null);

  const sorted = useMemo(() => {
    const list = [...mockLibraries].filter((l) => l.distance <= radius);
    if (sortBy === "seats") list.sort((a, b) => b.totalAvailable - a.totalAvailable);
    else list.sort((a, b) => a.distance - b.distance);
    return list;
  }, [radius, sortBy]);

  // Init map
  useEffect(() => {
    if (!mapRef.current || mapObjRef.current) return;

    const initLeaflet = async () => {
      const L = (await import("leaflet")).default;

      // Fix default icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: [37.5665, 126.978],
        zoom: 14,
        zoomControl: false,
      });

      // Modern styled tiles
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: "",
        maxZoom: 19,
      }).addTo(map);

      // Zoom control (top-right)
      L.control.zoom({ position: "topright" }).addTo(map);

      // User location marker
      const userIcon = L.divIcon({
        html: '<div style="width:16px;height:16px;background:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 0 0 6px rgba(59,130,246,0.2),0 0 12px rgba(59,130,246,0.4);"></div>',
        className: "",
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker([37.5665, 126.978], { icon: userIcon }).addTo(map);

      markerLayerRef.current = L.layerGroup().addTo(map);
      mapObjRef.current = map;

      updateMarkers(L);

      // Fix tile rendering after mount
      setTimeout(() => map.invalidateSize(), 100);
    };

    // Inject Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    initLeaflet();
  }, []);

  const updateMarkers = async (LParam?: any) => {
    const L = LParam || (await import("leaflet")).default;
    if (!markerLayerRef.current) return;
    markerLayerRef.current.clearLayers();

    const colorMap: Record<string, string> = {
      "\uc5ec\uc720": "#22c55e",
      "\ubcf4\ud1b5": "#f59e0b",
      "\ud63c\uc7a1": "#ef4444",
    };

    sorted.forEach((lib) => {
      const c = colorMap[lib.congestionLevel] || "#3b82f6";
      const icon = L.divIcon({
        html: '<a href="/library/' + lib.id + '" style="text-decoration:none;display:flex;flex-direction:column;align-items:center;">' +
          '<div style="width:44px;height:44px;background:' + c + ';border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:12px;border:3px solid white;box-shadow:0 3px 10px ' + c + '88;">' + lib.totalAvailable + '</div>' +
          '<div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:7px solid white;margin-top:-2px;"></div>' +
          '<div style="background:white;padding:1px 6px;border-radius:6px;margin-top:1px;box-shadow:0 1px 4px rgba(0,0,0,0.1);"><span style="font-size:10px;font-weight:600;color:#334155;">' + lib.name + '</span></div>' +
          '</a>',
        className: "",
        iconSize: [80, 70],
        iconAnchor: [40, 55],
      });
      L.marker([lib.lat, lib.lng], { icon }).addTo(markerLayerRef.current);
    });
  };

  // Update markers when sorted changes
  useEffect(() => {
    if (!mapObjRef.current) return;
    updateMarkers();
  }, [sorted]);

  return (
    <div className="relative h-[calc(100vh-56px)] overflow-hidden">
      {/* Map */}
      <div className="absolute inset-0">
        <div ref={mapRef} id="map-container" className="w-full h-full z-0" />

        {/* Radius filter */}
        <div className="absolute top-4 left-4 flex gap-2 z-[1000] animate-fade-in">
          {[1, 3, 5, 10].map((r, idx) => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className={cn(
                "px-4 py-2 text-sm font-semibold rounded-full backdrop-blur-md transition-all duration-300 transform",
                radius === r
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/40 scale-105"
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
          className="absolute bottom-28 right-4 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-lg shadow-blue-500/20 flex items-center justify-center z-[1000] hover:bg-white transition-all transform hover:scale-110"
          onClick={() => {
            if (mapObjRef.current) {
              mapObjRef.current.setView([37.5665, 126.978], 14);
            }
          }}
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
                <span className="text-base font-bold text-slate-800">{"\ud83d\udccd"} 내 주변 도서관</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">{sorted.length}개</span>
              </div>
              <span className="text-xs text-slate-400">{"\u2191"} 위로 밀어 열기</span>
            </div>
          )}
        </div>

        {sheetOpen && (
          <div className="px-6 pb-4 flex items-center justify-between border-b border-slate-200/50 animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold gradient-text">{"\ud83d\udccd"} 내 주변 도서관</span>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">{sorted.length}개</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "distance" | "seats")}
              className="text-sm font-medium text-slate-700 bg-white/80 backdrop-blur-md rounded-lg px-3 py-1.5 border border-slate-200 focus:ring-2 focus:ring-blue-500"
            >
              <option value="distance">거리순</option>
              <option value="seats">잔여좌석순</option>
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
            <div className="text-center py-12 text-slate-400">
              <p className="text-5xl mb-3 animate-float">{"\ud83d\udd0d"}</p>
              <p className="font-bold text-slate-600">반경 {radius}km 내 도서관이 없습니다</p>
              <p className="text-sm mt-2 text-slate-500">검색 반경을 넓혀보세요</p>
            </div>
          )}

          <a
            href="/recommend"
            className="block w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-center font-bold rounded-2xl hover:shadow-2xl hover:shadow-blue-600/40 transition-all transform hover:scale-105 mt-4 text-lg"
          >
            {"\ud83e\udd16"} AI 최적 도서관 추천받기
          </a>
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
      className="block glass rounded-2xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300 p-4"
    >
      <div className="flex gap-3">
        <div className={cn("w-2 rounded-full shrink-0 shadow-md", color.bg)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-[15px] text-slate-900">{library.name}</h3>
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
            {library.nightOperation && <Tag>{"\ud83c\udf19"} 야간</Tag>}
            {library.accessible && <Tag>{"\u267f"} 접근</Tag>}
            {library.reservable && <Tag>{"\ud83d\udcdd"} 예약</Tag>}
            {library.wifi && <Tag>{"\ud83d\udcf6"} 와이파이</Tag>}
          </div>
        </div>
        <svg className="w-5 h-5 text-slate-300 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </a>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="px-2.5 py-0.5 bg-slate-200/60 text-slate-700 text-[10px] font-bold rounded-full">{children}</span>;
}
