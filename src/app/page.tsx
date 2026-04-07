"use client";

import { useState, useMemo } from "react";
import { mockLibraries } from "@/lib/mock-data";
import { getCongestionColor, cn } from "@/lib/utils";
import { LibraryWithDistance, CongestionLevel } from "@/lib/types";

export default function HomePage() {
  const [radius, setRadius] = useState(5);
  const [sortBy, setSortBy] = useState<"distance" | "seats">("distance");
  const [sheetOpen, setSheetOpen] = useState(true);

  const sorted = useMemo(() => {
    const list = [...mockLibraries].filter((l) => l.distance <= radius);
    if (sortBy === "seats") list.sort((a, b) => b.totalAvailable - a.totalAvailable);
    else list.sort((a, b) => a.distance - b.distance);
    return list;
  }, [radius, sortBy]);

  return (
    <div className="relative h-[calc(100vh-56px)] overflow-hidden">
      {/* ====== 지도 영역 ====== */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100">
        {/* 카카오맵 자리 */}
        <div id="kakao-map" className="w-full h-full" />

        {/* 지도 오버레이: 목업 마커들 */}
        <MapMarkers libraries={sorted} />

        {/* 지도 오버레이: 반경 필터 */}
        <div className="absolute top-6 left-4 flex gap-2 z-10 animate-fade-in">
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

        {/* 내 위치 버튼 */}
        <button className="absolute top-6 right-4 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-lg shadow-blue-500/20 flex items-center justify-center z-10 hover:bg-white transition-all transform hover:scale-110 hover:shadow-xl hover:shadow-blue-500/40 animate-float">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06z" />
          </svg>
        </button>
      </div>

      {/* ====== 바텀 시트 ====== */}
      <div
        className={cn(
          "bottom-sheet",
          sheetOpen ? "translate-y-0" : "translate-y-[70%]"
        )}
        style={{ height: "70vh" }}
      >
        {/* 핸들 */}
        <div
          className="cursor-grab active:cursor-grabbing py-3 hover:scale-110 transition"
          onClick={() => setSheetOpen(!sheetOpen)}
        >
          <div className="bottom-sheet-handle" />
        </div>

        {/* 헤더 */}
        <div className="px-6 pb-4 flex items-center justify-between border-b border-slate-200/50">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold gradient-text">📍 내 주변 도서관</span>
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

        {/* 도서관 목록 */}
        <div className="overflow-y-auto h-[calc(70vh-120px)] px-4 py-3 space-y-3 scrollbar-thin">
          {sorted.map((lib, idx) => (
            <div key={lib.id} style={{ animationDelay: `${idx * 50}ms` }} className="animate-slide-up">
              <LibraryCard library={lib} />
            </div>
          ))}

          {sorted.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-5xl mb-3 animate-float">🔍</p>
              <p className="font-bold text-slate-600">반경 {radius}km 내 도서관이 없습니다</p>
              <p className="text-sm mt-2 text-slate-500">검색 반경을 넓혀보세요</p>
            </div>
          )}

          {/* AI 추천 버튼 */}
          <a
            href="/recommend"
            className="block w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-center font-bold rounded-2xl hover:shadow-2xl hover:shadow-blue-600/40 transition-all transform hover:scale-105 mt-4 text-lg"
          >
            🤖 AI 최적 도서관 추천받기
          </a>
        </div>
      </div>
    </div>
  );
}

// ============================
// 도서관 카드 컴포넌트
// ============================
function LibraryCard({ library }: { library: LibraryWithDistance }) {
  const color = getCongestionColor(library.congestionLevel);

  return (
    <a
      href={`/library/${library.id}`}
      className="block glass rounded-2xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300 p-4"
    >
      <div className="flex gap-3">
        {/* 혼잡도 인디케이터 */}
        <div className={cn("w-2 rounded-full shrink-0 shadow-md", color.bg)} />

        {/* 본문 */}
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

          {/* 열람실 현황 */}
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

          {/* 태그 */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {library.nightOperation && <Tag>🌙 야간</Tag>}
            {library.accessible && <Tag>♿ 접근</Tag>}
            {library.reservable && <Tag>📝 예약</Tag>}
            {library.wifi && <Tag>📶 와이파이</Tag>}
          </div>
        </div>

        {/* 화살표 */}
        <svg className="w-5 h-5 text-slate-300 shrink-0 mt-1 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

// ============================
// 지도 마커 (목업)
// ============================
function MapMarkers({ libraries }: { libraries: LibraryWithDistance[] }) {
  const positions = [
    { top: "30%", left: "40%" },
    { top: "55%", left: "65%" },
    { top: "25%", left: "20%" },
    { top: "45%", left: "50%" },
    { top: "60%", left: "30%" },
    { top: "35%", left: "75%" },
  ];

  const colorMap: Record<CongestionLevel, string> = {
    "여유": "bg-emerald-500 shadow-lg shadow-emerald-500/50",
    "보통": "bg-amber-500 shadow-lg shadow-amber-500/50",
    "혼잡": "bg-red-500 shadow-lg shadow-red-500/50",
  };

  return (
    <>
      {/* 사용자 위치 마커 */}
      <div
        className="absolute z-10 animate-pulse-glow"
        style={{ top: "42%", left: "48%" }}
      >
        <div className="relative w-5 h-5">
          <div className="w-5 h-5 bg-blue-600 rounded-full border-3 border-white shadow-lg shadow-blue-500/50 animate-pulse-glow" />
        </div>
      </div>

      {/* 도서관 마커들 */}
      {libraries.slice(0, 6).map((lib, i) => (
        <a
          key={lib.id}
          href={`/library/${lib.id}`}
          className="absolute z-10 marker-bounce"
          style={positions[i] || { top: "50%", left: "50%" }}
        >
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-xl border-3 border-white transition-all hover:scale-110",
                colorMap[lib.congestionLevel]
              )}
            >
              {lib.totalAvailable}
            </div>
            <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[10px] border-transparent border-t-white -mt-0.5" />
          </div>
        </a>
      ))}
    </>
  );
}
