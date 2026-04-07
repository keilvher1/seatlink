"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { mockLibraries } from "@/lib/mock-data";
import { getCongestionColor, cn } from "@/lib/utils";
import { LibraryWithDistance, CongestionLevel } from "@/lib/types";

declare global {
  interface Window {
    kakao: any;
  }
}

export default function HomePage() {
  const [radius, setRadius] = useState(5);
  const [sortBy, setSortBy] = useState<"distance" | "seats">("distance");
  const [sheetOpen, setSheetOpen] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const sorted = useMemo(() => {
    const list = [...mockLibraries].filter((l) => l.distance <= radius);
    if (sortBy === "seats") list.sort((a, b) => b.totalAvailable - a.totalAvailable);
    else list.sort((a, b) => a.distance - b.distance);
    return list;
  }, [radius, sortBy]);

  const updateMarkers = useCallback((map: any, kakao: any, libs: LibraryWithDistance[]) => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const colorMap: Record<string, string> = {
      "\uc5ec\uc720": "#22c55e",
      "\ubcf4\ud1b5": "#f59e0b",
      "\ud63c\uc7a1": "#ef4444",
    };

    libs.forEach((lib) => {
      const color = colorMap[lib.congestionLevel] || "#3b82f6";
      const el = document.createElement("div");
      const link = document.createElement("a");
      link.href = "/library/" + lib.id;
      link.style.cssText = "text-decoration:none;display:flex;flex-direction:column;align-items:center;cursor:pointer;";

      const circle = document.createElement("div");
      circle.style.cssText = "width:48px;height:48px;background:" + color + ";border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:13px;border:3px solid white;box-shadow:0 4px 12px " + color + "66;transition:transform 0.2s;";
      circle.textContent = String(lib.totalAvailable);
      circle.onmouseover = () => { circle.style.transform = "scale(1.15)"; };
      circle.onmouseout = () => { circle.style.transform = "scale(1)"; };

      const arrow = document.createElement("div");
      arrow.style.cssText = "width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid white;margin-top:-2px;";

      const label = document.createElement("div");
      label.style.cssText = "background:white;padding:2px 8px;border-radius:8px;margin-top:2px;box-shadow:0 2px 8px rgba(0,0,0,0.1);white-space:nowrap;";
      const labelText = document.createElement("span");
      labelText.style.cssText = "font-size:11px;font-weight:600;color:#334155;";
      labelText.textContent = lib.name;
      label.appendChild(labelText);

      link.appendChild(circle);
      link.appendChild(arrow);
      link.appendChild(label);
      el.appendChild(link);

      const overlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(lib.lat, lib.lng),
        content: el,
        yAnchor: 1.2,
        map,
      });

      markersRef.current.push(overlay);
    });
  }, []);

  // Kakao Map init
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || !window.kakao?.maps) return;

      window.kakao.maps.load(() => {
        const center = new window.kakao.maps.LatLng(37.5665, 126.978);
        const map = new window.kakao.maps.Map(mapRef.current, {
          center,
          level: 5,
        });
        mapInstanceRef.current = map;

        // User location marker
        const dot = document.createElement("div");
        dot.style.cssText = "width:16px;height:16px;background:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 0 0 6px rgba(59,130,246,0.2), 0 0 12px rgba(59,130,246,0.4);";
        new window.kakao.maps.CustomOverlay({
          position: center,
          content: dot,
          yAnchor: 0.5,
          map,
        });

        updateMarkers(map, window.kakao, sorted);
      });
    };

    if (window.kakao?.maps) {
      initMap();
    } else {
      const t = setInterval(() => {
        if (window.kakao?.maps) { clearInterval(t); initMap(); }
      }, 300);
      return () => clearInterval(t);
    }
  }, []);

  // Update markers when sorted changes
  useEffect(() => {
    if (!mapInstanceRef.current || !window.kakao?.maps) return;
    updateMarkers(mapInstanceRef.current, window.kakao, sorted);
  }, [sorted, updateMarkers]);

  return (
    <div className="relative h-[calc(100vh-56px)] overflow-hidden">
      {/* Map */}
      <div className="absolute inset-0">
        <div ref={mapRef} id="kakao-map" className="w-full h-full" />

        {/* Radius filter */}
        <div className="absolute top-4 left-4 flex gap-2 z-10 animate-fade-in">
          {[1, 3, 5, 10].map((r, idx) => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className={cn(
                "px-4 py-2 text-sm font-semibold rounded-full backdrop-blur-md transition-all duration-300 transform",
                radius === r
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/40 scale-105"
                  : "glass text-slate-700 hover:shadow-lg hover:scale-105"
              )}
              style={{ transitionDelay: `${idx * 50}ms` }}
            >
              {r}km
            </button>
          ))}
        </div>

        {/* My location button */}
        <button
          className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-lg shadow-blue-500/20 flex items-center justify-center z-10 hover:bg-white transition-all transform hover:scale-110"
          onClick={() => {
            if (mapInstanceRef.current && window.kakao) {
              mapInstanceRef.current.setCenter(new window.kakao.maps.LatLng(37.5665, 126.978));
              mapInstanceRef.current.setLevel(5);
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
        {/* Handle */}
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

        {/* Header when open */}
        {sheetOpen && (
          <div className="px-6 pb-4 flex items-center justify-between border-b border-slate-200/50 animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold gradient-text">{"\ud83d\udccd"} 내 주변 도서관</span>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">{sorted.length}개</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "distance" | "seats")}
              className="text-sm font-medium text-slate-700 glass rounded-lg px-3 py-1.5 border-0 focus:ring-2 focus:ring-blue-500"
            >
              <option value="distance">거리순</option>
              <option value="seats">잔여좌석순</option>
            </select>
          </div>
        )}

        {/* Library list */}
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

// ============================
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
              const roomColor = getCongestionColor(room.congestionLevel);
              return (
                <div key={room.name} className="flex items-center gap-2 text-xs">
                  <span className="text-slate-600 font-medium w-20 truncate">{room.name}</span>
                  <div className="flex-1 h-2.5 bg-slate-200/60 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500 shadow-sm", roomColor.bg, "congestion-bar-animated")}
                      style={{ width: `${room.congestionPercent}%` }}
                    />
                  </div>
                  <span className={cn("font-bold w-16 text-right", roomColor.text)}>
                    {room.availableSeats}/{room.totalSeats}
                  </span>
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
  return (
    <span className="px-2.5 py-0.5 bg-slate-200/60 text-slate-700 text-[10px] font-bold rounded-full">
      {children}
    </span>
  );
}
